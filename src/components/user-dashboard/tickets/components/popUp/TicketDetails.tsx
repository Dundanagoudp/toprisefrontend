import React, { useState, useEffect } from 'react';
import { X, Calendar, User, MessageSquare, FileText } from 'lucide-react';
import DynamicButton from "@/components/common/button/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getTicketById } from "@/service/Ticket-service";
import { Ticket } from "@/types/Ticket-types";

interface TicketDetailsProps {
    open: boolean;
    onClose: () => void;
    ticketId: string | null;
}

export default function TicketDetails({ open, onClose, ticketId }: TicketDetailsProps) {
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && ticketId) {
            fetchTicketDetails();
        }
    }, [open, ticketId]);

    const fetchTicketDetails = async () => {
        if (!ticketId) return;
        
        setLoading(true);
        try {
            const response = await getTicketById(ticketId);
            if (response.success && response.data) {
                setTicket(response.data);
            }
        } catch (error) {
            console.error("Error fetching ticket details:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
        switch (status.toLowerCase()) {
            case "open":
                return `${baseClasses} text-green-700 bg-green-100`;
            case "in progress":
                return `${baseClasses} text-blue-700 bg-blue-100`;
            case "closed":
                return `${baseClasses} text-gray-700 bg-gray-100`;
            case "pending":
                return `${baseClasses} text-yellow-700 bg-yellow-100`;
            case "resolved":
                return `${baseClasses} text-purple-700 bg-purple-100`;
            default:
                return `${baseClasses} text-gray-700 bg-gray-100`;
        }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogOverlay>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">
                            Ticket Details
                        </DialogTitle>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </DialogHeader>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-gray-500">Loading ticket details...</div>
                        </div>
                    ) : ticket ? (
                        <div className="space-y-6">
                            {/* Ticket Header */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold">
                                        Ticket #{ticket._id.slice(-8).toUpperCase()}
                                    </h3>
                                    <Badge className={getStatusBadge(ticket.status)}>
                                        {ticket.status}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">Created:</span>
                                        <span className="font-medium">{formatDate(ticket.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">Updated:</span>
                                        <span className="font-medium">{formatDate(ticket.updatedAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">Assigned:</span>
                                        <span className="font-medium">
                                            {ticket.assigned ? "Yes" : "No"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            {ticket.ticketType === "General" ? "Message" : "Title"}
                                        </h4>
                                        <div className="bg-white border rounded-lg p-4">
                                            <p className="text-gray-700 whitespace-pre-wrap">
                                                {ticket.description}
                                            </p>
                                        </div>
                                    </div>

                                    {ticket.ticketType === "Order" && ticket.order_id && (
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">
                                                Related Order
                                            </h4>
                                            <div className="bg-white border rounded-lg p-4">
                                                <p className="text-blue-600 font-medium">
                                                    {ticket.order_id}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Remarks
                                        </h4>
                                        <div className="bg-white border rounded-lg p-4 min-h-[120px]">
                                            {ticket.remarks ? (
                                                <p className="text-gray-700 whitespace-pre-wrap">
                                                    {ticket.remarks}
                                                </p>
                                            ) : (
                                                <p className="text-gray-400 italic">
                                                    No remarks available
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {ticket.attachments && ticket.attachments.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">
                                                Attachments
                                            </h4>
                                            <div className="bg-white border rounded-lg p-4">
                                                <div className="grid grid-cols-1 gap-2">
                                                    {ticket.attachments.map((attachment, index) => (
                                                        <a
                                                            key={index}
                                                            href={attachment}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                                                        >
                                                            Attachment {index + 1}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">
                                            Ticket Information
                                        </h4>
                                        <div className="bg-white border rounded-lg p-4 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Type:</span>
                                                <span className="font-medium">{ticket.ticketType}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Created By:</span>
                                                <span className="font-medium text-sm">
                                                    {ticket.userRefDetails?.username || ticket.userRefDetails?.email || ticket.userRef?.slice(-8) || "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Assigned To:</span>
                                                <span className="font-medium text-sm">
                                                    {ticket.assignedToDetails?.email || ticket.assigned_to?.slice(-8) || "Unassigned"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Last Updated By:</span>
                                                <span className="font-medium text-sm">
                                                    {ticket.updatedByDetails?.email || ticket.updated_by?.slice(-8) || "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-gray-500">Ticket not found</div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t">
                        <DynamicButton
                            variant="outline"
                            onClick={onClose}
                        >
                            Close
                        </DynamicButton>
                    </div>
                </DialogContent>
            </DialogOverlay>
        </Dialog>
    );
}
