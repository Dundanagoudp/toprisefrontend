import { Dialog, DialogTitle, DialogHeader, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Upload, XCircle } from "lucide-react";
import { riseTicket } from "@/service/product-Service";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/components/ui/toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserOrders, Order } from "@/service/user/orderService";

interface RiseTicketProps {
    open: boolean;
    onClose: () => void;
    orderId?: string;
    showOrderSelection?: boolean;
}

export default function RiseTicket({ open, onClose, orderId, showOrderSelection = true }: RiseTicketProps) {
    const { showToast } = useToast()
    const [description, setDescription] = useState("");
    const [attachments, setAttachments] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [ticketType, setTicketType] = useState(showOrderSelection ? "Order" : "Order");
    const [selectedOrderId, setSelectedOrderId] = useState(orderId || "");
    const [userOrders, setUserOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const userid = useAppSelector((state:any) => state.auth.user?._id);

    // Fetch user orders when dialog opens and order selection is enabled
    useEffect(() => {
        if (open && userid && showOrderSelection) {
            fetchUserOrders();
        }
    }, [open, userid, showOrderSelection]);

    // Update selectedOrderId when orderId prop changes
    useEffect(() => {
        if (orderId) {
            setSelectedOrderId(orderId);
        }
    }, [orderId]);

    // Set default behavior based on showOrderSelection
    useEffect(() => {
        if (!showOrderSelection) {
            setTicketType("Order");
        }
    }, [showOrderSelection]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            setDescription("");
            setAttachments([]);
            setTicketType("Order");
            setSelectedOrderId(orderId || "");
        }
    }, [open, orderId]);

    const fetchUserOrders = async () => {
        setOrdersLoading(true);
        try {
            const response = await getUserOrders(userid);
            if (response.success) {
                setUserOrders(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch user orders:", error);
        } finally {
            setOrdersLoading(false);
        }
    };
    const handleSubmitRiseTicket = async () => {
        // Validate required fields
        if (!description.trim()) {
            showToast('Please provide a description', 'error');
            return;
        }

        if (ticketType === "Order" && !selectedOrderId) {
            showToast('Please select an order', 'error');
            return;
        }

        if (!userid) {
            showToast('User not authenticated', 'error');
            return;
        }

        setLoading(true);
       try{
        const payload = {
            userRef: userid,
            order_id: ticketType === "Order" ? selectedOrderId : null,
            description: description.trim(),
            ticketType: ticketType,
            attachments: attachments
        };

        console.log("Submitting ticket with payload:", payload);

        const response = await riseTicket(payload);
        
       if(response.success){
        showToast('Ticket raised successfully', 'success')
        // Reset form
        setDescription("");
        setAttachments([]);
        setSelectedOrderId(orderId || "");
        onClose()
       }
       else{
        showToast(response.message || 'Failed to raise ticket. Please try again.', 'error')
       }
       }
       catch(error: any){
        console.error("Failed to rise ticket:", error);
        const errorMessage = error?.response?.data?.message || error?.message;
        if (errorMessage?.toLowerCase().includes('already')) {
           // showToast('Ticket already raised', 'error');
        } else {
            showToast(errorMessage || 'Failed to raise ticket. Please try again.', 'error');
        }
        // Check if error response contains specific message
        
        // Check for specific error cases
        if (errorMessage?.toLowerCase().includes('already raised') || 
            errorMessage?.toLowerCase().includes('already exists') ||
            errorMessage?.toLowerCase().includes('duplicate ticket') ||
            errorMessage?.toLowerCase().includes('ticket already')) {
          showToast('Ticket has already been raised for this order', 'error');
        } else if (error?.response?.status === 400) {
          // Handle other 400 errors
          showToast(errorMessage || 'Invalid request. Please check all fields and try again.', 'error');
        } else if (error?.response?.status === 401) {
          showToast('You are not authorized. Please log in again.', 'error');
        } else if (error?.response?.status === 404) {
          showToast('Order not found. Please select a valid order.', 'error');
        } else {
          showToast(errorMessage || 'Failed to raise ticket. Please try again.', 'error');
        }
       }
       finally {
        setLoading(false);
       }
    }
    return(
        <Dialog open={open} onOpenChange={onClose}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>RAISE A TICKET</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">

      <div>
        <Label htmlFor="description">Problem Description *</Label>
        <Textarea
          id="description"
          placeholder="Please provide the issue with the product..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-2"
        />
        </div>

      {showOrderSelection && (
        <>
          <div>
            <Label htmlFor="ticketType">Ticket Type *</Label>
            <Select
              value={ticketType}
              onValueChange={(value) => {
                setTicketType(value);
                if (value === "General") {
                  setSelectedOrderId("");
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Ticket Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Order">Order</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {ticketType === "Order" && (
            <div>
              <Label htmlFor="order">Select Order *</Label>
              <Select
                value={selectedOrderId}
                onValueChange={setSelectedOrderId}
                disabled={ordersLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={ordersLoading ? "Loading orders..." : "Select Order"} />
                </SelectTrigger>
                <SelectContent>
                  {userOrders.map((order) => (
                    <SelectItem key={order._id} value={order._id}>
                      Order #{order.orderId} - {new Date(order.orderDate).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      <div>
        <Label>Attachments (Optional)</Label>
        <div className="mt-2 space-y-2">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 border rounded">
                  <img src={img} alt={`Review ${idx + 1}`} className="w-full h-full object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = attachments.filter((_, i) => i !== idx);
                      setAttachments(newImages);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <XCircle className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {attachments.length < 5 && (
            <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              <span className="text-sm text-gray-600">Upload Images ({attachments.length}/5)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const imageUrls = files.map(file => URL.createObjectURL(file));
                  setAttachments(prev => [...prev, ...imageUrls].slice(0, 5));
                }}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => onClose()} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmitRiseTicket} disabled={loading || !description.trim() || (showOrderSelection && ticketType === "Order" && !selectedOrderId)}>
          {loading ? "Submitting..." : "Submit Ticket"}
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
    )
}
    

