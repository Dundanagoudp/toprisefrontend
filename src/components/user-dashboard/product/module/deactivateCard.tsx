import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import Image from "next/image"
import FAQ from "../../public/assets/FAQ.png"

export default function DeactivateProductCard() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="relative w-full max-w-md p-6 text-center shadow-lg rounded-lg">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 rounded-full w-8 h-8 text-gray-500 hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </Button>
        <CardHeader className="flex flex-col items-center space-y-4 pb-4">
          <Image
            src={FAQ}
            alt="Illustration of a person with question marks and chat bubbles"
            width={150}
            height={150}
            className="object-contain"
          />
          <CardTitle className="text-2xl font-bold text-gray-800">
            Are you sure you want to Deactivate the product
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-left">
            <Label htmlFor="reason" className="text-base font-medium text-gray-700">
              Reason
            </Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for deleting the product"
              className="mt-2 min-h-[120px] resize-none border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </CardContent>
        <CardFooter className="pt-6">
          <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md transition-colors">
            Submit
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}