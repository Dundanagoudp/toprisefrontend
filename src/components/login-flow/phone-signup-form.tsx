"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  UserCredential
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { registerUser } from "@/service/auth-service";

export function PhoneSignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [requestCount, setRequestCount] = useState(0);
  const { showToast } = useToast();

  // Rate limiting constants
  const MAX_REQUESTS_PER_HOUR = 5;
  const COOLDOWN_DURATION_MS = 5 * 60 * 1000; // 5 minutes cooldown
  const REQUEST_WINDOW_MS = 60 * 60 * 1000; // 1 hour window

  // Check if user is in cooldown period
  const isInCooldown = (): boolean => {
    return cooldownEndTime ? Date.now() < cooldownEndTime : false;
  };

  // Get remaining cooldown time in seconds
  const getCooldownRemaining = (): number => {
    if (!cooldownEndTime) return 0;
    const remaining = Math.ceil((cooldownEndTime - Date.now()) / 1000);
    return Math.max(0, remaining);
  };

  // Check if user has exceeded rate limit
  const hasExceededRateLimit = (): boolean => {
    // Simple check: if more than MAX_REQUESTS_PER_HOUR in the last hour
    return requestCount >= MAX_REQUESTS_PER_HOUR;
  };

  // Cleanup reCAPTCHA on component unmount and reset request count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Reset request count every hour
      setRequestCount(0);
      // Clear cooldown if expired
      if (cooldownEndTime && Date.now() > cooldownEndTime) {
        setCooldownEndTime(null);
      }
    }, REQUEST_WINDOW_MS);

    return () => {
      clearInterval(interval);
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        delete (window as any).recaptchaVerifier;
      }
    };
  }, [cooldownEndTime, REQUEST_WINDOW_MS]);

  // Helper function to handle phone number input - only allow digits
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setPhoneNumber(value);
  };

  // Initialize reCAPTCHA verifier
  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          console.log("reCAPTCHA solved");
        },
        'expired-callback': () => {
          console.log("reCAPTCHA expired");
          // Reset reCAPTCHA on expiry
          if ((window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier.clear();
            delete (window as any).recaptchaVerifier;
          }
        }
      });
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      // Setup reCAPTCHA
      setupRecaptcha();

      // Format phone number for Firebase (add +91 for India)
      const formattedPhone = `+91${phoneNumber}`;

      // Send verification code
      const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep("verify");
      showToast("Verification code sent to your phone", "success");

    } catch (err: any) {
      console.error("SMS sending error:", err);
      let message = err?.message || "Failed to send verification code. Please try again.";

      // Handle specific Firebase Auth errors
      if (err?.code === 'auth/invalid-phone-number') {
        message = "Invalid phone number format";
      } else if (err?.code === 'auth/too-many-requests') {
        message = "Too many requests. Please try again later.";
      } else if (err?.code === 'auth/invalid-app-credential') {
        message = "Authentication configuration error. Please check Firebase settings.";
      } else if (err?.code === 'auth/missing-phone-number') {
        message = "Phone number is required";
      } else if (err?.code === 'auth/quota-exceeded') {
        message = "SMS quota exceeded. Please try again later.";
      } else if (err?.code === 'auth/captcha-check-failed') {
        message = "reCAPTCHA verification failed. Please refresh and try again.";
      } else if (err?.code === 'auth/missing-app-credential') {
        message = "Firebase app not properly configured. Please check your setup.";
      }

      setError(message);
      showToast(message, "error");
      throw err; // Re-throw to allow caller to handle
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check rate limiting
    if (isInCooldown()) {
      const remaining = getCooldownRemaining();
      const minutes = Math.ceil(remaining / 60);
      showToast(`Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before requesting another code`, "error");
      return;
    }

    if (hasExceededRateLimit()) {
      showToast("Too many requests. Please wait before trying again.", "error");
      return;
    }

    // Basic validation
    if (!name.trim()) {
      showToast("Please enter your name", "error");
      return;
    }

    if (!phoneNumber.trim()) {
      showToast("Please enter your phone number", "error");
      return;
    }

    // Phone number validation - exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      showToast("Please enter a valid 10-digit phone number", "error");
      return;
    }

    try {
      await sendOtp();
      // Increment request count on successful request
      setRequestCount(prev => prev + 1);
    } catch (error) {
      // If too many requests error, set cooldown
      if (error instanceof Error && error.message.includes('too-many-requests')) {
        setCooldownEndTime(Date.now() + COOLDOWN_DURATION_MS);
        setRequestCount(MAX_REQUESTS_PER_HOUR); // Prevent further requests
      }
    }
  };

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      showToast("Please enter the verification code", "error");
      return;
    }

    if (!confirmationResult) {
      showToast("Please request a new verification code", "error");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verify the code
      const result: UserCredential = await confirmationResult.confirm(verificationCode);

      if (result.user) {
        // Create user account in your backend
        const registerData = {
          name: name.trim(),
          email: `${phoneNumber}@phone.local`, // Dummy email for backend compatibility
          password: "phone_auth", // Dummy password
          phone_Number: phoneNumber,
          role: "User"
        };

        await registerUser(registerData);

        showToast("Account created successfully!", "success");
        router.replace("/login"); // Redirect to login
      }

    } catch (err: any) {
      console.error("Verification error:", err);
      let message = err?.message || "Invalid verification code. Please try again.";

      if (err?.code === 'auth/invalid-verification-code') {
        message = "Invalid verification code";
      } else if (err?.code === 'auth/code-expired') {
        message = "Verification code has expired. Please request a new one.";
      }

      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    // Check rate limiting for resend
    if (isInCooldown()) {
      const remaining = getCooldownRemaining();
      const minutes = Math.ceil(remaining / 60);
      showToast(`Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before requesting another code`, "error");
      return;
    }

    if (hasExceededRateLimit()) {
      showToast("Too many requests. Please wait before trying again.", "error");
      return;
    }

    setStep("phone");
    setVerificationCode("");
    setConfirmationResult(null);
    setError(null);

    // Reset reCAPTCHA verifier for resend
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
      delete (window as any).recaptchaVerifier;
    }

    try {
      await sendOtp();
      // Increment request count on successful resend
      setRequestCount(prev => prev + 1);
    } catch (error) {
      // If too many requests error, set cooldown
      if (error instanceof Error && error.message.includes('too-many-requests')) {
        setCooldownEndTime(Date.now() + COOLDOWN_DURATION_MS);
        setRequestCount(MAX_REQUESTS_PER_HOUR);
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={step === "phone" ? handleSendCode : handleVerifyCode}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">
                  Welcome <span className="text-primary-red">to</span> our platform
                </h1>
                <p className="text-muted-foreground text-balance text-sm">
                  {step === "phone"
                    ? "Sign up with your phone number"
                    : "Enter the verification code sent to your phone"
                  }
                </p>
              </div>

              {step === "phone" ? (
                <>
                  <div className="grid gap-3">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="9876543210"
                      required
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      maxLength={10}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter 10-digit mobile number without country code
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || isInCooldown() || hasExceededRateLimit()}
                  >
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
                        Sending Code...
                      </span>
                    ) : isInCooldown() ? (
                      `Wait ${Math.ceil(getCooldownRemaining() / 60)}m`
                    ) : hasExceededRateLimit() ? (
                      "Too Many Requests"
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="grid gap-3">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      type="text"
                      placeholder="123456"
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the 6-digit code sent to +91 {phoneNumber}
                    </p>
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
                        Verifying...
                      </span>
                    ) : (
                      "Verify & Sign Up"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleResendCode}
                    disabled={loading || isInCooldown() || hasExceededRateLimit()}
                  >
                    {loading ? (
                      "Sending..."
                    ) : isInCooldown() ? (
                      `Wait ${Math.ceil(getCooldownRemaining() / 60)}m`
                    ) : hasExceededRateLimit() ? (
                      "Too Many Requests"
                    ) : (
                      "Resend Code"
                    )}
                  </Button>
                </>
              )}

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or
                </span>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="underline underline-offset-4 text-primary-red hover:text-primary-red/80 transition-colors"
                >
                  Log in
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/login/login.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      {/* reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
