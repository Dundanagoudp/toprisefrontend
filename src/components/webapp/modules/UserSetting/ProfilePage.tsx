"use client";
import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileSection } from "./ProfileSection";
import { DataField } from "./DataField";
import AddVehicleDialog from "./popup/AddVehicleDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/toast";
import { useAppSelector } from "@/store/hooks";
import {
  getUserProfile,
  UserProfile,
  updateUserProfile,
  UpdateProfileRequest,
  UserAddress,
  UserBankDetails,
  UserVehicleDetails,
  updateUserAddress,
  UpdateAddressRequest,
  editUserAddress,
  EditAddressRequest,
  getUserById,
  getBankDetails,
  createBankDetails,
  updateBankDetails,
} from "@/service/user/userService";
import {
  getUserOrders,
  Order as UserOrder,
  getWishlistByUser,
  moveToCart,
  removeWishlistByUser,
  addOrderRating,
} from "@/service/user/orderService";
import {
  getVehicleDetails,
  addVehicle,
  deleteVehicle,
  editVehicle,
  getPurchaseOrders,
  getPurchaseOrderById,
} from "@/service/product-Service";
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Building2,
  Phone,
  Mail,
  Calendar,
  Package,
  CreditCard,
  Trash2,
  Plus,
  Edit2,
  Save,
  X,
  Loader2,
  ExternalLink,
  Star,
  Bus,
  Ticket as TicketIcon,
  MoreVertical,
  NotepadText,
  Redo2,
} from "lucide-react";
import Link from "next/link";
import { ca } from "date-fns/locale";
import { getTicketByUser, getTickets } from "@/service/Ticket-service";
import TicketDetailsDialog from "./popup/TicketDialogBox";
import { PurchaseOrder, TicketResponse, Ticket } from "@/types/Ticket-types";
import PurchaseOrderDialog from "./popup/PurchaseOrderRequest";
import PurchaseOrderUploadDialog from "./popup/PurchaseOrderBox";
import DynamicPagination from "@/components/common/pagination/DynamicPagination";
import { RefreshCw } from "lucide-react";
import ReturnRequestList from "./porfilepage/ReturnRequest";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DynamicButton } from "@/components/common/button";
import RiseTicket from "../orderDetailpage/popups/RiseTicket";
import OrderReviewModal from "./popup/OrderReviewModal";
interface Address {
  id: string;
  type: "home" | "work" | "other";
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: number;
}

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const [selectedTicket, setSelectedTicket] =
    useState<Partial<Ticket> | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [userWishlist, setUserWishlist] = useState<any[]>([]);
  const [vehicleDetails, setVehicleDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [vehicleDetailsLoading, setVehicleDetailsLoading] = useState(false);
  const [movingToCart, setMovingToCart] = useState<string[]>([]);
  const [removingFromWishlist, setRemovingFromWishlist] = useState<string[]>(
    []
  );

// fetch data from API in useEffect

  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [showEditVehicleConfirmation, setShowEditVehicleConfirmation] =
    useState(false);

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingAddress, setUpdatingAddress] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(
    null
  );
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(
    null
  );
  
    const [selected, setSelected] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isRiseTicketOpen, setIsRiseTicketOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState<number | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [showDeleteVehicleConfirmation, setShowDeleteVehicleConfirmation] =
    useState(false);
  const [pendingDeleteVehicle, setPendingDeleteVehicle] = useState<
    string | null
  >(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [purchaseOrdersLoading, setPurchaseOrdersLoading] = useState(false);
  const [purchaseOrdersError, setPurchaseOrdersError] = useState<string | null>(null);
  const [purchaseOrderPage, setPurchaseOrderPage] = useState(1);
  const [purchaseOrderLimit] = useState(10);
  const [purchaseOrderPagination, setPurchaseOrderPagination] = useState({
    totalPages: 1,
    totalItems: 0,
  });
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [newAddress, setNewAddress] = useState<UserAddress>({
    nick_name: "",
    street: "",
    city: "",
    pincode: "",
    state: "",
  });
  const { showToast } = useToast();
  const router = useRouter();
  const userId = useAppSelector((state) => state.auth.user?._id);



  // Fetch purchase orders with pagination
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      if (!userId) return;
      setPurchaseOrdersLoading(true);
      setPurchaseOrdersError(null);
      try {
        const res = await getPurchaseOrderById(userId, purchaseOrderPage, purchaseOrderLimit);
        if (!mounted) return;
        const items = res?.data?.data || [];
        setPurchaseOrders(Array.isArray(items) ? items : []);
        if (res?.data?.pagination) {
          setPurchaseOrderPagination({
            totalPages: res.data.pagination.totalPages || 1,
            totalItems: res.data.pagination.totalItems || 0,
          });
        }
      } catch (err: any) {
        if (!mounted) return;
        setPurchaseOrdersError(err?.message || "Failed to load purchase orders");
      } finally {
        if (!mounted) return;
        setPurchaseOrdersLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [userId, purchaseOrderPage, purchaseOrderLimit]);
  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await getUserProfile(userId);
        if (response.success && response.data) {
          setUserProfile(response.data);
          console.log("User Profile:", response.data);
          setProfileData({
            email: response.data.email || "",
            username: response.data.username || "",
            phone_Number: response.data.phone_Number || "",
            bank_details:
              response.data.bank_details ||
              ({
                account_number: "",
                ifsc_code: "",
                account_type: "",
                bank_account_holder_name: "",
                bank_name: "",
              } as UserBankDetails),
            address: response.data.address || [],
            vehicle_details: response.data.vehicle_details || [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        showToast("Failed to load profile data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, showToast]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!userId || activeTab !== "orders") return;

      try {
        setOrdersLoading(true);
        const response = await getUserOrders(userId);
        if (response.success && response.data) {
          setUserOrders(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch user orders:", error);
        showToast("Failed to load orders", "error");
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchUserOrders();
  }, [userId, activeTab, showToast]);
  useEffect (()=>{
    const getOrders = async () => {
      const response = await getUserOrders(userId);
      if (response.success && response.data) {
        setUserOrders(response.data);
      }
    }
    getOrders();
  })
  useEffect(() => {
    const fetchUserWishlist = async () => {
      if (!userId || activeTab !== "wishlists") return;

      try {
        setWishlistLoading(true);
        const response = await getWishlistByUser(userId);

        if (!response || typeof response !== "object") {
          console.error("Invalid response format:", response);
          setUserWishlist([]);
          return;
        }

        if (response.success) {
          let wishlistData: any[] = [];

          if (Array.isArray(response.data)) {
            wishlistData = response.data;
          } else if (response.data && typeof response.data === "object") {
            if (Array.isArray(response.data.items)) {
              wishlistData = response.data.items;
            } else if (Array.isArray(response.data.products)) {
              wishlistData = response.data.products;
            } else if (Array.isArray(response.data.wishlist)) {
              wishlistData = response.data.wishlist;
            } else {
              wishlistData = [response.data];
            }
          } else if (!response.data) {
            wishlistData = [];
          }

          setUserWishlist(wishlistData);
        }
      } catch (error) {
        console.error("Failed to fetch user wishlist:", error);
        showToast("Failed to load wishlist", "error");
      } finally {
        setWishlistLoading(false);
      }
    };

    fetchUserWishlist();
  }, [userId, activeTab, showToast]);

  const handleMoveToCart = async (productId: string) => {
    if (!userId) return;

    try {
      setMovingToCart((prev) => [...prev, productId]);

      const response = await moveToCart({
        userId: userId,
        productId: productId,
      });

      if (response.success) {
        const wishlistResponse = await getWishlistByUser(userId);
        if (wishlistResponse.success) {
          const wishlistData = Array.isArray(wishlistResponse.data)
            ? wishlistResponse.data
            : wishlistResponse.data?.items || [];
          setUserWishlist(wishlistData);
        }
      } else {
        showToast("Failed to move item to cart", "error");
      }
    } catch (error) {
      console.error("Failed to move item to cart:", error);
      showToast("Failed to move item to cart", "error");
    } finally {
      setMovingToCart((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!userId) return;

    try {
      setRemovingFromWishlist((prev) => [...prev, productId]);

      const response = await removeWishlistByUser({
        userId: userId,
        productId: productId,
      });

      if (response.success) {
        showToast("Item removed from wishlist", "success");
        setUserWishlist((prev) =>
          prev.filter(
            (item) => (item.productDetails?._id || item._id) !== productId
          )
        );
      } else {
        showToast("Failed to remove item from wishlist", "error");
      }
    } catch (error) {
      console.error("Failed to remove item from wishlist:", error);
      showToast("Failed to remove item from wishlist", "error");
    } finally {
      setRemovingFromWishlist((prev) => prev.filter((id) => id !== productId));
    }
  };

  const [profileData, setProfileData] = useState({
    email: "",
    username: "",
    phone_Number: "",
    bank_details: {
      account_number: "",
      ifsc_code: "",
      account_type: "",
      bank_account_holder_name: "",
      bank_name: "",
    } as UserBankDetails,
    address: [] as UserAddress[],
    vehicle_details: [] as UserVehicleDetails[],
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (userProfile?.address) {
      const formattedAddresses: Address[] = userProfile.address.map(
        (addr, index) => ({
          id: addr.index?.toString() || index.toString(),
          type:
            (addr.nick_name?.toLowerCase() as "home" | "work" | "other") ||
            "other",
          name: userProfile.username || "",
          street: addr.street || "",
          city: addr.city || "",
          state: addr.state || "",
          pincode: addr.pincode || "",
          phone: userProfile.phone_Number || "",
          isDefault: index === 0,
        })
      );
      setAddresses(formattedAddresses);
    }
  }, [userProfile]);
  const handleView = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!userId) {
      showToast("User ID not found", "error");
      return;
    }

    try {
      setUpdatingProfile(true);

      // Prepare update data for non-bank-details fields
      const updateData: UpdateProfileRequest = {};

      if (profileData.email && profileData.email !== userProfile?.email) {
        updateData.email = profileData.email;
      }

      if (
        profileData.username &&
        profileData.username !== userProfile?.username
      ) {
        updateData.username = profileData.username;
      }

      // Bank details will be handled separately
      // Removed bank_details from updateData

      if (profileData.address && profileData.address.length > 0) {
        updateData.address = profileData.address;
      }

      if (
        profileData.vehicle_details &&
        profileData.vehicle_details.length > 0
      ) {
        updateData.vehicle_details = profileData.vehicle_details;
      }

      // Check if bank details need to be saved
      const hasBankDetailsChanges =
        profileData.bank_details &&
        Object.values(profileData.bank_details).some((value) => value);

      // Check if bank details already exist
      const bankDetailsExist =
        userProfile?.bank_details?.account_number ||
        userProfile?.bank_details?.ifsc_code ||
        userProfile?.bank_details?.bank_name;

      // Save bank details separately if there are changes
      if (hasBankDetailsChanges) {
        try {
          if (bankDetailsExist) {
            // Update existing bank details
            const bankResponse = await updateBankDetails(
              userId,
              profileData.bank_details
            );
            if (!bankResponse.success) {
              showToast(
                bankResponse.message || "Failed to update bank details",
                "error"
              );
              return;
            }
          } else {
            // Create new bank details
            const bankResponse = await createBankDetails(
              userId,
              profileData.bank_details
            );
            if (!bankResponse.success) {
              showToast(
                bankResponse.message || "Failed to save bank details",
                "error"
              );
              return;
            }
          }
        } catch (bankError: any) {
          console.error("Failed to save bank details:", bankError);
          showToast(
            bankError.message || "Failed to save bank details",
            "error"
          );
          return;
        }
      }

      // Save other profile fields if there are changes
      if (Object.keys(updateData).length > 0) {
        const response = await updateUserProfile(userId, updateData);

        if (!response.success) {
          showToast(response.message || "Failed to update profile", "error");
          return;
        }
      } else if (!hasBankDetailsChanges) {
        // No changes at all
        showToast("No changes to save", "warning");
        setIsEditing(false);
        return;
      }

      // Refresh profile data after successful save
      showToast("Profile updated successfully", "success");
      setIsEditing(false);

      const updatedProfile = await getUserProfile(userId);
      if (updatedProfile.success && updatedProfile.data) {
        setUserProfile(updatedProfile.data);
        setProfileData({
          email: updatedProfile.data.email || "",
          username: updatedProfile.data.username || "",
          phone_Number: updatedProfile.data.phone_Number || "",
          bank_details:
            updatedProfile.data.bank_details ||
            ({
              account_number: "",
              ifsc_code: "",
              account_type: "",
              bank_account_holder_name: "",
              bank_name: "",
            } as UserBankDetails),
          address: updatedProfile.data.address || [],
          vehicle_details: updatedProfile.data.vehicle_details || [],
        });
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      showToast(error.message || "Failed to update profile", "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleDeleteAccount = () => {
    showToast("Please contact support to delete your account.", "warning");
  };

  const handleAddAddress = () => {
    setIsAddingAddress(true);
    setNewAddress({
      nick_name: "",
      street: "",
      city: "",
      pincode: "",
      state: "",
    });
  };

  useEffect(() => {
    console.log("Address states changed:", {
      isAddingAddress,
      editingAddressIndex,
      activeTab,
    });
  }, [isAddingAddress, editingAddressIndex, activeTab]);

  const handleCancelAddAddress = () => {
    setIsAddingAddress(false);
    setEditingAddressIndex(null);
    setNewAddress({
      nick_name: "",
      street: "",
      city: "",
      pincode: "",
      state: "",
    });
  };

  const handleEditAddress = (addressIndex: number) => {
    const address = profileData.address?.[addressIndex];
    if (address) {
      setEditingAddressIndex(addressIndex);
      setNewAddress({
        nick_name: address.nick_name || "",
        street: address.street || "",
        city: address.city || "",
        pincode: address.pincode || "",
        state: address.state || "",
      });
    }
  };
  useEffect(() => {
    const fetchTickets = async () => {
      if (activeTab !== "tickets") return;
      try {
        setTicketsLoading(true);
        setTicketsError(null);
        const res = await getTicketByUser(userId || "");
        // console.log("Tickets response:", res);
        // defensive check for response shape
        const data = res?.data || [];
        // const data: any[] =  [];
        setTickets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
        setTicketsError("Failed to load tickets");
      } finally {
        setTicketsLoading(false);
      }
    };

    fetchTickets();
  }, [activeTab]);
  const handleDeleteVehicle = async (vehicleId: string) => {
    const res = await deleteVehicle(userId || "", vehicleId);
    if (res.success) {
      showToast("Vehicle deleted successfully", "success");
      setUserProfile((prev: any) => ({
        ...prev,
        vehicle_details:
          prev.vehicle_details?.filter(
            (vehicle: { _id: string }) => vehicle._id !== vehicleId
          ) || [],
      }));
    } else {
      showToast(res.message || "Failed to delete vehicle", "error");
    }
  };

  const handleEditVehicle = (vehicleId: string) => {
    const vehicle = vehicleDetails.find((v: any) => v._id === vehicleId);

    if (!vehicle) {
      // fallback: try to find in userProfile.vehicle_details (if different shape)
      const fallback = userProfile?.vehicle_details?.find(
        (v: any) => v._id === vehicleId
      );
      if (fallback) {
        setEditingVehicle({
          vehicle_type: fallback.vehicle_type || "",
          brand: (fallback.brand && typeof fallback.brand === 'object' && (fallback.brand as any)._id) || fallback.brand || "",
          model: (fallback.model && typeof fallback.model === 'object' && (fallback.model as any)._id) || fallback.model || "",
          variant: (fallback.variant && typeof fallback.variant === 'object' && (fallback.variant as any)._id) || fallback.variant || "",
          _original: fallback,
        });
        return;
      }

      showToast("Vehicle data not found", "error");
      return;
    }

    setEditingVehicle({
      vehicle_type: vehicle.vehicle_type || vehicle.type || "",
      brand: vehicle.brand?._id || vehicle.brand || "",
      model: vehicle.model?._id || vehicle.model || "",
      variant: vehicle.variant?._id || vehicle.variant || "",
      _original: vehicle,
    });
  };

  const handleCancelEditAddress = () => {
    setEditingAddressIndex(null);
    setNewAddress({
      nick_name: "",
      street: "",
      city: "",
      pincode: "",
      state: "",
    });
  };

  const handleSaveAddress = async () => {
    if (!userId) {
      showToast("User ID not found", "error");
      return;
    }

    if (
      !newAddress.nick_name ||
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.pincode ||
      !newAddress.state
    ) {
      showToast("Please fill in all required address fields", "error");
      return;
    }

    if (!/^[0-9]{6}$/.test(newAddress.pincode)) {
      showToast("Please enter a valid 6-digit pincode", "error");
      return;
    }

    setShowUpdateConfirmation(true);
  };

  const confirmSaveAddress = async () => {
    setShowUpdateConfirmation(false);

    if (!userId) {
      showToast("User ID not found", "error");
      return;
    }

    try {
      setUpdatingAddress(true);

      if (editingAddressIndex !== null) {
        const editData: EditAddressRequest = {
          index: editingAddressIndex,
          updatedAddress: newAddress,
        };

        const response = await editUserAddress(userId, editData);

        if (response.success) {
          showToast("Address updated successfully", "success");
          setEditingAddressIndex(null);

          const updatedProfile = await getUserProfile(userId);
          if (updatedProfile.success && updatedProfile.data) {
            setUserProfile(updatedProfile.data);
            setProfileData((prev) => ({
              ...prev,
              address: updatedProfile.data.address || [],
            }));
          }
        } else {
          showToast(response.message || "Failed to update address", "error");
        }
      } else {
        const updatedAddressList = [...(profileData.address || []), newAddress];

        const addressData: UpdateAddressRequest = {
          address: updatedAddressList,
        };

        const response = await updateUserAddress(userId, addressData);

        if (response.success) {
          showToast("Address added successfully", "success");
          setIsAddingAddress(false);

          setProfileData((prev) => ({
            ...prev,
            address: updatedAddressList,
          }));

          const updatedProfile = await getUserProfile(userId);
          if (updatedProfile.success && updatedProfile.data) {
            setUserProfile(updatedProfile.data);
          }
        } else {
          showToast(response.message || "Failed to add address", "error");
        }
      }
    } catch (error: any) {
      console.error("Error saving address:", error);
      const action = editingAddressIndex !== null ? "update" : "add";
      showToast(error.message || `Failed to ${action} address`, "error");
    } finally {
      setUpdatingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressIndex: number) => {
    if (!userId) {
      showToast("User ID not found", "error");
      return;
    }

    setPendingDeleteIndex(addressIndex);
    setShowDeleteConfirmation(true);
  };
  useEffect(() => {
    const getVehicleById = async () => {
      try {
        const res = await getUserById(userId || "");
        if (res.data) {
          console.log("Fetched user data:", res.data);
        }
      } catch (err: any) {
      } finally {
      }
    };

    getVehicleById();
  }, []);
  const confirmDeleteAddress = async () => {
    if (pendingDeleteIndex === null) return;

    setShowDeleteConfirmation(false);
    const addressIndex = pendingDeleteIndex;
    setPendingDeleteIndex(null);

    if (!userId) {
      showToast("User ID not found", "error");
      return;
    }

    try {
      setUpdatingAddress(true);

      const updatedAddressList =
        profileData.address?.filter((_, index) => index !== addressIndex) || [];

      const addressData: UpdateAddressRequest = {
        address: updatedAddressList,
      };

      const response = await updateUserAddress(userId, addressData);

      if (response.success) {
        showToast("Address deleted successfully", "success");

        setProfileData((prev) => ({
          ...prev,
          address: updatedAddressList,
        }));

        const updatedProfile = await getUserProfile(userId);
        if (updatedProfile.success && updatedProfile.data) {
          setUserProfile(updatedProfile.data);
        }
      } else {
        showToast(response.message || "Failed to delete address", "error");
      }
    } catch (error: any) {
      console.error("Error deleting address:", error);
      showToast(error.message || "Failed to delete address", "error");
    } finally {
      setUpdatingAddress(false);
    }
  };

  const handleViewOrderDetails = (orderId: string) => {
    router.push(`/shop/order/${orderId}`);
  };

  const handleOpenReviewModal = (orderId: string) => {
    setSelectedOrderForReview(orderId);
    setReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedOrderForReview(null);
  };

  const handleSubmitReview = async (rating: number, review: string) => {
    if (!selectedOrderForReview || !userId) {
      showToast("Unable to submit review", "error");
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await addOrderRating({
        orderId: selectedOrderForReview,
        ratting: rating,
        review: review,
      });

      if (response.success) {
        showToast("Review submitted successfully", "success");
        handleCloseReviewModal();
        
        // Refresh orders list
        const ordersResponse = await getUserOrders(userId);
        if (ordersResponse.success && ordersResponse.data) {
          setUserOrders(ordersResponse.data);
        }
      } else {
        showToast(response.message || "Failed to submit review", "error");
      }
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      showToast(error.message || "Failed to submit review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-success/10 text-success border-success/20";
      case "shipped":
        return "bg-primary/10 text-primary border-primary/20";
      case "processing":
        return "bg-warning/10 text-warning border-warning/20";
      case "pending":
        return "bg-muted text-muted-foreground border-muted";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };
  const handleSavedVehicle = async (newVehicle: any) => {
    if (!userId) {
      showToast("User not found. Please login again.", "error");
      return;
    }

    try {
      let response;

      if (editingVehicle) {
        // Edit existing vehicle
        response = await editVehicle(
          userId,
          (editingVehicle as any)._original._id,
          {
            vehicle_type: newVehicle.vehicle_type,
            brand: newVehicle.brand,
            model: newVehicle.model,
            variant: newVehicle.variant,
          }
        );
      } else {
        // Add new vehicle
        response = await addVehicle(userId, {
          vehicle_type: newVehicle.vehicle_type,
          brand: newVehicle.brand,
          model: newVehicle.model,
          variant: newVehicle.variant,
        });
      }

      if (response.success) {
        showToast(
          editingVehicle
            ? "Vehicle updated successfully!"
            : "Vehicle added successfully!",
          "success"
        );

        // Refresh user profile to get updated vehicle details
        const updatedProfile = await getUserProfile(userId);
        if (updatedProfile.success) {
          setUserProfile(updatedProfile.data);
        }

        // Reset editing state
        setEditingVehicle(null);
      } else {
        showToast(
          response.message ||
            `Failed to ${editingVehicle ? "update" : "add"} vehicle`,
          "error"
        );
      }
    } catch (error) {
      console.error(
        `Error ${editingVehicle ? "updating" : "adding"} vehicle:`,
        error
      );
      showToast(
        `Failed to ${
          editingVehicle ? "update" : "add"
        } vehicle. Please try again.`,
        "error"
      );
    }
  };
  // Fetch vehicle details
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      console.log("Fetching vehicle details", userProfile?.vehicle_details);
      if (
        !userProfile?.vehicle_details ||
        userProfile.vehicle_details.length === 0
      ) {
        setVehicleDetails([]);
        return;
      }

      setVehicleDetailsLoading(true);
      setVehicleDetails([]);

      try {
        const vehicleDetailsArr = userProfile.vehicle_details as any[];
        for (const vehicle of vehicleDetailsArr) {
          const response = await getVehicleDetails(
            vehicle.brand,
            vehicle.model,
            vehicle.variant
          );

          if (response?.data) {
            setVehicleDetails((prev: any[]) => [...prev, response.data]);
            console.log("Vehicle Details: all:", response.data);
          }
        }
      } catch (err) {
        console.error("Error fetching vehicle details:", err);
      } finally {
        setVehicleDetailsLoading(false);
      }
    };

    if (userProfile && activeTab === "saved-vehicles") {
      fetchVehicleDetails();
    }
  }, [userProfile, activeTab]);
  console.log(
    "ProfilePage render - activeTab:",
    activeTab,
    "isEditing:",
    isEditing
  );

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="bg-card border-b border-border/50">
        <div className="container mx-auto px-4 py-6 max-sm:px-3 max-sm:py-4">
          <div className="flex items-center justify-between max-sm:flex-col max-sm:gap-3 max-sm:items-start">
            <div className="max-sm:w-full">
              <h1 className="text-2xl font-bold text-foreground max-sm:text-xl max-sm:text-left">My Profile</h1>
              <p className="text-sm text-muted-foreground mt-1 max-sm:text-xs max-sm:text-left">
                Manage your account settings and preferences
              </p>
            </div>
            {activeTab === "profile" && (
              <Button
                onClick={() =>
                  isEditing ? handleSaveProfile() : setIsEditing(true)
                }
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg max-sm:w-full max-sm:px-4"
                disabled={updatingProfile}
              >
                {isEditing ? (
                  <>
                    {updatingProfile ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {updatingProfile ? "Saving..." : "Save Changes"}
                  </>
                ) : (
                  <>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-sm:px-3 max-sm:py-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6 max-sm:space-y-4"
        >
          <div className="max-sm:overflow-x-auto max-sm:-mx-3 max-sm:px-3">
            <TabsList className="bg-gray-100 border border-gray-300 p-1 h-auto flex-wrap max-sm:flex-nowrap max-sm:min-w-max">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-200 text-gray-700 max-sm:text-xs max-sm:whitespace-nowrap max-sm:px-3"
            >
              <User className="mr-2 h-4 w-4 max-sm:mr-1 max-sm:h-3 max-sm:w-3" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-200 text-gray-700 max-sm:text-xs max-sm:whitespace-nowrap max-sm:px-3"
            >
              <ShoppingBag className="mr-2 h-4 w-4 max-sm:mr-1 max-sm:h-3 max-sm:w-3" />
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="wishlists"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-200 text-gray-700 max-sm:text-xs max-sm:whitespace-nowrap max-sm:px-3"
            >
              <Heart className="mr-2 h-4 w-4 max-sm:mr-1 max-sm:h-3 max-sm:w-3" />
              Favourites
            </TabsTrigger>
            <TabsTrigger
              value="addresses"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-200 text-gray-700 max-sm:text-xs max-sm:whitespace-nowrap max-sm:px-3"
            >
              <MapPin className="mr-2 h-4 w-4 max-sm:mr-1 max-sm:h-3 max-sm:w-3" />
              Addresses
            </TabsTrigger>
            <TabsTrigger
              value="saved-vehicles"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-200 text-gray-700 max-sm:text-xs max-sm:whitespace-nowrap max-sm:px-3"
            >
              <Bus className="mr-2 h-4 w-4 max-sm:mr-1 max-sm:h-3 max-sm:w-3" />
              Saved Vehicles
            </TabsTrigger>
            <TabsTrigger
              value="tickets"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-200 text-gray-700 max-sm:text-xs max-sm:whitespace-nowrap max-sm:px-3"
            >
              <TicketIcon className="mr-2 h-4 w-4 max-sm:mr-1 max-sm:h-3 max-sm:w-3" />
              Tickets
            </TabsTrigger>
            <TabsTrigger
              value="purchase order requests"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-200 text-gray-700 max-sm:text-xs max-sm:whitespace-nowrap max-sm:px-3"
            >
              <NotepadText className="mr-2 h-4 w-4 max-sm:mr-1 max-sm:h-3 max-sm:w-3" />
              Purchase Order Requests
            </TabsTrigger>
            <TabsTrigger
              value="return requests"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-200 text-gray-700 max-sm:text-xs max-sm:whitespace-nowrap max-sm:px-3"
            >
              <Redo2 className="mr-2 h-4 w-4 max-sm:mr-1 max-sm:h-3 max-sm:w-3" />
              Return Requests
            </TabsTrigger>
          </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 mt-6 max-sm:space-y-4 max-sm:mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading profile...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-sm:gap-4">
                  <ProfileSection
                    title="Personal Details"
                    description="Your personal information and contact details"
                  >
                    <div className="space-y-4 max-sm:space-y-3">
                      {isEditing ? (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={profileData.email}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  email: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              type="text"
                              value={profileData.username}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  username: e.target.value,
                                })
                              }
                              placeholder="Enter your username"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone_Number">Phone Number</Label>
                            <Input
                              id="phone_Number"
                              type="tel"
                              value={profileData.phone_Number}
                              disabled
                              placeholder="Enter your phone number"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <DataField
                            label="Email"
                            value={profileData.email || "Not set"}
                          />
                          <DataField
                            label="Username"
                            value={profileData.username || "Not set"}
                          />
                          <DataField
                            label="Phone Number"
                            value={profileData.phone_Number || "Not set"}
                          />
                        </>
                      )}
                    </div>
                  </ProfileSection>

                  <ProfileSection
                    title="Bank Details"
                    description="Manage your banking information for payments and refunds"
                  >
                    <div className="space-y-4 max-sm:space-y-3">
                      {isEditing ? (
                        <>
                          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1 max-sm:gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="account_number">
                                Account Number
                              </Label>
                              <Input
                                id="account_number"
                                value={profileData.bank_details.account_number}
                                onChange={(e) =>
                                  setProfileData({
                                    ...profileData,
                                    bank_details: {
                                      ...profileData.bank_details,
                                      account_number: e.target.value,
                                    },
                                  })
                                }
                                placeholder="Enter account number"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="ifsc_code">IFSC Code</Label>
                              <Input
                                id="ifsc_code"
                                value={profileData.bank_details.ifsc_code}
                                onChange={(e) =>
                                  setProfileData({
                                    ...profileData,
                                    bank_details: {
                                      ...profileData.bank_details,
                                      ifsc_code: e.target.value,
                                    },
                                  })
                                }
                                placeholder="Enter IFSC code"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bank_name">Bank Name</Label>
                            <Input
                              id="bank_name"
                              value={profileData.bank_details.bank_name}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  bank_details: {
                                    ...profileData.bank_details,
                                    bank_name: e.target.value,
                                  },
                                })
                              }
                              placeholder="Enter bank name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bank_account_holder_name">
                              Account Holder Name
                            </Label>
                            <Input
                              id="bank_account_holder_name"
                              value={
                                profileData.bank_details
                                  .bank_account_holder_name
                              }
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  bank_details: {
                                    ...profileData.bank_details,
                                    bank_account_holder_name: e.target.value,
                                  },
                                })
                              }
                              placeholder="Enter account holder name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="account_type">Account Type</Label>
                            <Select
                              value={
                                profileData.bank_details.account_type || ""
                              }
                              onValueChange={(value) => {
                                if (
                                  ["Savings", "Current", "Fixed Deposit", "Recurring Deposit"].includes(
                                    value
                                  )
                                ) {
                                  setProfileData({
                                    ...profileData,
                                    bank_details: {
                                      ...profileData.bank_details,
                                      account_type: value,
                                    },
                                  });
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select account type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Savings">Savings</SelectItem>
                                <SelectItem value="Current">Current</SelectItem>
                                <SelectItem value="Fixed Deposit">Fixed Deposit</SelectItem>
                                <SelectItem value="Recurring Deposit">Recurring Deposit</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      ) : (
                        <>
                          <DataField
                            label="Account Number"
                            value={
                              profileData.bank_details.account_number ||
                              "Not set"
                            }
                          />
                          <DataField
                            label="IFSC Code"
                            value={
                              profileData.bank_details.ifsc_code || "Not set"
                            }
                          />
                          <DataField
                            label="Bank Name"
                            value={
                              profileData.bank_details.bank_name || "Not set"
                            }
                          />
                          <DataField
                            label="Account Holder Name"
                            value={
                              profileData.bank_details
                                .bank_account_holder_name || "Not set"
                            }
                          />
                          <DataField
                            label="Account Type"
                            value={
                              profileData.bank_details.account_type || "Not set"
                            }
                          />
                        </>
                      )}
                    </div>
                  </ProfileSection>
                </div>

                <ProfileSection
                  title="Account Settings"
                  description="Manage your account preferences and security"
                >
                  <div className="space-y-4 max-sm:space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20 max-sm:flex-col max-sm:gap-3 max-sm:p-3">
                      <div>
                        <p className="font-medium text-destructive">
                          Delete Account
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        className="max-sm:w-full"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </ProfileSection>
              </>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6 mt-6 max-sm:space-y-4 max-sm:mt-4">
            <ProfileSection
              title="Order History"
              description="View and track all your orders"
            >
              <ScrollArea className="h-[600px] pr-4 max-sm:h-[500px] max-sm:pr-2">
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading orders...</span>
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-sm:space-y-3">
                    {userOrders.map((order) => (
                      <div
                        key={order._id}
                        className="p-4 rounded-lg border border-border/50 hover:shadow-md transition-all max-sm:p-3"
                      >
                      <div className="flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-3">
                        <div className="flex items-center gap-4 max-sm:gap-3 max-sm:w-full">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center max-sm:h-10 max-sm:w-10 flex-shrink-0">
                            <Package className="h-6 w-6 text-primary max-sm:h-5 max-sm:w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground max-sm:text-sm">
                              {order.orderId}
                            </p>
                            <p className="text-sm text-muted-foreground max-sm:text-xs">
                              {formatDate(order.orderDate)} •{" "}
                              {order.skus.length} items
                            </p>
                          </div>
                        </div>
                        <div className="text-right max-sm:w-full max-sm:flex max-sm:items-center max-sm:justify-between max-sm:text-left">
                          <p className="font-semibold text-foreground max-sm:text-sm">
                          ₹{(order.order_Amount)?.toLocaleString() || '0'}
                          </p>
                          <Badge className={getStatusBadgeColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between text-sm text-muted-foreground max-sm:flex-col max-sm:items-start max-sm:gap-2 max-sm:text-xs">
                          <span>Payment: {order.paymentType}</span>
                          <div className="flex items-center gap-2 max-sm:flex-wrap max-sm:w-full">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOrderDetails(order._id)}
                              className="max-sm:flex-1"
                            >
                              View Details
                            </Button>
                            {order.order_track_info?.borzo_tracking_url && (
                              <Button variant="outline" size="sm" asChild className="max-sm:flex-1">
                                <a
                                  href={
                                    order.order_track_info.borzo_tracking_url
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4 mr-1 max-sm:h-3 max-sm:w-3" />
                                  <span className="max-sm:hidden">Track Order</span>
                                  <span className="sm:hidden">Track</span>
                                </a>
                              </Button>
                            )}
                            {order.status.toLowerCase() === "delivered" && !order.review && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenReviewModal(order._id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 max-sm:flex-1"
                              >
                                <Star className="h-4 w-4 mr-1 max-sm:h-3 max-sm:w-3" />
                                <span className="max-sm:hidden">Add Review</span>
                                <span className="sm:hidden">Review</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}</ScrollArea>
            </ProfileSection>
          </TabsContent>

          {/* Wishlists Tab */}
          <TabsContent value="wishlists" className="space-y-6 mt-6 max-sm:space-y-4 max-sm:mt-4">
            <ProfileSection
              title="My Wishlists"
              description="Items you've saved for later"
            >
              {wishlistLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading wishlist...</p>
                </div>
              ) : userWishlist.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No items in your wishlist
                  </p>
                  <Button className="mt-4 bg-gradient-primary">
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {Array.isArray(userWishlist) &&
                    userWishlist.map((item, index) => {
                      const product = item.productDetails || item;
                      return (
                        <Card
                          key={item._id || index}
                          className="group bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 overflow-hidden"
                        >
                          <div className="relative h-32 bg-gray-100 overflow-hidden max-sm:h-28">
                            {product.model?.model_image ? (
                              <img
                                src={product.model.model_image}
                                alt={
                                  product.model.model_name ||
                                  product.product_name
                                }
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    product.images && product.images.length > 0
                                      ? product.images[0]
                                      : "/placeholder-product.png";
                                }}
                              />
                            ) : product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.product_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/placeholder-product.png";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <img
                                  src="/placeholder-product.png"
                                  alt="No image"
                                  className="w-16 h-16 object-contain opacity-50"
                                />
                              </div>
                            )}
                            <div className="absolute top-3 right-3">
                              <button
                                onClick={() =>
                                  handleRemoveFromWishlist(product._id)
                                }
                                disabled={removingFromWishlist.includes(
                                  product._id
                                )}
                                className="p-1 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
                              >
                                {removingFromWishlist.includes(product._id) ? (
                                  <Loader2 className="h-5 w-5 text-red-500 animate-spin" />
                                ) : (
                                  <Heart
                                    className="h-5 w-5 text-red-500"
                                    fill="currentColor"
                                  />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="relative p-4 max-sm:p-3">
                            <div className="flex items-start justify-between mb-3 max-sm:mb-2">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base font-semibold text-gray-900 line-clamp-1 mb-1 max-sm:text-sm">
                                  {product.product_name ||
                                    product.name ||
                                    "Unnamed Product"}
                                </CardTitle>
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-red-50 text-red-700 border-red-200 font-medium px-2 py-0.5 max-sm:text-[10px] max-sm:px-1.5"
                                >
                                  {product.sku_code || product.sku || "No SKU"}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-2 max-sm:space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600 font-medium">
                                  Price
                                </span>
                                <span className="text-base font-bold text-green-600">
                                  ₹
                                  {product.selling_price ||
                                    product.price ||
                                    "N/A"}
                                </span>
                              </div>

                              {product.mrp_with_gst &&
                                product.selling_price &&
                                product.mrp_with_gst >
                                  product.selling_price && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 line-through">
                                      MRP
                                    </span>
                                    <span className="text-xs text-gray-500 line-through">
                                      ₹{product.mrp_with_gst}
                                    </span>
                                  </div>
                                )}

                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600 font-medium">
                                  Model
                                </span>
                                <span className="text-xs text-gray-900 truncate">
                                  {product.model?.model_name || "N/A"}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600 font-medium">
                                  Category
                                </span>
                                <span className="text-xs text-gray-900 truncate">
                                  {product.category?.category_name ||
                                    product.category ||
                                    "N/A"}
                                </span>
                              </div>
                            </div>

                            <div className="mt-3 flex gap-2 max-sm:mt-2">
                              <Link href={`/shop/product/${product._id}`} className="flex-1">
                                <Button
                                  size="sm"
                                  className="w-full bg-primary hover:opacity-90 text-white text-xs max-sm:text-[10px]"
                                >
                                  View Details
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                className="px-2"
                                onClick={() => handleMoveToCart(product._id)}
                                disabled={movingToCart.includes(product._id)}
                              >
                                {movingToCart.includes(product._id) ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <ShoppingBag className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                </div>
              )}
            </ProfileSection>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6 mt-6 max-sm:space-y-4 max-sm:mt-4">
            <div className="flex justify-between items-center mb-4 gap-3">
              <h2 className="text-lg font-semibold text-foreground max-sm:text-base max-sm:flex-shrink-0">
                Saved Addresses
              </h2>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg max-sm:px-4 max-sm:text-sm max-sm:whitespace-nowrap"
                onClick={handleAddAddress}
                disabled={isAddingAddress || editingAddressIndex !== null}
              >
                <Plus className="mr-2 h-4 w-4 max-sm:h-3 max-sm:w-3" />
                Add New Address
              </Button>
            </div>

            {(isAddingAddress || editingAddressIndex !== null) && (
              <ProfileSection
                title={
                  editingAddressIndex !== null
                    ? "Edit Address"
                    : "Add New Address"
                }
                description={
                  editingAddressIndex !== null
                    ? "Update the details for your address"
                    : "Enter the details for your new address"
                }
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nick_name">Address Nickname *</Label>
                      <Select
                        value={newAddress.nick_name || ""}
                        onValueChange={(value) => {
                          if (["Home", "Work", "Shop"].includes(value)) {
                            setNewAddress({
                              ...newAddress,
                              nick_name: value,
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select address type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="Shop">Shop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        type="tel"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        value={newAddress.pincode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          if (value.length <= 6) {
                            setNewAddress({
                              ...newAddress,
                              pincode: value,
                            });
                          }
                        }}
                        placeholder="Enter 6-digit pincode"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      value={newAddress.street}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, street: e.target.value })
                      }
                      placeholder="Enter street address"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm">City *</Label>
                      <Input
                        id="city"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            state: e.target.value,
                          })
                        }
                        placeholder="Enter state"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 max-sm:flex-col">
                    <Button
                      onClick={handleSaveAddress}
                      disabled={updatingAddress || showUpdateConfirmation}
                      className="bg-gradient-to-r from-[#c72920] to-[#e5665f] text-white hover:opacity-90 max-sm:w-full"
                    >
                      {updatingAddress ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {editingAddressIndex !== null
                            ? "Update Address"
                            : "Save Address"}
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={
                        editingAddressIndex !== null
                          ? handleCancelEditAddress
                          : handleCancelAddAddress
                      }
                      disabled={updatingAddress}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </ProfileSection>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-sm:gap-4">
              {profileData.address && profileData.address.length > 0 ? (
                profileData.address.map((address, index) => (
                  <ProfileSection
                    key={index}
                    title={address.nick_name || `Address ${index + 1}`}
                    className="relative"
                  >
                    <div className="space-y-3 max-sm:space-y-2">
                      <p className="text-sm text-muted-foreground max-sm:text-xs">
                        {address.street}
                      </p>
                      <p className="text-sm text-muted-foreground max-sm:text-xs">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAddress(index)}
                          disabled={
                            updatingAddress || editingAddressIndex !== null
                          }
                          className="max-sm:flex-1"
                        >
                          <Edit2 className="mr-2 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 max-sm:flex-1"
                          onClick={() => handleDeleteAddress(index)}
                          disabled={
                            updatingAddress ||
                            editingAddressIndex !== null ||
                            showDeleteConfirmation
                          }
                        >
                          {updatingAddress ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-3 w-3" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  </ProfileSection>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No addresses saved yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add your first address to get started
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Saved Vehicles Tab */}
          <TabsContent value="saved-vehicles" className="space-y-6 mt-6 max-sm:space-y-4 max-sm:mt-4">
            <div className="flex justify-between items-center mb-4 gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground max-sm:text-base">
                  Saved Vehicles
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-sm:text-xs">
                  Vehicles linked to your account
                </p>
              </div>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg max-sm:px-4 max-sm:text-sm max-sm:whitespace-nowrap flex-shrink-0"
                onClick={() => setIsOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4 max-sm:h-3 max-sm:w-3" />
                Add Vehicle
              </Button>
            </div>
            <ProfileSection
              title=""
              description=""
            >
              {vehicleDetailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading vehicle details...</span>
                </div>
              ) : vehicleDetails?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-sm:gap-3">
                  {vehicleDetails.map((vehicle: any, index: number) => (
                    <div key={index} className="relative">
                      <Link href={`/profile/vehicles/${vehicle._id}`}>
                        <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-center gap-3 sm:gap-4">
                            {/* Brand Logo */}
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              {vehicle.brand?.brand_logo ? (
                                <img
                                  src={vehicle.brand.brand_logo}
                                  alt={vehicle.brand.brand_name}
                                  className="h-8 w-8 object-contain"
                                />
                              ) : (
                                <Bus className="h-6 w-6 text-primary" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground">
                                {vehicle.brand?.brand_name || "Unknown Brand"}{" "}
                                {vehicle.model?.model_name || "Unknown Model"}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {vehicle.variant?.variant_name ||
                                  "Unknown Variant"}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                      {/* Menu Icon and Dropdown */}
                      <div className="absolute top-4 right-4">
                        <div className="relative">
                          <button
                            className="p-1 rounded-full hover:bg-gray-100"
                            onClick={() =>
                              setIsMenuOpen(isMenuOpen === index ? null : index)
                            }
                          >
                            <MoreVertical className="h-6 w-6 text-gray-600" />
                          </button>
                          {isMenuOpen === index && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  const vehicleId =
                                    userProfile?.vehicle_details?.[index]
                                      ?._id ?? vehicleDetails?.[index]?._id;

                                  if (!vehicleId) {
                                    showToast("Vehicle id not found", "error");
                                    return;
                                  }

                                  handleEditVehicle(vehicleId);
                                  setIsOpen(true); // open dialog
                                  setIsMenuOpen(null); // close dropdown
                                }}
                              >
                                Edit
                              </button>

                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  const vehicleId =
                                    userProfile?.vehicle_details?.[index]
                                      ?._id ??
                                    (vehicleDetails?.[index] as any)?._id;

                                  if (!vehicleId) {
                                    showToast("Vehicle id not found", "error");
                                    return;
                                  }

                                  setPendingDeleteVehicle(vehicleId);
                                  setShowDeleteVehicleConfirmation(true);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (userProfile?.vehicle_details ?? []).length > 0 ? (
                <div className="text-center py-12">
                  <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Unable to load vehicle details
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    There was an error fetching your vehicle information.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No saved vehicles</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    You haven't added any vehicles yet.
                  </p>
                </div>
              )}
            </ProfileSection>
          </TabsContent>

          {/* Tickets Tab - Enhanced Minimalist Design */}
          <TabsContent value="tickets" className="space-y-6 mt-6 max-sm:space-y-4 max-sm:mt-4">
            <ProfileSection
              title="Tickets"
              description=" Raise a ticket and we'll get back to you as soon as possible."
            >
              <DynamicButton
                text="Rice Ticket"
                className="bg-red-600 hover:bg-red-700 text-white mb-4 max-sm:w-full max-sm:text-sm"
                onClick={() => setIsRiseTicketOpen(true)}
              />
               <ScrollArea className="h-[600px] pr-4 max-sm:h-[500px] max-sm:pr-2">
              {ticketsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                      <div className="absolute inset-0 rounded-full border-2 border-red-100 animate-pulse"></div>
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">Loading tickets...</span>
                  </div>
                </div>
              ) : ticketsError ? (
                <div className="rounded-xl border border-red-200/50 bg-gradient-to-br from-red-50/50 to-red-100/20 p-8 text-center backdrop-blur-sm">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-red-800 font-medium">{ticketsError}</p>
                  <p className="text-sm text-red-600/80 mt-1">Please try refreshing the page</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-16">
                  <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
                    <TicketIcon className="h-8 w-8 text-gray-400" />
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                      <Plus className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets yet</h3>
                  {/* <p className="text-sm text-gray-600 max-w-sm mx-auto mb-6">
                    When you have support tickets or event tickets, they'll appear here with a clean, organized view.
                  </p> */}
                  <Link href="/support">
                    {/* <Button className="bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md transition-all duration-200">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button> */}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 max-sm:space-y-3">
                  {tickets.map((t: any) => {
                    const status = (t.status || "").toLowerCase();
                    const statusConfigs: Record<string, { bg: string; text: string; dot: string; label: string }> = {
                      open: {
                        bg: "bg-amber-50 border-amber-200/50",
                        text: "text-amber-700",
                        dot: "bg-amber-400",
                        label: "OPEN"
                      },
                      "in progress": {
                        bg: "bg-blue-50 border-blue-200/50",
                        text: "text-blue-700",
                        dot: "bg-blue-400",
                        label: "IN PROGRESS"
                      },
                      closed: {
                        bg: "bg-green-50 border-green-200/50",
                        text: "text-green-700",
                        dot: "bg-green-400",
                        label: "CLOSED"
                      },
                      resolved: {
                        bg: "bg-emerald-50 border-emerald-200/50",
                        text: "text-emerald-700",
                        dot: "bg-emerald-400",
                        label: "RESOLVED"
                      },
                      pending: {
                        bg: "bg-gray-50 border-gray-200/50",
                        text: "text-gray-700",
                        dot: "bg-gray-400",
                        label: "PENDING"
                      }
                    };

                    const statusConfig = statusConfigs[status] || {
                      bg: "bg-gray-50 border-gray-200/50",
                      text: "text-gray-700",
                      dot: "bg-gray-400",
                      label: (t.status || "UNKNOWN").toUpperCase()
                    };

                    return (
                      <div
                        key={t._id || t.ticketId || t.id}
                        className="group relative overflow-hidden rounded-xl border border-gray-200/60 bg-white/50 backdrop-blur-sm hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:border-gray-300/60"
                      >
                        {/* Subtle gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative p-5 max-sm:p-3">
                          <div className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-start">
                            <div className="flex items-center gap-4 min-w-0 flex-1 max-sm:gap-3 max-sm:w-full">
                              {/* Status Indicator */}
                              <div className="flex-shrink-0">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} text-xs font-semibold max-sm:gap-1.5 max-sm:px-2 max-sm:py-1 max-sm:text-[10px]`}>
                                  <div className={`h-2 w-2 rounded-full ${statusConfig.dot} animate-pulse`}></div>
                                  {statusConfig.label}
                                </div>
                              </div>

                              {/* Content */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1 max-sm:gap-1.5">
                                  <TicketIcon className="h-4 w-4 text-gray-400 flex-shrink-0 max-sm:h-3 max-sm:w-3" />
                                  <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-0.5 rounded truncate max-sm:text-[10px] max-sm:px-1.5">
                                    #{t.ticket_number || t._id || t.id}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 max-sm:gap-1.5 max-sm:text-xs">
                                  <Calendar className="h-3.5 w-3.5 text-gray-400 max-sm:h-3 max-sm:w-3" />
                                  <span>
                                    {new Date(
                                      t.created_at ||
                                        t.createdAt ||
                                        t.created ||
                                        Date.now()
                                    ).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex-shrink-0 ml-4 max-sm:ml-0 max-sm:w-full">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleView(t)}
                                className="bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm max-sm:w-full max-sm:text-xs"
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-1.5 max-sm:h-3 max-sm:w-3" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Bottom accent line */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    );
                  })}
                </div>
              )}</ScrollArea>
            </ProfileSection>
          </TabsContent>

<TabsContent value="purchase order requests" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
  <ProfileSection
    title="Purchase Order Requests"
    description="Your submitted purchase order requests"
  >
    <div className="flex justify-end mb-4">
      <Button
        className="bg-red-600 hover:bg-red-700 text-white text-sm w-full sm:w-auto px-4 py-2"
        onClick={() => setUploadDialogOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Upload Purchase Order Request</span>
        <span className="sm:hidden">Upload PO</span>
      </Button>
    </div>

    {purchaseOrdersLoading ? (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading purchase orders...</span>
      </div>
    ) : purchaseOrdersError ? (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium">{purchaseOrdersError}</p>
      </div>
    ) : purchaseOrders.length === 0 ? (
      <div className="border border-border/50 rounded-lg bg-card p-10 text-center shadow-sm">
        <TicketIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-foreground">No Purchase Order Requests</h2>
        <p className="text-sm text-muted-foreground mt-2">
          You haven't created any purchase order requests yet. They'll show up here once available.
        </p>
      </div>
    ) : (
      <>
        <div className="space-y-4 max-sm:space-y-3">
          {purchaseOrders.map((po) => (
            <div
              key={po._id}
              className="p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition max-sm:p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">
                    ID: {po._id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setSelected(po); setDialogOpen(true); }} className="text-xs max-sm:px-3">
                    View
                  </Button>
                </div>
              </div>

              <p className="mt-2 text-sm text-muted-foreground line-clamp-2 max-sm:text-xs">
                {po.description || "No description provided."}
              </p>

              {Array.isArray(po.req_files) && po.req_files.length > 0 && (
                <div className="mt-3 max-sm:mt-2">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {po.req_files.map((url: string, idx: number) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-shrink-0"
                      >
                        <img
                          src={url}
                          alt={`Attachment ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded-md border border-border hover:border-primary transition-colors max-sm:w-12 max-sm:h-12"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </a>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {po.req_files.length} attachment{po.req_files.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-xs max-sm:mt-2">
                <span className="text-muted-foreground truncate">
                  Created: {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : "—"}
                </span>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize flex-shrink-0 ml-2 ${
                  (po.status || "").toLowerCase() === "approved"
                    ? "bg-green-100 text-green-800"
                    : (po.status || "").toLowerCase() === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {po.status || "pending"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {purchaseOrderPagination.totalPages > 1 && (
          <div className="mt-6">
            <DynamicPagination
              currentPage={purchaseOrderPage}
              totalPages={purchaseOrderPagination.totalPages}
              onPageChange={setPurchaseOrderPage}
              totalItems={purchaseOrderPagination.totalItems}
              itemsPerPage={purchaseOrderLimit}
              showItemsInfo={true}
            />
          </div>
        )}
      </>
    )}
  </ProfileSection>
</TabsContent>


<TabsContent value="return requests" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
  <ProfileSection
    title="Return Requests"
    description="Your submitted return requests"
  >
    {userProfile && userProfile._id ? (
      <ReturnRequestList userId={userProfile._id} />
    ) : (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please log in to view return requests</p>
      </div>
    )}
  </ProfileSection>
</TabsContent>

        </Tabs>
      </div>
      

      <ConfirmationDialog
        isOpen={showUpdateConfirmation}
        onClose={() => setShowUpdateConfirmation(false)}
        onConfirm={confirmSaveAddress}
        title="Confirm Address Update"
        description={
          editingAddressIndex !== null
            ? "Are you sure you want to update this address?"
            : "Are you sure you want to add this new address?"
        }
        confirmText="Yes, Save"
        cancelText="Cancel"
      />
      <ConfirmationDialog
        isOpen={showDeleteVehicleConfirmation}
        onClose={() => {
          setShowDeleteVehicleConfirmation(false);
          setPendingDeleteVehicle(null);
        }}
        onConfirm={() => {
          if (pendingDeleteVehicle) {
            handleDeleteVehicle(pendingDeleteVehicle);
            setPendingDeleteVehicle(null);
          }
          setShowDeleteVehicleConfirmation(false);
        }}
        title="Confirm Vehicle Deletion"
        description="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setPendingDeleteIndex(null);
        }}
        onConfirm={confirmDeleteAddress}
        title="Confirm Address Deletion"
        description="Are you sure you want to delete this address? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
      <TicketDetailsDialog
        isOpen={ticketDialogOpen}
        onClose={() => {
          setTicketDialogOpen(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
      />
      <PurchaseOrderDialog
        isOpen={dialogOpen}
        onClose={() => { setDialogOpen(false); setSelected(null); }}
        purchaseOrder={selected}
      />
      <PurchaseOrderUploadDialog
        isOpen={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onSubmit={async () => {
          setPurchaseOrderPage(1);
          const res = await getPurchaseOrderById(userId, 1, purchaseOrderLimit);
          const items = res?.data?.data || [];
          setPurchaseOrders(Array.isArray(items) ? items : []);
          if (res?.data?.pagination) {
            setPurchaseOrderPagination({
              totalPages: res.data.pagination.totalPages || 1,
              totalItems: res.data.pagination.totalItems || 0,
            });
          }
        }}
      />
      <AddVehicleDialog
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditingVehicle(null);
        }}
        onSubmit={handleSavedVehicle}
        editingVehicle={editingVehicle}
      />
      <RiseTicket
        open={isRiseTicketOpen}
        onClose={() => setIsRiseTicketOpen(false)}
      />
      {selectedOrderForReview && (
        <OrderReviewModal
          isOpen={reviewModalOpen}
          onClose={handleCloseReviewModal}
          orderId={selectedOrderForReview}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
}
