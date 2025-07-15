"use client"

import { Input } from "@/components/ui/input"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UploadCloud, X } from "lucide-react"

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
}

export default function FileUploadModal({
  isOpen,
  onClose,
  title = "Upload File",
  description = "Drag and drop your file here, or click to select a file.",
}: FileUploadModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6 rounded-lg shadow-lg">
        <DialogHeader className="relative">
          <DialogTitle className="text-center text-lg font-semibold text-gray-900">{title}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-pointer hover:border-gray-400 transition-colors">
          <UploadCloud className="h-12 w-12 mb-3 text-gray-400" />
          <p className="text-sm font-medium">{description}</p>
          <Input type="file" className="sr-only" /> {/* Hidden file input */}
        </div>
        {/* You can add more elements here like a progress bar, file list, etc. */}
      </DialogContent>
    </Dialog>
  )
}
