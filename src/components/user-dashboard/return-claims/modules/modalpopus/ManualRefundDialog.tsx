// import { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
// import { Card, CardContent } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import DynamicButton from "@/components/common/button/button";
// import { useToast as useGlobalToast } from "@/components/ui/toast";
// import { markRefundCompleted } from "@/service/return-service";
// import { DollarSign, User, MapPin, Phone, Mail, AlertTriangle } from "lucide-react";
// import { ReturnRequest } from "@/types/return-Types";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// interface ManualRefundDialogProps {
//   open: boolean;
//   onClose: () => void;
//   onComplete?: (success: boolean) => void;
//   returnId: string | null;
//   returnRequest?: ReturnRequest | null;
// }

// export default function ManualRefundDialog({ 
//   open, 
//   onClose, 
//   onComplete, 
//   returnId,
//   returnRequest 
// }: ManualRefundDialogProps) {
//   const { showToast } = useGlobalToast();
//   const [showConfirmDialog, setShowConfirmDialog] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//     }).format(amount);
//   };

//   const handleMarkAsCompleted = async () => {
//     if (!returnId) {
//       showToast("Return ID is required", "error");
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const response = await markRefundCompleted(returnId);

//       if (response.success) {
//         showToast("Refund marked as completed successfully", "success");
//         onComplete?.(true);
//         setShowConfirmDialog(false);
//         onClose();
//       } else {
//         showToast(response.message || "Failed to mark refund as completed", "error");
//         onComplete?.(false);
//       }
//     } catch (error: any) {
//       console.error("Error marking refund as completed:", error);
//       const errorMessage = error?.response?.data?.message || error?.message || "Failed to mark refund as completed";
//       showToast(errorMessage, "error");
//       onComplete?.(false);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <>
//       <Dialog open={open} onOpenChange={onClose}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <DollarSign className="h-5 w-5" />
//               Manual Refund - Customer Account Details
//             </DialogTitle>
//             <DialogDescription>
//               Please process the refund manually to the customer's account and mark as completed.
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4 py-4">
//             {/* Refund Information */}
//             <Card className="border-l-4 border-l-green-500">
//               <CardContent className="pt-6">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <Label className="text-sm font-medium text-gray-500">Refund Amount</Label>
//                     <p className="text-2xl font-bold text-green-600">
//                       {returnRequest?.refund?.refundAmount 
//                         ? formatCurrency(returnRequest.refund.refundAmount)
//                         : "N/A"
//                       }
//                     </p>
//                   </div>
//                   <div>
//                     <Label className="text-sm font-medium text-gray-500">Refund Method</Label>
//                     <p className="text-lg font-medium text-gray-900">
//                       {returnRequest?.refund?.refundMethod || "Manual Transfer"}
//                     </p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Customer Account Details */}
//             <Card>
//               <CardContent className="pt-6 space-y-4">
//                 <h3 className="font-semibold text-gray-900 flex items-center gap-2">
//                   <User className="h-5 w-5" />
//                   Customer Information
//                 </h3>

//                 <div className="space-y-3">
//                   <div className="flex items-start gap-3">
//                     <User className="h-4 w-4 text-gray-400 mt-1" />
//                     <div>
//                       <Label className="text-xs text-gray-500">Name</Label>
//                       <p className="text-sm font-medium text-gray-900">
//                         {returnRequest?.orderId?.customerDetails?.name || "N/A"}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <Phone className="h-4 w-4 text-gray-400 mt-1" />
//                     <div>
//                       <Label className="text-xs text-gray-500">Phone</Label>
//                       <p className="text-sm font-medium text-gray-900">
//                         {returnRequest?.orderId?.customerDetails?.phone || "N/A"}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <Mail className="h-4 w-4 text-gray-400 mt-1" />
//                     <div>
//                       <Label className="text-xs text-gray-500">Email</Label>
//                       <p className="text-sm font-medium text-gray-900">
//                         {returnRequest?.orderId?.customerDetails?.email || "N/A"}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <MapPin className="h-4 w-4 text-gray-400 mt-1" />
//                     <div>
//                       <Label className="text-xs text-gray-500">Address</Label>
//                       <p className="text-sm font-medium text-gray-900">
//                         {returnRequest?.orderId?.customerDetails?.address || "N/A"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Instructions */}
//             <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
//               <div className="flex gap-3">
//                 <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
//                 <div>
//                   <h4 className="font-medium text-amber-900 text-sm">Important</h4>
//                   <p className="text-sm text-amber-800 mt-1">
//                     Please ensure you have transferred the refund amount to the customer's account 
//                     before marking this refund as completed. This action cannot be undone.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <DialogFooter className="flex gap-3">
//             <DynamicButton
//               variant="outline"
//               onClick={onClose}
//               disabled={isSubmitting}
//             >
//               Cancel
//             </DynamicButton>
//             <DynamicButton
//               onClick={() => setShowConfirmDialog(true)}
//               disabled={isSubmitting}
//               className="bg-green-600 hover:bg-green-700 text-white"
//             >
//               Mark as Refund Completed
//             </DynamicButton>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Confirmation Dialog */}
//       <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Confirm Refund Completion</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you have transferred the refund amount of{" "}
//               <span className="font-semibold text-green-600">
//                 {returnRequest?.refund?.refundAmount 
//                   ? formatCurrency(returnRequest.refund.refundAmount)
//                   : "N/A"
//                 }
//               </span>{" "}
//               to the customer? This action will mark the refund as completed.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleMarkAsCompleted}
//               disabled={isSubmitting}
//               className="bg-green-600 hover:bg-green-700"
//             >
//               {isSubmitting ? "Processing..." : "Yes, Mark as Completed"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }
