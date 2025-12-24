"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkUserExists } from "@/service/auth-service";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/slice/auth/authSlice";
import { useToast } from "@/components/ui/toast";
import { firebasePhoneAuth } from "@/service/firebase-auth-service";
import { loginWithFirebaseToken } from "@/service/phone-login-service";
import { ConfirmationResult } from "firebase/auth";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import Image from "next/image";
import LogoNoname from "../../../../public/assets/logo.png";
import { DynamicButton } from "@/components/common/button";
export function UserLoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  /**
   * Send OTP to phone number
   */
  const normalizePhone = (raw: string): string => {
    const digitsOnly = raw.replace(/\D/g, "");

    if (raw.startsWith("+")) {
      // already has country code
      return `+${digitsOnly}`;
    }

    if (digitsOnly.length === 10) {
      // assume India default
      return `+91${digitsOnly}`;
    }

    // fallback (let Firebase error out if invalid)
    return `+${digitsOnly}`;
  };

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      showToast("Please enter your phone number", "error");
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      showToast("Please enter a valid 10-digit phone number", "error");
      return;
    }

    const phoneE164 = normalizePhone(phoneNumber);

    setOtpLoading(true);
    try {
      // First, check if user exists
      console.log("Checking if user exists with phone:", phoneE164);
      
      const userExists = await checkUserExists(phoneE164);

      
      if (!userExists) {
        console.log("User doesn't exist, showing error toast");
        showToast("User doesn't exist. Please sign up first.", "error");
        setOtpLoading(false);
        return;
      }

      console.log("User exists, proceeding with OTP send");
      // If user exists, proceed with sending OTP
      const result = await firebasePhoneAuth.sendOTP(phoneE164);
      setConfirmationResult(result);
      setOtpSent(true);
      setResendTimer(60); // Start 60-second countdown
      showToast(`OTP sent to ${phoneE164}`, "success");
    } catch (err: any) {
      console.error("Error in handleSendOTP:", err);
      showToast(err.message || "Failed to send OTP", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  // handle resend OTP  
  const handleResendOTP = async () => {
    await handleSendOTP();
  };

  /**
   * Verify OTP and login
   */
  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) {
      showToast("Please enter the OTP", "error");
      return;
    }

    if (!confirmationResult) {
      showToast("No OTP session found. Please request OTP again", "error");
      return;
    }

    setOtpLoading(true);
    try {
      // Verify OTP with Firebase
      await firebasePhoneAuth.verifyOTP(confirmationResult, otpCode);

      // Get Firebase token
      const firebaseToken = await firebasePhoneAuth.getFirebaseToken();

      // Login with backend using Firebase token
      const response = await loginWithFirebaseToken(firebaseToken);

      if (response.success && response.data) {
        const { token, user } = response.data;
        const { role, last_login, _id } = user;

        // Convert role to lowercase for case-insensitive comparison
        const userRole = typeof role === "string" ? role.toLowerCase() : role;
        const adminRoles = [
          "fulfillment-admin",
          "fullfillment-staff",
          "admin",
          "super-admin",
        ];

        // Check if role is in adminRoles array
        if (adminRoles.includes(userRole)) {
          showToast(
            "Access denied. This login is for users only. Please use the admin login portal.",
            "error"
          );
          return;
        }

        // For regular users, proceed with login
        Cookies.set("role", role, {
          expires: 1,
          path: "/",
        });
        Cookies.set("token", token, { expires: 1, path: "/" });
        Cookies.set("lastlogin", last_login, {
          expires: 1,
          path: "/",
        });
        dispatch(loginSuccess({ token, role, last_login, _id }));

        // Handle regular user login
        if (role === "User") {
          router.replace("/");
          showToast("Successfully logged in with phone", "success");
        } else {
          showToast(
            "Your account type is not allowed to log in here.",
            "error"
          );
        }
      } else {
        showToast("Login failed", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to verify OTP", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  /**
   * Reset phone OTP form
   */
  const resetPhoneForm = () => {
    setOtpSent(false);
    setOtpCode("");
    setPhoneNumber("");
    setConfirmationResult(null);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">
                  Welcome <span className="text-primary-red">back</span>
                </h1>
                <p className="text-muted-foreground text-balance text-sm">
                  User Login - Sign In to your Account
                </p>
              </div>

              <div className="flex flex-col gap-6">
                {!otpSent ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        maxLength={10}
                      />
                      <p className="text-xs text-gray-500">
                        Enter 10-digit number without country code
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleSendOTP}
                      className="w-full"
                      disabled={otpLoading || !phoneNumber.trim()}
                    >
                      {otpLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            ></path>
                          </svg>
                          Sending OTP...
                        </span>
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <button
                        type="button"
                        onClick={resetPhoneForm}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </button>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        maxLength={6}
                      />
                      <p className="text-xs text-gray-500">
                        OTP sent to {phoneNumber}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleVerifyOTP}
                      className="w-full"
                      disabled={otpLoading || !otpCode.trim()}
                    >
                      {otpLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            ></path>
                          </svg>
                          Verifying...
                        </span>
                      ) : (
                        "Verify & Login"
                      )}
                    </Button>
                    <DynamicButton
                      text={resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : "Resend OTP"}
                      icon={<RefreshCcw className="h-4 w-4" />}
                      onClick={handleResendOTP}
                      disabled={otpLoading || resendTimer > 0}
                      variant="outline"
                      size="sm"
                      className="w-full text-primary-red"
                    />
                  </>
                )}
              </div>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or
                </span>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a
                  href="/signup"
                  className="underline underline-offset-4 text-primary-red hover:text-primary-red/80 transition-colors"
                >
                  Sign up
                </a>
              </div>
            </div>
          </div>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/login/login.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />

            {/* Centered logo */}
            {/* <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={LogoNoname}
                alt="Toprise logo"
                className="h-12 lg:h-16 w-auto transition-all duration-300 ease-in-out group-hover:opacity-90 group-hover:scale-105"
              />
            </div> */}
            
            <div className="absolute inset-0 flex items-center justify-center">
  <div className="bg-white p-4 rounded-lg shadow-md">
    <Image
      src={LogoNoname}
      alt="Toprise logo"
      className="h-12 lg:h-16 w-auto"
    />
  </div>
</div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
