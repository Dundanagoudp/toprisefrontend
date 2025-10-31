"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Calendar,
  DollarSign,
  Package,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Tag
} from "lucide-react";
import { getDealerProfileDetails } from "@/service/dealerServices";
import { Dealer } from "@/types/dealer-types";
import { useToast } from "@/components/ui/toast";

interface ProfileDetailProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | boolean;
  type?: "text" | "badge" | "boolean";
}

const ProfileDetail = ({ icon, label, value, type = "text" }: ProfileDetailProps) => {
  const renderValue = () => {
    switch (type) {
      case "boolean":
        return (
          <Badge variant={value ? "default" : "secondary"}>
            {value ? "Active" : "Inactive"}
          </Badge>
        );
      case "badge":
        return <Badge variant="outline">{String(value)}</Badge>;
      default:
        return <span className="text-gray-900">{String(value)}</span>;
    }
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 w-5 h-5 text-gray-500 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <div className="mt-1">
          {renderValue()}
        </div>
      </div>
    </div>
  );
};

interface EmployeeCardProps {
  employee: any;
}

const EmployeeCard = ({ employee }: EmployeeCardProps) => {
  if (!employee.assigned_user) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-center text-gray-500">
            <User className="h-8 w-8 mr-2" />
            <span>No employee assigned</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const emp = employee.assigned_user;
  const userDetails = emp.user_details || emp.user_id;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">{emp.First_name}</h4>
            <Badge variant={employee.status === "Active" ? "default" : "secondary"}>
              {employee.status}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <ProfileDetail
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={emp.email || userDetails?.email || "N/A"}
            />
            <ProfileDetail
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={emp.mobile_number || userDetails?.phone_Number || "N/A"}
            />
            <ProfileDetail
              icon={<Tag className="h-4 w-4" />}
              label="Employee ID"
              value={emp.employee_id || "N/A"}
            />
            <ProfileDetail
              icon={<Building2 className="h-4 w-4" />}
              label="Role"
              value={emp.role || "N/A"}
              type="badge"
            />
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <ProfileDetail
              icon={<Calendar className="h-4 w-4" />}
              label="Assigned At"
              value={new Date(employee.assigned_at).toLocaleDateString()}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DealerProfileDetails() {
  const [profile, setProfile] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const profileData = await getDealerProfileDetails();
        setProfile(profileData);
      } catch (err) {
        console.error("Failed to fetch dealer profile:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch profile details");
        showToast("Failed to load profile details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [showToast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <Skeleton className="h-5 w-5 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Profile</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Profile Data</h3>
          <p className="text-gray-600">No profile information found for your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dealer Profile</h1>
        <p className="text-gray-600">Complete profile information and business details</p>
      </div>

      {/* Main Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Business Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfileDetail
              icon={<Building2 className="h-4 w-4" />}
              label="Legal Name"
              value={profile.legal_name || "N/A"}
            />
            <ProfileDetail
              icon={<Tag className="h-4 w-4" />}
              label="Trade Name"
              value={profile.trade_name || "N/A"}
            />
            <ProfileDetail
              icon={<FileText className="h-4 w-4" />}
              label="GSTIN"
              value={profile.GSTIN || "N/A"}
            />
            <ProfileDetail
              icon={<FileText className="h-4 w-4" />}
              label="PAN"
              value={profile.Pan || "N/A"}
            />
            <ProfileDetail
              icon={<CheckCircle className="h-4 w-4" />}
              label="Status"
              value={profile.is_active}
              type="boolean"
            />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfileDetail
              icon={<User className="h-4 w-4" />}
              label="Contact Person"
              value={profile.contact_person?.name || "N/A"}
            />
            <ProfileDetail
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={profile.contact_person?.email || "N/A"}
            />
            <ProfileDetail
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={profile.contact_person?.phone_number || "N/A"}
            />
            <ProfileDetail
              icon={<Mail className="h-4 w-4" />}
              label="User Email"
              value={profile.user_id?.email || "N/A"}
            />
            <ProfileDetail
              icon={<Phone className="h-4 w-4" />}
              label="User Phone"
              value={profile.user_id?.phone_Number || "N/A"}
            />
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Address Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfileDetail
              icon={<MapPin className="h-4 w-4" />}
              label="Street"
              value={profile.Address?.street || "N/A"}
            />
            <ProfileDetail
              icon={<Building2 className="h-4 w-4" />}
              label="City"
              value={profile.Address?.city || "N/A"}
            />
            <ProfileDetail
              icon={<MapPin className="h-4 w-4" />}
              label="State"
              value={profile.Address?.state || "N/A"}
            />
            <ProfileDetail
              icon={<Tag className="h-4 w-4" />}
              label="Pincode"
              value={profile.Address?.pincode || "N/A"}
            />
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Business Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfileDetail
              icon={<DollarSign className="h-4 w-4" />}
              label="Default Margin"
              value={`${profile.default_margin || 0}%`}
            />
            <ProfileDetail
              icon={<Package className="h-4 w-4" />}
              label="Upload Access"
              value={profile.upload_access_enabled}
              type="boolean"
            />
            <ProfileDetail
              icon={<Clock className="h-4 w-4" />}
              label="SLA Type"
              value={profile.SLA_type || "N/A"}
              type="badge"
            />
            <ProfileDetail
              icon={<Clock className="h-4 w-4" />}
              label="SLA Max Dispatch Time"
              value={`${profile.SLA_max_dispatch_time || 0} hours`}
            />
            <ProfileDetail
              icon={<Calendar className="h-4 w-4" />}
              label="Onboarding Date"
              value={new Date(profile.onboarding_date).toLocaleDateString()}
            />
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Allowed Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
        <div className="flex flex-wrap gap-2">
          {(() => {
            const categories: any[] = Array.isArray((profile as any).categories_allowed)
              ? (profile as any).categories_allowed
              : Array.isArray((profile as any).assigned_categories)
              ? (profile as any).assigned_categories
              : [];

            if (!categories || categories.length === 0) {
              return <span className="text-gray-500">No categories assigned</span>;
            }

            return categories.map((cat: any, idx: number) => {
              // Support both id strings and populated objects
              const label = typeof cat === "string"
                ? cat
                : cat?.category_name || cat?.name || cat?._id || `Category ${idx + 1}`;
              return (
                <Badge key={idx} variant="outline" className="text-sm">
                  {label}
                </Badge>
              );
            });
          })()}
        </div>
        </CardContent>
      </Card>

      {/* Assigned Employees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Assigned Toprise Employees</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.assigned_Toprise_employee && profile.assigned_Toprise_employee.length > 0 ? (
              profile.assigned_Toprise_employee.map((employee: any, index: number) => (
                <EmployeeCard key={index} employee={employee} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <p>No employees assigned</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Additional Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProfileDetail
            icon={<Calendar className="h-4 w-4" />}
            label="Last Fulfillment Date"
            value={profile.last_fulfillment_date ? new Date(profile.last_fulfillment_date).toLocaleDateString() : "N/A"}
          />
          <ProfileDetail
            icon={<FileText className="h-4 w-4" />}
            label="Remarks"
            value={profile.remarks || "No remarks"}
          />
          <ProfileDetail
            icon={<Calendar className="h-4 w-4" />}
            label="Created At"
            value={new Date(profile.created_at).toLocaleDateString()}
          />
          <ProfileDetail
            icon={<Calendar className="h-4 w-4" />}
            label="Updated At"
            value={new Date(profile.updated_at).toLocaleDateString()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
