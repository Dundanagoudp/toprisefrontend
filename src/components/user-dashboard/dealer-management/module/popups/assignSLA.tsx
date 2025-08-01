"use client";
import { use, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import DynamicButton from "@/components/common/button/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { getAllCSlaTypes, setSlaType } from "@/service/dealerServices";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";


// Example SLA types data (replace with props or API data as needed)


interface AssignSLAFormProps {
  open: boolean;
  onClose: () => void
 
  dealerId: string | null;
  onSubmit?: (slaId: string) => void;
}

const schema = z.object({
  sla_type_id: z.string().min(1, "SLA Type is required"),
  dispatch_hours: z.object({
    start: z.number().min(0, "Start hour required").max(23, "Hour must be 0-23"),
    end: z.number().min(0, "End hour required").max(23, "Hour must be 0-23"),
  })
});
type FormValues = z.infer<typeof schema>;


export default function AssignSLAForm({ open, onClose , dealerId, onSubmit }: AssignSLAFormProps) {
  const [slaTypes, setSlaTypes] = useState<{ _id: string; name: string }[]>([]);
  const { showToast } = useGlobalToast();

  const {  register,
    handleSubmit,
    setValue,
    formState: { errors },
    } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
  });
// Initialize form values
  useEffect(() => {
    if (open) {
      fetchSlaTypes();
      setValue("sla_type_id", "");
      setValue("dispatch_hours.start", 9);
      setValue("dispatch_hours.end", 18);
    }
  }, [open, setValue]);

  const fetchSlaTypes = async () => {
    try {
      const slaTypesResponse = await getAllCSlaTypes();
      const item = slaTypesResponse.data;
      setSlaTypes(item);
    } catch (error) {
      showToast("Failed to load SLA types. Please refresh the page.", "error");
    }
  };
const handleFormSubmit = async (data: FormValues) => {
    if (onSubmit) onSubmit(data.sla_type_id); 
    await setSlaType(dealerId as string, data);

    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign SLA Type</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Card>
            <CardContent className="pt-0 px-0">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">SLA Type</label>
                <select
                  {...register("sla_type_id")}
                  className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2"
                  defaultValue=""
                  
                >
                  <option value="" disabled>
                    Select SLA Type
                  </option>
                  {slaTypes.map((sla) => (
                    <option key={sla._id} value={sla._id}>
                      {sla.name}
                    </option>
                  ))}
                </select>
                {errors.sla_type_id && (
                  <span className="text-xs text-red-500">{errors.sla_type_id.message as string}</span>
                )}
              </div>
              <div className="mb-4 flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dispatch Start Hour</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    {...register("dispatch_hours.start", { valueAsNumber: true })}
                    className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2"
                  />
                  {errors.dispatch_hours?.start && (
                    <span className="text-xs text-red-500">{errors.dispatch_hours.start.message as string}</span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dispatch End Hour</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    {...register("dispatch_hours.end", { valueAsNumber: true })}
                    className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2"
                  />
                  {errors.dispatch_hours?.end && (
                    <span className="text-xs text-red-500">{errors.dispatch_hours.end.message as string}</span>
                  )}
                </div>
              </div>
              <DynamicButton type="submit">
                Assign SLA
              </DynamicButton>
            </CardContent>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  );
}