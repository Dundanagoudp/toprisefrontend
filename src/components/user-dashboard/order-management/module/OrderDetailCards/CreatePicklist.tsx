import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CreatePicklistProps {
  open: boolean
  onClose: () => void
}

const CreatePicklist: React.FC<CreatePicklistProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Picklist</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {/* Add your picklist form or content here */}
          <p className="text-gray-700">This is the Create Picklist dialog. Add your form or content here.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-[#C72920] text-white ml-2" onClick={onClose}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreatePicklist
