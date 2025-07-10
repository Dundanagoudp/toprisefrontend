import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * PasswordCreate
 *
 * A component for creating a new password
 *
 * @param className - The class name to apply to the component
 * @param props - The props to pass to the component
 * @returns The PasswordCreate component
 */
export function PasswordCreate({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2 h-100">
          <form className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">
                  Create your <span className="text-primary-red">credentials</span>
                </h1>
                <p className="text-muted-foreground text-balance text-sm">
                  Create your Password
                </p>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="Password">Password</Label>
                </div>
                <Input placeholder="Create Password" id="password" type="password" required />
              </div>
                <div className="grid gap-3">
                    <div className="flex items-center">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    </div>
                    <Input placeholder="Confirm Password" id="confirm-password" type="password" required />
                </div>
              <Button type="submit" className="w-full">
                Sign up
              </Button>

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
