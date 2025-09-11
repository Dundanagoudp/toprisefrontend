"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, MapPin, Building2 } from 'lucide-react';
import { useToast as useToastMessage } from "@/components/ui/toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assignEmployeesToDealer } from "@/service/dealerServices";
import { getAllDealers } from "@/service/dealerServices";
import { getAvailableRegions } from "@/service/employeeServices";
import type { Employee } from "@/types/employee-types";

interface Dealer {
  _id: string;
  legal_name: string;
  trade_name: string;
}

interface AssignRegionDealerModalProps {
  open: boolean;
  onClose: () => void;
  selectedEmployees: Employee[];
  onSuccess: () => void;
}

export default function AssignRegionDealerModal({
  open,
  onClose,
  selectedEmployees,
  onSuccess
}: AssignRegionDealerModalProps) {
  const [selectedDealer, setSelectedDealer] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const { showToast } = useToastMessage();

  // Load dealers and regions when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;
      
      setLoadingData(true);
      try {
        // Fetch dealers
        const dealersResponse = await getAllDealers();
        setDealers(dealersResponse.data || []);
        
        // Fetch regions
        const regionsData = await getAvailableRegions();
        setRegions(regionsData || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        showToast("Failed to load dealers and regions", "error");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [open, showToast]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedDealer("");
      setSelectedRegion("");
      setNotes("");
    }
  }, [open]);

  const handleAssign = async () => {
    if (!selectedDealer) {
      showToast("Please select a dealer", "error");
      return;
    }

    if (!selectedRegion) {
      showToast("Please select a region", "error");
      return;
    }

    if (selectedEmployees.length === 0) {
      showToast("No employees selected", "error");
      return;
    }

    try {
      setLoading(true);
      
      const employeeIds = selectedEmployees.map(emp => emp._id);
      const assignmentNotes = notes || `Assigned to ${selectedRegion} region`;
      
      const response = await assignEmployeesToDealer(selectedDealer, {
        employeeIds,
        assignmentNotes,
        region: selectedRegion // Include region in the payload
      });
      
      const message = response?.message || `Successfully assigned ${selectedEmployees.length} employee(s) to dealer and region`;
      showToast(message, "success");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Assignment error:", error);
      showToast(error?.response?.data?.message || "Failed to assign employees. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const selectedDealerName = dealers.find(d => d._id === selectedDealer)?.legal_name || selectedDealer;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Assign Region & Dealer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Selected Employees */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Selected Employees ({selectedEmployees.length})
            </label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-3 bg-gray-50">
              {selectedEmployees.map((employee) => (
                <div key={employee._id} className="flex items-center gap-2 py-1">
                  <Checkbox checked={true} disabled />
                  <span className="text-sm">
                    {employee.First_name} ({employee.employee_id})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Region Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              Region *
            </label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion} disabled={loadingData}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingData ? "Loading regions..." : "Select a region"} />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dealer Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Dealer *
            </label>
            <Select value={selectedDealer} onValueChange={setSelectedDealer} disabled={loadingData}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingData ? "Loading dealers..." : "Select a dealer"} />
              </SelectTrigger>
              <SelectContent>
                {dealers.map((dealer) => (
                  <SelectItem key={dealer._id} value={dealer._id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{dealer.legal_name}</span>
                      {dealer.trade_name && (
                        <span className="text-xs text-gray-500">{dealer.trade_name}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignment Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Assignment Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this assignment (optional)"
              className="min-h-[80px]"
            />
          </div>

          {/* Summary */}
          {selectedDealer && selectedRegion && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Assignment Summary</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Employees:</strong> {selectedEmployees.length} selected</p>
                <p><strong>Region:</strong> {selectedRegion}</p>
                <p><strong>Dealer:</strong> {selectedDealerName}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={loading || !selectedDealer || !selectedRegion || loadingData}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Assigning...
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4 mr-2" />
                Assign to Dealer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
