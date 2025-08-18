"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Users } from 'lucide-react';
import { useToast as useToastMessage } from "@/components/ui/toast";

interface Staff {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AssignStaffPopupProps {
  open: boolean;
  onClose: () => void;
  dealerId: string | null;
  dealerName: string;
  currentStaff: string[];
  onSuccess: () => void;
}

export default function AssignStaffPopup({
  open,
  onClose,
  dealerId,
  dealerName,
  currentStaff = [],
  onSuccess
}: AssignStaffPopupProps) {
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([
    { _id: "1", name: "John Doe", email: "john@example.com", role: "Manager" },
    { _id: "2", name: "Jane Smith", email: "jane@example.com", role: "Sales Rep" },
    { _id: "3", name: "Mike Johnson", email: "mike@example.com", role: "Support" }
  ]);
  const { showToast } = useToastMessage();

  const handleStaffToggle = (staffId: string) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleAssign = async () => {
    if (selectedStaff.length === 0) {
      showToast("Please select at least one staff member", "error");
      return;
    }

    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // await assignStaffToDealer(dealerId, selectedStaff);
      
      showToast(`Successfully assigned ${selectedStaff.length} staff member(s) to ${dealerName}`, "success");
      onSuccess();
      onClose();
      setSelectedStaff([]);
    } catch (error) {
      showToast("Failed to assign staff. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const availableStaff = staffList.filter(staff => !currentStaff.includes(staff._id));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C72920]" />
            Assign Staff to {dealerName}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {availableStaff.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No available staff to assign
            </p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {availableStaff.map((staff) => (
                <div key={staff._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    id={staff._id}
                    checked={selectedStaff.includes(staff._id)}
                    onCheckedChange={() => handleStaffToggle(staff._id)}
                  />
                  <div className="flex-1">
                    <label htmlFor={staff._id} className="text-sm font-medium cursor-pointer">
                      {staff.name}
                    </label>
                    <p className="text-xs text-gray-500">{staff.email} • {staff.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={loading || selectedStaff.length === 0}
            className="bg-[#C72920] hover:bg-[#A91E17]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              `Assign ${selectedStaff.length} Staff`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
