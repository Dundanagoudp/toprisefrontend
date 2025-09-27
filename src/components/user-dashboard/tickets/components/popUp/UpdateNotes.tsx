import React, { useState } from 'react';
import DynamicButton from "@/components/common/button/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateTicketNotes } from "@/service/Ticket-service";
import { toast } from "@/hooks/use-toast";

interface UpdateNotesProps {
    open: boolean;
    onClose: () => void;
    ticketId: string | null;
    currentNotes?: string;
    onNotesUpdated?: () => void;
}

export default function UpdateNotes({ open, onClose, ticketId, currentNotes = "", onNotesUpdated }: UpdateNotesProps) {
    const [notes, setNotes] = useState<string>(currentNotes);
    const [loading, setLoading] = useState<boolean>(false);

    // Update notes when currentNotes prop changes
    React.useEffect(() => {
        setNotes(currentNotes);
    }, [currentNotes]);

    // You'll need to get this from your auth context or store
    const updatedBy = "685bf85bee1e2d9c9bd7f1b1"; // This should come from logged in user

    const handleSubmit = async () => {
        if (!ticketId) {
            toast({
                title: "Error",
                description: "No ticket selected",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            await updateTicketNotes(ticketId, {
                remarks: notes,
                updated_by: updatedBy
            });

            toast({
                title: "Success",
                description: "Ticket remarks updated successfully",
            });

            // Call callback to refresh data
            if (onNotesUpdated) {
                onNotesUpdated();
            }
            
            onClose();
        } catch (err: any) {
            console.log("error in notes update", err);
            toast({
                title: "Error",
                description: "Failed to update ticket remarks",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setNotes(currentNotes); // Reset to original notes
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogOverlay>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Update Ticket Remarks</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Remarks</Label>
                            <Textarea
                                id="notes"
                                placeholder="Enter remarks..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="min-h-[120px]"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <DynamicButton
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </DynamicButton>
                        <DynamicButton
                            onClick={handleSubmit}
                            disabled={loading}
                            loading={loading}
                        >
                            Update Remarks
                        </DynamicButton>
                    </div>
                </DialogContent>
            </DialogOverlay>
        </Dialog>
    );
}
