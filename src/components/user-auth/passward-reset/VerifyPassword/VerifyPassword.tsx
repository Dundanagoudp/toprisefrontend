'use client'
import { cn } from "@/lib/utils";
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { verifyPassword } from "@/service/auth-service";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
function VerifyPassword({ className, ...props }: React.ComponentProps<"div">) {

  const params = useParams()
  const token = params.id as string
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try{

         if (!token) {
           showToast("No token found in URL", "error")
           return
         }
    const response = await verifyPassword(token)

    if (response.valid) {
      showToast("Password verified", "success")
      router.push(`/admin/setNewPassword/${token}`)
    } else {
      showToast(response.message, "error")
    }
    }
    catch(error){
      console.error("Verify password failed:", error)
      showToast("Failed to verify password", "error")
    }
    finally{
      setLoading(false)
    }
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
    <Card className="overflow-hidden p-0">
      <CardContent className="grid p-0 md:grid-cols-2">
        <form
          className="p-6 md:p-8"
          onSubmit={handleResetPassword}
         
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl font-bold">
                Verify your <span className="text-primary-red">password</span>
              </h1>
              <p className="text-muted-foreground text-balance text-sm">
              Click on the link sent to your email to verify your password
              </p>
            </div>

  

            <Button type="submit" className="w-full" disabled={loading}>
              Verify
            </Button>

            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
              <span className="bg-card text-muted-foreground relative z-10 px-2">
                Or
              </span>
            </div>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <a
                href="/admin/login"
                className="underline underline-offset-4 text-primary-red hover:text-primary-red/80 transition-colors"
              >
                login
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
  </div>
  )
}

export default VerifyPassword
