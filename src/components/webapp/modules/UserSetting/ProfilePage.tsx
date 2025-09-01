import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileSection } from "./ProfileSection";
import { DataField } from "./DataField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
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
  X
} from "lucide-react";

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
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+91 65238 23587",
    dob: "1990-01-15",
    gender: "male",
    language: "english"
  });

  // Company/GST state
  const [companyData, setCompanyData] = useState({
    companyName: "Tech Solutions Pvt Ltd",
    gstNumber: "29ABCDE1234F1Z5",
    panNumber: "ABCDE1234F",
    address: "123 Business Park, Bangalore"
  });

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      type: "home",
      name: "John Doe",
      street: "123 Main Street, Apartment 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      phone: "+91 98765 43210",
      isDefault: true
    },
    {
      id: "2",
      type: "work",
      name: "John Doe",
      street: "456 Business Park, Tower A",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      phone: "+91 98765 43211",
      isDefault: false
    }
  ]);

  // Orders state
  const [orders] = useState<Order[]>([
    {
      id: "1",
      orderNumber: "ORD-2024-001",
      date: "2024-01-15",
      status: "delivered",
      total: 2499,
      items: 3
    },
    {
      id: "2",
      orderNumber: "ORD-2024-002",
      date: "2024-01-20",
      status: "shipped",
      total: 1299,
      items: 1
    },
    {
      id: "3",
      orderNumber: "ORD-2024-003",
      date: "2024-01-25",
      status: "processing",
      total: 4999,
      items: 5
    }
  ]);

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Action Required",
      description: "Please contact support to delete your account.",
      variant: "destructive"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-success/10 text-success border-success/20";
      case "shipped": return "bg-primary/10 text-primary border-primary/20";
      case "processing": return "bg-warning/10 text-warning border-warning/20";
      case "pending": return "bg-muted text-muted-foreground border-muted";
      case "cancelled": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-muted";
    }
  };

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
            {activeTab === "profile" && (
              <Button
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                className="bg-gradient-primary hover:opacity-90"
              >
                {isEditing ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border/50 p-1 h-auto flex-wrap">
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              <User className="mr-2 h-4 w-4" />
              My Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              <ShoppingBag className="mr-2 h-4 w-4" />
              My Orders
            </TabsTrigger>
            <TabsTrigger value="wishlists" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              <Heart className="mr-2 h-4 w-4" />
              My Wishlists
            </TabsTrigger>
            <TabsTrigger value="addresses" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              <MapPin className="mr-2 h-4 w-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="company" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
              <Building2 className="mr-2 h-4 w-4" />
              Company/GST
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProfileSection
                title="Personal Details"
                description="Your personal information and contact details"
              >
                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          id="dob"
                          type="date"
                          value={profileData.dob}
                          onChange={(e) => setProfileData({...profileData, dob: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={profileData.gender} onValueChange={(value) => setProfileData({...profileData, gender: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <DataField label="First Name" value={profileData.firstName} />
                        <DataField label="Last Name" value={profileData.lastName} />
                      </div>
                      <DataField label="Email" value={profileData.email} />
                      <DataField label="Date of Birth" value={new Date(profileData.dob).toLocaleDateString()} />
                      <DataField label="Gender" value={profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1)} />
                    </>
                  )}
                </div>
              </ProfileSection>

              <ProfileSection
                title="Phone Number"
                description="Manage your phone number for account security"
              >
                <div className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-2">
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm">
                          Verify
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{profileData.phone}</p>
                          <p className="text-sm text-muted-foreground">Primary phone</p>
                        </div>
                      </div>
                      <Badge className="bg-success/10 text-success border-success/20">Verified</Badge>
                    </div>
                  )}
                </div>
              </ProfileSection>
            </div>

            <ProfileSection
              title="Account Settings"
              description="Manage your account preferences and security"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">Change Password</p>
                    <p className="text-sm text-muted-foreground">Update your password regularly for security</p>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div>
                    <p className="font-medium text-destructive">Delete Account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </ProfileSection>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6 mt-6">
            <ProfileSection
              title="Order History"
              description="View and track all your orders"
            >
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 rounded-lg border border-border/50 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.date).toLocaleDateString()} • {order.items} items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">₹{order.total}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ProfileSection>
          </TabsContent>

          {/* Wishlists Tab */}
          <TabsContent value="wishlists" className="space-y-6 mt-6">
            <ProfileSection
              title="My Wishlists"
              description="Items you've saved for later"
            >
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No items in your wishlist</p>
                <Button className="mt-4 bg-gradient-primary">Browse Products</Button>
              </div>
            </ProfileSection>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">Saved Addresses</h2>
              <Button className="bg-gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add New Address
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <ProfileSection
                  key={address.id}
                  title={address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                  className="relative"
                >
                  {address.isDefault && (
                    <Badge className="absolute top-4 right-4 bg-success/10 text-success border-success/20">
                      Default
                    </Badge>
                  )}
                  <div className="space-y-3">
                    <p className="font-medium text-foreground">{address.name}</p>
                    <p className="text-sm text-muted-foreground">{address.street}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {address.phone}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        <Edit2 className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </ProfileSection>
              ))}
            </div>
          </TabsContent>

          {/* Company/GST Tab */}
          <TabsContent value="company" className="space-y-6 mt-6">
            <ProfileSection
              title="Company Information"
              description="Manage your business details and tax information"
            >
              <div className="space-y-4">
                <DataField label="Company Name" value={companyData.companyName} />
                <DataField label="GST Number" value={companyData.gstNumber} />
                <DataField label="PAN Number" value={companyData.panNumber} />
                <DataField label="Registered Address" value={companyData.address} />
                <div className="pt-4">
                  <Button variant="outline">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Company Details
                  </Button>
                </div>
              </div>
            </ProfileSection>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}