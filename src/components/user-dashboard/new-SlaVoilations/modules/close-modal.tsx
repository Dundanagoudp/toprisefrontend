"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAppSelector } from "@/store/hooks"

interface CloseModalProps {
  onSubmit: (data: { notes: string; added_by: string }) => Promise<void>
  onCancel: () => void
}

export function CloseModal({ onSubmit, onCancel }: CloseModalProps) {
  const auth = useAppSelector((state) => state.auth.user)
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")

  const validateForm = () => {
    if (!notes.trim()) {
      setError("Notes are required")
      return false
    }
    setError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!auth?._id) {
      setError("User authentication required")
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        notes: notes.trim(),
        added_by: auth._id,
      })
    } catch (error) {
      console.error("Error closing violation:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notes">
          Notes <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value)
            if (error) setError("")
          }}
          placeholder="Enter closing notes..."
          disabled={loading}
          rows={4}
          className={error ? "border-red-500" : ""}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
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
          className="bg-[#C72920] hover:bg-[#C72920]/90 text-white"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Closing...
            </div>
          ) : (
            "Close Violation"
          )}
        </Button>
      </div>
    </form>
  )
}

