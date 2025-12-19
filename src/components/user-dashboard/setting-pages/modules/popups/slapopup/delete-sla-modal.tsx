"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface DeleteSlaModalProps {
  slaTypeName: string
  onSubmit: () => Promise<void>
  onCancel: () => void
}

export function DeleteSlaModal({ slaTypeName, onSubmit, onCancel }: DeleteSlaModalProps) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    try {
      await onSubmit()
    } catch (error) {
      console.error("Error deleting SLA type:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Delete SLA Type</h3>
          <p className="text-sm text-red-800">
            Are you sure you want to delete <span className="font-semibold">"{slaTypeName}"</span>?
            This action cannot be undone and may affect existing orders and dealers using this SLA type.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Deleting...
            </div>
          ) : (
            "Delete SLA Type"
          )}
        </Button>
      </div>
    </form>
  )
}

