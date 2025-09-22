"use client";
import { useEffect, useState } from "react";
import { checkEmailVerification } from "@/service/auth-service";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("Checking verification...");
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const verified = await checkEmailVerification();
      if (verified) {
        setStatus("Email verified successfully!");
        // TODO: Save user profile to Firestore
        router.replace("/");
      } else {
        setStatus("Your email is not verified yet. Please check your inbox.");
      }
    };
    check();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>{status}</p>
    </div>
  );
}
