"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser, checkUserExists } from "@/service/auth-service";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginSuccess } from "@/store/slice/auth/authSlice";
import { useToast } from "@/components/ui/toast";
import { firebasePhoneAuth } from "@/service/firebase-auth-service";
import { loginWithFirebaseToken } from "@/service/phone-login-service";
import { ConfirmationResult } from "firebase/auth";
import { Phone, Mail, ArrowLeft } from "lucide-react";

const sidebarVisibilityConfig = {
  'Fulfillment-Admin': {
    hide: [""],
    show: [""],
  },
  'Fullfillment-staff': {
    hide: [""],
    show: [],
  },
  // Add more roles here as needed
};

export function UserLoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Phone OTP states
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const auth = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  /**
   * Handles the form submission for the login form.
   * @param e The React FormEvent
   * @returns A Promise that resolves if the login is successful, rejects if not
   */
 const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
): Promise<void> => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  try {
    const response = await loginUser({ email, password });
    if (response.data) {
      const { token, user } = response.data;
      const { role, last_login, _id } = user;

      // Convert role to lowercase for case-insensitive comparison
      const userRole = typeof role === 'string' ? role.toLowerCase() : role;
      const adminRoles = ["fulfillment-admin", "fullfillment-staff", "admin", "super-admin"];

      // Check if role is in adminRoles array
      if (adminRoles.includes(userRole)) {
        showToast("Access denied. This login is for users only. Please use the admin login portal.", "error");
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
        showToast("Successfully Login", "success");
      } else {
        // Handle other non-admin roles if needed
        showToast("Your account type is not allowed to log in here.", "error");
      }
    } else {
      showToast("Login failed", "error");
    }
  } catch (err: any) {
    const message =
      err?.response?.data?.message || err.message || "Login failed";
    showToast(`${message}`, "error");
  } finally {
    setLoading(false);
  }
};

  /**
   * Send OTP to phone number
   */
  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      showToast("Please enter your phone number", "error");
      return;
    }

    setOtpLoading(true);
    setError(null);

    try {
      // Check if user exists first
      const userExists = await checkUserExists(phoneNumber);
      if (!userExists) {
        showToast("User not found. Please create a new account.", "error");
        return;
      }

      // User exists, proceed with OTP
      const result = await firebasePhoneAuth.sendOTP(phoneNumber);
      setConfirmationResult(result);
      setOtpSent(true);
      showToast("OTP sent successfully to your phone", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to send OTP", "error");
    } finally {
      setOtpLoading(false);
    }
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
    setError(null);

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
        const userRole = typeof role === 'string' ? role.toLowerCase() : role;
        const adminRoles = ["fulfillment-admin", "fullfillment-staff", "admin", "super-admin"];

        // Check if role is in adminRoles array
        if (adminRoles.includes(userRole)) {
          showToast("Access denied. This login is for users only. Please use the admin login portal.", "error");
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
          showToast("Your account type is not allowed to log in here.", "error");
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
    setError(null);
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

              {/* Login Method Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('email');
                    resetPhoneForm();
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'email'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('phone');
                    setError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'phone'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  Phone
                </button>
              </div>

              {/* Email Login Form */}
              {loginMethod === 'email' && (
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
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
                          Logging in...
                        </span>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* Phone OTP Login Form */}
              {loginMethod === 'phone' && (
                <div className="flex flex-col gap-6">
                  {!otpSent ? (
                    <>
                      <div className="grid gap-3">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 9876543210"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                          Enter your phone number with country code
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
                    </>
                  )}
                </div>
              )}

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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
