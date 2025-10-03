import Footer from "@/components/landingPage/module/Footer"
import { PhoneSignUpForm } from "@/components/login-flow/phone-signup-form"
import { Header } from "@/components/webapp/layout/Header"

export default function Signup() {
  return (
    <>
   
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <PhoneSignUpForm/>
      </div>
      <div id="recaptcha-container" />
    </div>
   
    </>
  )
}
