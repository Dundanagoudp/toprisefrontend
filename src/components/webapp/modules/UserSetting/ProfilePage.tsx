"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileSection } from "./ProfileSection";
import { DataField } from "./DataField";
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
} from "@/service/user/userService";
import { getUserOrders, Order as UserOrder, getWishlistByUser, moveToCart, removeWishlistByUser } from "@/service/user/orderService";
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
  Ticket,
 
} from "lucide-react";
import Link from "next/link";
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
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [userWishlist, setUserWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [movingToCart, setMovingToCart] = useState<string[]>([]);
  const [removingFromWishlist, setRemovingFromWishlist] = useState<string[]>([]);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingAddress, setUpdatingAddress] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(
    null
  );
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
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

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await getUserProfile(userId);
        if (response.success && response.data) {
          setUserProfile(response.data);
          // Update profile form data with fetched data
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

  // Fetch user orders when orders tab is active
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

  // Fetch user wishlist when wishlists tab is active
  useEffect(() => {
    const fetchUserWishlist = async () => {
      if (!userId || activeTab !== "wishlists") return;

      try {
        setWishlistLoading(true);
        const response = await getWishlistByUser(userId);

        // Handle malformed responses
        if (!response || typeof response !== 'object') {
          console.error("Invalid response format:", response);
          setUserWishlist([]);
          return;
        }

        if (response.success) {
          let wishlistData: any[] = [];

          if (Array.isArray(response.data)) {
            wishlistData = response.data;
          } else if (response.data && typeof response.data === 'object') {
            // Handle nested structure like { items: [...] } or similar
            if (Array.isArray(response.data.items)) {
              wishlistData = response.data.items;
            } else if (Array.isArray(response.data.products)) {
              wishlistData = response.data.products;
            } else if (Array.isArray(response.data.wishlist)) {
              wishlistData = response.data.wishlist;
            } else {
              // If data is an object but not an array, wrap it in an array if it looks like a product
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

  // Handle moving wishlist item to cart
  const handleMoveToCart = async (productId: string) => {
    if (!userId) return;

    try {
      setMovingToCart(prev => [...prev, productId]);

      const response = await moveToCart({
        userId: userId,
        productId: productId
      });

      if (response.success) {
        showToast("Item moved to cart successfully!", "success");
        // Refresh wishlist to remove the moved item
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
      setMovingToCart(prev => prev.filter(id => id !== productId));
    }
  };

  // Handle removing item from wishlist
  const handleRemoveFromWishlist = async (productId: string) => {
    if (!userId) return;

    try {
      setRemovingFromWishlist(prev => [...prev, productId]);

      const response = await removeWishlistByUser({
        userId: userId,
        productId: productId
      });

      if (response.success) {
        showToast("Item removed from wishlist", "success");
        // Remove item from local state immediately
        setUserWishlist(prev => prev.filter(item =>
          (item.productDetails?._id || item._id) !== productId
        ));
      } else {
        showToast("Failed to remove item from wishlist", "error");
      }
    } catch (error) {
      console.error("Failed to remove item from wishlist:", error);
      showToast("Failed to remove item from wishlist", "error");
    } finally {
      setRemovingFromWishlist(prev => prev.filter(id => id !== productId));
    }
  };

  // Profile form state - updated to match user model
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

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Helper function to get status badge color
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

  // Addresses state - will be populated from user profile
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Update addresses when user profile is loaded
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

  const handleSaveProfile = async () => {
    if (!userId) {
      showToast("User ID not found", "error");
      return;
    }

    try {
      setUpdatingProfile(true);

      // Prepare the update data - only include fields that have changed
      const updateData: UpdateProfileRequest = {};

      // Add email if it's different from current profile
      if (profileData.email && profileData.email !== userProfile?.email) {
        updateData.email = profileData.email;
      }

      // Add username if it's different from current profile
      if (
        profileData.username &&
        profileData.username !== userProfile?.username
      ) {
        updateData.username = profileData.username;
      }

      // Add bank details if they exist
      if (
        profileData.bank_details &&
        Object.values(profileData.bank_details).some((value) => value)
      ) {
        updateData.bank_details = profileData.bank_details;
      }

      // Add address if it exists
      if (profileData.address && profileData.address.length > 0) {
        updateData.address = profileData.address;
      }

      // Add vehicle details if they exist
      if (
        profileData.vehicle_details &&
        profileData.vehicle_details.length > 0
      ) {
        updateData.vehicle_details = profileData.vehicle_details;
      }

      // Only make API call if there are changes
      if (Object.keys(updateData).length === 0) {
        showToast("No changes to save", "warning");
        setIsEditing(false);
        return;
      }

      const response = await updateUserProfile(userId, updateData);

      if (response.success) {
        showToast("Profile updated successfully", "success");
        setIsEditing(false);

        // Refresh the profile data
        const updatedProfile = await getUserProfile(userId);
        if (updatedProfile.success && updatedProfile.data) {
          setUserProfile(updatedProfile.data);
          // Update the form data with the new values
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
      } else {
        showToast(response.message || "Failed to update profile", "error");
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

  // Address management functions
  const handleAddAddress = () => {
    console.log("Add address clicked, current states:", {
      isAddingAddress,
      editingAddressIndex,
    });
    setIsAddingAddress(true);
    setNewAddress({
      nick_name: "",
      street: "",
      city: "",
      pincode: "",
      state: "",
    });
  };

  // Debug effect to track state changes
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

    // Validate required fields
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

    // Validate pincode format (exactly 6 digits)
    if (!/^[0-9]{6}$/.test(newAddress.pincode)) {
      showToast("Please enter a valid 6-digit pincode", "error");
      return;
    }

    // Show confirmation dialog
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
        // Editing existing address - use edit endpoint
        const editData: EditAddressRequest = {
          index: editingAddressIndex,
          updatedAddress: newAddress,
        };

        const response = await editUserAddress(userId, editData);

        if (response.success) {
          showToast("Address updated successfully", "success");
          setEditingAddressIndex(null);

          // Refresh the profile data
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
        // Adding new address - use add endpoint
        const updatedAddressList = [...(profileData.address || []), newAddress];

        const addressData: UpdateAddressRequest = {
          address: updatedAddressList,
        };

        const response = await updateUserAddress(userId, addressData);

        if (response.success) {
          showToast("Address added successfully", "success");
          setIsAddingAddress(false);

          // Update the profile data with new address
          setProfileData((prev) => ({
            ...prev,
            address: updatedAddressList,
          }));

          // Refresh the profile data
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

    // Show confirmation dialog
    setPendingDeleteIndex(addressIndex);
    setShowDeleteConfirmation(true);
  };

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

      // Remove the address at the specified index
      const updatedAddressList =
        profileData.address?.filter((_, index) => index !== addressIndex) || [];

      const addressData: UpdateAddressRequest = {
        address: updatedAddressList,
      };

      const response = await updateUserAddress(userId, addressData);

      if (response.success) {
        showToast("Address deleted successfully", "success");

        // Update the profile data
        setProfileData((prev) => ({
          ...prev,
          address: updatedAddressList,
        }));

        // Refresh the profile data
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

  // Debug logging
  console.log(
    "ProfilePage render - activeTab:",
    activeTab,
    "isEditing:",
    isEditing
  );

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <div className="bg-card border-b border-border/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your account settings and preferences
              </p>
            </div>
            {/* Test button - always visible */}
            <Button
              onClick={() =>
                isEditing ? handleSaveProfile() : setIsEditing(true)
              }
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg"
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-gray-100 border border-gray-300 p-1 h-auto flex-wrap">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-200 text-gray-700"
            >
              <User className="mr-2 h-4 w-4" />
              My Profile
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-200 text-gray-700"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              My Orders
            </TabsTrigger>
            <TabsTrigger
              value="wishlists"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-200 text-gray-700"
            >
              <Heart className="mr-2 h-4 w-4" />
              My Wishlists
            </TabsTrigger>
            <TabsTrigger
              value="addresses"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-200 text-gray-700"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger
              value="saved-vehicles"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-200 text-gray-700"
            >
              <Bus className="mr-2 h-4 w-4" />
             Saved Vehicles
            </TabsTrigger>
            <TabsTrigger
              value="tickets"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-200 text-gray-700"
            >
              <Ticket className="mr-2 h-4 w-4" />
             Tickets
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading profile...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ProfileSection
                    title="Personal Details"
                    description="Your personal information and contact details"
                  >
                    <div className="space-y-4">
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
                    <div className="space-y-4">
                      {isEditing ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
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
                              value={profileData.bank_details.account_type}
                              onValueChange={(value) =>
                                setProfileData({
                                  ...profileData,
                                  bank_details: {
                                    ...profileData.bank_details,
                                    account_type: value,
                                  },
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select account type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="savings">Savings</SelectItem>
                                <SelectItem value="current">Current</SelectItem>
                                <SelectItem value="salary">Salary</SelectItem>
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
                  <div className="space-y-4">
             
                    <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
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
          <TabsContent value="orders" className="space-y-6 mt-6">
            <ProfileSection
              title="Order History"
              description="View and track all your orders"
            >
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
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div
                      key={order._id}
                      className="p-4 rounded-lg border border-border/50 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {order.orderId}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(order.orderDate)} •{" "}
                              {order.skus.length} items
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {formatCurrency(order.order_Amount)}
                          </p>
                          <Badge className={getStatusBadgeColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Payment: {order.paymentType}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOrderDetails(order._id)}
                            >
                              View Details
                            </Button>
                            {order.order_track_info?.borzo_tracking_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={
                                    order.order_track_info.borzo_tracking_url
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Track Order
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ProfileSection>
          </TabsContent>

          {/* Wishlists Tab */}
          <TabsContent value="wishlists" className="space-y-6 mt-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.isArray(userWishlist) && userWishlist.map((item, index) => {
                    const product = item.productDetails || item;
                    return (
                      <Card key={item._id || index} className="group bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 overflow-hidden">
                        {/* Product Image */}
                        <div className="relative h-32 bg-gray-100 overflow-hidden">
                          {product.model?.model_image ? (
                            <img
                              src={product.model.model_image}
                              alt={product.model.model_name || product.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = product.images && product.images.length > 0
                                  ? product.images[0]
                                  : '/placeholder-product.png';
                              }}
                            />
                          ) : product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-product.png';
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
                              onClick={() => handleRemoveFromWishlist(product._id)}
                              disabled={removingFromWishlist.includes(product._id)}
                              className="p-1 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
                            >
                              {removingFromWishlist.includes(product._id) ? (
                                <Loader2 className="h-5 w-5 text-red-500 animate-spin" />
                              ) : (
                                <Heart className="h-5 w-5 text-red-500" fill="currentColor" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="relative p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base font-semibold text-gray-900 line-clamp-1 mb-1">
                                {product.product_name || product.name || "Unnamed Product"}
                              </CardTitle>
                              <Badge
                                variant="outline"
                                className="text-xs bg-red-50 text-red-700 border-red-200 font-medium px-2 py-0.5"
                              >
                                {product.sku_code || product.sku || "No SKU"}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600 font-medium">Price</span>
                              <span className="text-base font-bold text-green-600">
                                ₹{product.selling_price || product.price || "N/A"}
                              </span>
                            </div>

                            {product.mrp_with_gst && product.selling_price && product.mrp_with_gst > product.selling_price && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 line-through">MRP</span>
                                <span className="text-xs text-gray-500 line-through">
                                  ₹{product.mrp_with_gst}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600 font-medium">Model</span>
                              <span className="text-xs text-gray-900 truncate">
                                {product.model?.model_name || "N/A"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600 font-medium">Category</span>
                              <span className="text-xs text-gray-900 truncate">
                                {product.category?.category_name || product.category || "N/A"}
                              </span>
                            </div>

                   
                          </div>

                          <div className="mt-3 flex gap-2">
                            <Link href={`/shop/product/${product._id}`}>
                              <Button size="sm" className="flex-1 bg-primary hover:opacity-90 text-white text-xs">
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
          <TabsContent value="addresses" className="space-y-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Saved Addresses
              </h2>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg"
                onClick={handleAddAddress}
                disabled={isAddingAddress || editingAddressIndex !== null}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Address
              </Button>
            </div>

            {/* Add/Edit Address Form */}
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
                        value={newAddress.nick_name}
                        onValueChange={(value) =>
                          setNewAddress({
                            ...newAddress,
                            nick_name: value,
                          })
                        }
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
                          const value = e.target.value.replace(/[^0-9]/g, '');
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
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
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSaveAddress}
                      disabled={updatingAddress || showUpdateConfirmation}
                      className="bg-gradient-to-r from-[#c72920] to-[#e5665f] text-white hover:opacity-90"
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

            {/* Existing Addresses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {profileData.address && profileData.address.length > 0 ? (
                profileData.address.map((address, index) => (
                  <ProfileSection
                    key={index}
                    title={address.nick_name || `Address ${index + 1}`}
                    className="relative"
                  >
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {address.street}
                      </p>
                      <p className="text-sm text-muted-foreground">
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
                        >
                          <Edit2 className="mr-2 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteAddress(index)}
                          disabled={
                            updatingAddress || editingAddressIndex !== null || showDeleteConfirmation
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
        </Tabs>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showUpdateConfirmation}
        onClose={() => setShowUpdateConfirmation(false)}
        onConfirm={confirmSaveAddress}
        title="Confirm Address Update"
        description={editingAddressIndex !== null
          ? "Are you sure you want to update this address?"
          : "Are you sure you want to add this new address?"
        }
        confirmText="Yes, Save"
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
    </div>
  );
}
