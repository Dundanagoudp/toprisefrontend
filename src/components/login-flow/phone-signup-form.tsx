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
  UserCredential,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { registerUser, registerUserWithPhone } from "@/service/auth-service";

export function PhoneSignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { showToast } = useToast();

  // form state
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(""); // only digits, 10
  const [verificationCode, setVerificationCode] = useState("");

  // flow + UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  // rate limiting state
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [requestCount, setRequestCount] = useState(0);

  // Rate limiting constants
  const MAX_REQUESTS_PER_HOUR = 5;
  const COOLDOWN_DURATION_MS = 5 * 60 * 1000; // 5 minutes
  const REQUEST_WINDOW_MS = 60 * 60 * 1000; // 1 hour

  // Helpers
  const isInCooldown = (): boolean =>
    cooldownEndTime ? Date.now() < cooldownEndTime : false;
  const getCooldownRemaining = (): number => {
    if (!cooldownEndTime) return 0;
    const remaining = Math.ceil((cooldownEndTime - Date.now()) / 1000);
    return Math.max(0, remaining);
  };
  const hasExceededRateLimit = (): boolean =>
    requestCount >= MAX_REQUESTS_PER_HOUR;

  // reset requestCount every hour and cleanup recaptcha on unmount
  useEffect(() => {
    const interval = setInterval(() => {
      setRequestCount(0);
      if (cooldownEndTime && Date.now() > cooldownEndTime)
        setCooldownEndTime(null);
    }, REQUEST_WINDOW_MS);

    return () => {
      clearInterval(interval);
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch {}
        delete (window as any).recaptchaVerifier;
      }
    };
  }, [cooldownEndTime]);

  // ensure only digits in phone input
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value.slice(0, 10));
  };

  useEffect(() => {
    return () => {
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch {}
        delete (window as any).recaptchaVerifier;
      }
    };
  }, []);

  const loadRecaptchaScript = () =>
    new Promise<void>((resolve, reject) => {
      if (typeof window !== "undefined" && (window as any).grecaptcha) {
        return resolve();
      }

      const existing = document.querySelector(
        'script[src^="https://www.google.com/recaptcha/"]'
      );
      if (existing) {
        const waitMax = 10000;
        const start = Date.now();
        const tick = () => {
          if ((window as any).grecaptcha) return resolve();
          if (Date.now() - start > waitMax)
            return reject(new Error("grecaptcha did not load in time"));
          setTimeout(tick, 200);
        };
        return tick();
      }

      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        const start = Date.now();
        const waitMax = 10000;
        const tick = () => {
          if ((window as any).grecaptcha) return resolve();
          if (Date.now() - start > waitMax)
            return reject(
              new Error("grecaptcha did not become available after script loaded")
            );
          setTimeout(tick, 200);
        };
        tick();
      };
      script.onerror = () => {
        reject(
          new Error(
            "Failed to load reCAPTCHA script (network/CSP/adblock?)."
          )
        );
      };
      document.head.appendChild(script);
    });

  const createVerifierAndSend = async (phoneE164: string, visible = false) => {
    if (typeof window === "undefined")
      throw new Error("Window required for reCAPTCHA");

    // Use the imported auth instance
    const authInstance = auth;
    if (!authInstance) throw new Error("Auth instance is undefined.");

    // ✅ CRITICAL FIX: Initialize auth.settings if it doesn't exist
    if (!(authInstance as any).settings) {
      console.log("Initializing auth.settings...");
      (authInstance as any).settings = {
        appVerificationDisabledForTesting: false,
      };
    }

    // Load grecaptcha script
    try {
      await loadRecaptchaScript();
    } catch (loadErr) {
      console.error("Failed to load grecaptcha:", loadErr);
      throw new Error(
        "reCAPTCHA script unavailable. Check AdBlock/CSP/network. Error: " +
          (loadErr as any)?.message
      );
    }

    if (!(window as any).grecaptcha) {
      throw new Error(
        "reCAPTCHA (grecaptcha) not available on window. Possibly blocked."
      );
    }

    // Clear previous verifier if exists
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {
        console.warn("Warning clearing previous recaptcha verifier:", e);
      }
      delete (window as any).recaptchaVerifier;
    }

    // Create RecaptchaVerifier - Use 'invisible' for automatic verification
    let verifier: RecaptchaVerifier;
    try {
      verifier = new RecaptchaVerifier(
        authInstance,
        "recaptcha-container",
        {
          size: "invisible", // Changed to invisible for automatic verification
          callback: (response: any) => {
            console.log("reCAPTCHA solved:", response);
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired");
          },
        }
      );
    } catch (err) {
      console.error("Failed to construct RecaptchaVerifier:", err);
      throw new Error("Failed to create reCAPTCHA verifier: " + (err as any)?.message);
    }

    // Store verifier globally
    (window as any).recaptchaVerifier = verifier;

    // Render the widget and wait for it
    try {
      const widgetId = await verifier.render();
      console.log("reCAPTCHA widget rendered with ID:", widgetId);
    } catch (renderErr) {
      console.error("Failed to render reCAPTCHA:", renderErr);
      throw new Error("Failed to render reCAPTCHA widget: " + (renderErr as any)?.message);
    }

    // Sign in with phone number
    try {
      console.log("Attempting to send OTP to:", phoneE164);
      const confirmation = await signInWithPhoneNumber(
        authInstance,
        phoneE164,
        verifier
      );
      console.log("OTP sent successfully");
      return confirmation;
    } catch (err: any) {
      console.error("signInWithPhoneNumber error:", err);
      // Clear the verifier on error
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch {}
        delete (window as any).recaptchaVerifier;
      }
      throw err;
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!/^\d{10}$/.test(phoneNumber)) {
        throw new Error("Enter a valid 10-digit phone number");
      }

      const phoneE164 = `+91${phoneNumber}`;

      // Create and render the verifier first
      const confirmation = await createVerifierAndSend(phoneE164, true);

      setConfirmationResult(confirmation);
      setStep("verify");
      setRequestCount((p) => p + 1);
      showToast("OTP sent to +91" + phoneNumber, "success");
    } catch (err: any) {
      console.error("sendOtp error", err);
      
      // More specific error handling
      if (err?.code === "auth/invalid-app-credential") {
        showToast("Please complete the reCAPTCHA verification", "error");
      } else if (err?.code === "auth/too-many-requests") {
        setCooldownEndTime(Date.now() + COOLDOWN_DURATION_MS);
        setRequestCount(MAX_REQUESTS_PER_HOUR);
        showToast("Too many requests — try again later.", "error");
      } else if (err?.code === "auth/captcha-check-failed") {
        showToast("reCAPTCHA verification failed. Please try again.", "error");
      } else {
        showToast(err?.message || "Failed to send OTP", "error");
      }
      
      // Clean up verifier on error
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch {}
        delete (window as any).recaptchaVerifier;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isInCooldown()) {
      const remaining = getCooldownRemaining();
      const minutes = Math.ceil(remaining / 60);
      showToast(
        `Please wait ${minutes} minute${
          minutes > 1 ? "s" : ""
        } before requesting another code`,
        "error"
      );
      return;
    }

    if (hasExceededRateLimit()) {
      showToast("Too many requests. Please wait before trying again.", "error");
      return;
    }

    if (!name.trim()) return showToast("Please enter your name", "error");
    if (!phoneNumber.trim())
      return showToast("Please enter your phone number", "error");
    if (!/^\d{10}$/.test(phoneNumber))
      return showToast("Please enter a valid 10-digit phone number", "error");

    await sendOtp();
  };

  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!verificationCode.trim())
      return showToast("Please enter the verification code", "error");
    if (!confirmationResult)
      return showToast("Please request a new verification code", "error");

    setLoading(true);
    setError(null);

    try {
      const result: UserCredential = await confirmationResult.confirm(
        verificationCode
      );

      if (result.user) {
        const firebaseIdToken = await result.user.getIdToken();
        const registerData = {
          firebase_token: firebaseIdToken,
          role: "User",
        };

        await registerUserWithPhone(firebaseIdToken,"user");

        showToast("Account created successfully!", "success");
        router.replace("/login");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      let message =
        err?.message || "Invalid verification code. Please try again.";

      if (err?.code === "auth/invalid-verification-code") {
        message = "Invalid verification code";
      } else if (err?.code === "auth/code-expired") {
        message = "Verification code has expired. Please request a new one.";
      }

      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (isInCooldown()) {
      const remaining = getCooldownRemaining();
      const minutes = Math.ceil(remaining / 60);
      showToast(
        `Please wait ${minutes} minute${
          minutes > 1 ? "s" : ""
        } before requesting another code`,
        "error"
      );
      return;
    }

    if (hasExceededRateLimit()) {
      showToast("Too many requests. Please wait before trying again.", "error");
      return;
    }

    setVerificationCode("");
    setConfirmationResult(null);
    setError(null);
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch {}
      delete (window as any).recaptchaVerifier;
    }

    await sendOtp();
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
                  Welcome <span className="text-primary-red">to</span> our
                  platform
                </h1>
                <p className="text-muted-foreground text-balance text-sm">
                  {step === "phone"
                    ? "Sign up with your phone number"
                    : "Enter the verification code sent to your phone"}
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
                    disabled={
                      loading || isInCooldown() || hasExceededRateLimit()
                    }
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
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
                      onChange={(e) =>
                        setVerificationCode(e.target.value.replace(/\D/g, ""))
                      }
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the 6-digit code sent to +91 {phoneNumber}
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Verifying..." : "Verify & Sign Up"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleResendCode}
                    disabled={
                      loading || isInCooldown() || hasExceededRateLimit()
                    }
                  >
                    {isInCooldown()
                      ? `Wait ${Math.ceil(getCooldownRemaining() / 60)}m`
                      : "Resend Code"}
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

      {/* reCAPTCHA container - hidden for invisible mode */}
      <div id="recaptcha-container" />
    </div>
  );
}