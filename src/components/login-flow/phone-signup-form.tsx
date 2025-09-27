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
import { registerUser } from "@/service/auth-service";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cooldownEndTime]);

  // ensure only digits in phone input
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value.slice(0, 10));
  };
useEffect(() => {
  return () => {
    if ((window as any).recaptchaVerifier) {
      try { (window as any).recaptchaVerifier.clear(); } catch {}
      delete (window as any).recaptchaVerifier;
    }
  };
}, []);

const createVerifier = (visible = false): RecaptchaVerifier => {
  if (typeof window === "undefined") throw new Error("Window required for reCAPTCHA");

  // basic runtime validation of auth
  if (!auth || !(auth as any).app || !(auth as any).app.options) {
    throw new Error("Firebase Auth not initialized correctly (auth.app.options missing). Check lib/firebase.");
  }
  if ((auth as any).settings === undefined) {
    // this indicates the object is not the expected Auth instance
    throw new Error("Firebase Auth instance is invalid (auth.settings is undefined). Check for duplicate firebase installs or wrong import.");
  }

  // clear stale verifier
  if ((window as any).recaptchaVerifier) {
    try { (window as any).recaptchaVerifier.clear(); } catch {}
    delete (window as any).recaptchaVerifier;
  }

  const verifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    { size: visible ? "normal" : "invisible" }
  );

  (window as any).recaptchaVerifier = verifier;
  if (visible) {
    // show widget for debugging
    verifier.render().catch(() => {});
  }
  return verifier;
};

const sendOtp = async () => {
  try {
    const verifier = createVerifier(false); // set true while debugging
    const e164 = `+91${phoneNumber}`;
    const confirmation = await signInWithPhoneNumber(auth, e164, verifier);
    setConfirmationResult(confirmation);
    setStep("verify");
    showToast("OTP sent", "success");
  } catch (err: any) {
    console.error("sendOtp error", err);
    showToast(err?.message || "Failed to send OTP", "error");
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
        const registerData = {
          name: name.trim(),
          email: `${phoneNumber}@phone.local`,
          password: "phone_auth",
          phone_Number: phoneNumber,
          role: "User",
        };

        // call backend to create user record
        await registerUser(registerData);

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

    // reset local verification state and re-send
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

      {/* reCAPTCHA container */}
      <div id="recaptcha-container" />
    </div>
  );
}

// "use client";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useToast } from "@/components/ui/toast";
// import {
//   RecaptchaVerifier,
//   signInWithPhoneNumber,
//   ConfirmationResult,
// } from "firebase/auth";
// import { auth } from "@/lib/firebase";

// export function PhoneSignUpForm({
//   className,
//   ...props
// }: React.ComponentProps<"div">) {
//   const router = useRouter();
//   const { showToast } = useToast();

//   const [name, setName] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [verificationCode, setVerificationCode] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState<"phone" | "verify">("phone");
//   const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

//   // Setup reCAPTCHA once
//   const setupRecaptcha = () => {
//     if (!(window as any).recaptchaVerifier) {
//       (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
//         size: "invisible",
//       });
//     }
//     return (window as any).recaptchaVerifier;
//   };

//   // Step 1: send OTP
//   const handleSendCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!name.trim() || !phoneNumber.trim()) {
//       showToast("Please enter name and phone number", "error");
//       return;
//     }

//     try {
//       setLoading(true);
//       const verifier = setupRecaptcha();
//       const formatted = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;
//       const result = await signInWithPhoneNumber(auth, formatted, verifier);
//       setConfirmationResult(result);
//       setStep("verify");
//       showToast("OTP sent successfully", "success");
//     } catch (err: any) {
//       console.error("OTP error:", err);
//       showToast(err?.message || "Failed to send OTP", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Step 2: verify OTP + call backend signup
//   const handleVerifyCode = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!confirmationResult) {
//       showToast("Please request a code first", "error");
//       return;
//     }

//     try {
//       setLoading(true);
//       await confirmationResult.confirm(verificationCode);

//       // ✅ get Firebase token
//       const firebaseToken = await auth.currentUser?.getIdToken();
//       if (!firebaseToken) throw new Error("Failed to get Firebase token");

//       // ✅ Call backend signup API
//       const res = await fetch("http://localhost:3000/api/users/api/users/signupto", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           firebaseToken,
//           role: "User",
//           name: name.trim(),
//         }),
//       });

//       if (!res.ok) throw new Error("Signup failed");
//       showToast("Signup successful!", "success");
//       router.replace("/login");
//     } catch (err: any) {
//       console.error("Verification error:", err);
//       showToast(err?.message || "Verification failed", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={cn("flex flex-col gap-6", className)} {...props}>
//       <Card className="overflow-hidden p-0">
//         <CardContent className="grid p-0 md:grid-cols-2">
//           <form
//             className="p-6 md:p-8"
//             onSubmit={step === "phone" ? handleSendCode : handleVerifyCode}
//           >
//             <div className="flex flex-col gap-6">
//               <div className="flex flex-col items-center text-center">
//                 <h1 className="text-2xl font-bold">Sign Up</h1>
//                 <p className="text-muted-foreground text-sm">
//                   {step === "phone"
//                     ? "Sign up with your phone number"
//                     : "Enter the verification code"}
//                 </p>
//               </div>

//               {step === "phone" ? (
//                 <>
//                   <div className="grid gap-3">
//                     <Label htmlFor="name">Name</Label>
//                     <Input
//                       id="name"
//                       type="text"
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="grid gap-3">
//                     <Label htmlFor="phone">Phone</Label>
//                     <Input
//                       id="phone"
//                       type="tel"
//                       value={phoneNumber}
//                       onChange={(e) => setPhoneNumber(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <Button type="submit" className="w-full" disabled={loading}>
//                     {loading ? "Sending..." : "Send OTP"}
//                   </Button>
//                 </>
//               ) : (
//                 <>
//                   <div className="grid gap-3">
//                     <Label htmlFor="otp">OTP</Label>
//                     <Input
//                       id="otp"
//                       type="text"
//                       value={verificationCode}
//                       onChange={(e) => setVerificationCode(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <Button type="submit" className="w-full" disabled={loading}>
//                     {loading ? "Verifying..." : "Verify & Sign Up"}
//                   </Button>
//                 </>
//               )}
//             </div>
//           </form>
//           <div className="bg-muted relative hidden md:block">
//             <img src="/login/login.png" alt="Image" className="absolute inset-0 h-full w-full object-cover" />
//           </div>
//         </CardContent>
//       </Card>
//       {/* reCAPTCHA container */}
//       <div id="recaptcha-container"></div>
//     </div>
//   );
// }
