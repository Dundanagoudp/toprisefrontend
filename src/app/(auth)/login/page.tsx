import Footer from "@/components/landingPage/module/Footer";
import { UserLoginForm } from "@/components/login-flow/User/userLoginForm";
import { Header } from "@/components/webapp/layout/Header";

export default function LoginPage() {
  return (
    <>
   
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <UserLoginForm />
      </div>
      {/* reCAPTCHA container for Firebase phone authentication */}
      <div id="recaptcha-container"></div>
    </div></>
  )
}
