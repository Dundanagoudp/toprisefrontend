import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUp, ImageUp, X } from "lucide-react"
import Image from "next/image"


export default function UploadBulkCard() {

return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-3xl p-6 shadow-lg rounded-lg">
        <CardContent className="space-y-6">
          <div className="space-y-1"> 
            <h2 className="text-2xl font-semibold text-gray-800">Upload File</h2>
            <p className="text-gray-500">Drag and drop the files as per the requirement</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Upload Image.zip file section */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-lg border-2 border border-red-500 bg-red-50 text-red-600 cursor-pointer hover:bg-red-100 transition-colors duration-200">
              <ImageUp className="w-12 h-12 mb-2" />
              <span className="text-lg font-medium">Upload Image.zip file</span>
            </div>

            {/* Upload CSV file section */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-lg border-2 border border-gray-300 bg-white text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors duration-200">
              <FileUp className="w-12 h-12 mb-2" />
              <span className="text-lg font-medium">Upload CSV file</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button className="bg-gray-300 text-gray-800 hover:bg-gray-400">Cancel</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700">Upload</Button>
          </div>
        </CardContent>
      </Card>
    </main>
)

}