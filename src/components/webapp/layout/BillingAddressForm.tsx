"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useAppSelector } from "@/store/hooks";
import { getUserById, UpdateAddressRequest } from "@/service/user/userService";
import { useState, useEffect } from "react";

// Define the schema for the address form
const addressSchema = z.object({
  nick_name: z.string().min(1, "Nick Name is required"),
  building_no: z.string().min(1, "Building Number is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string()
    .min(1, "Pin Code is required")
    .regex(/^\d{6}$/, "Pin Code must be exactly 6 digits"),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

interface BillingAddressFormProps {
  onSubmit: (data: UpdateAddressRequest) => Promise<void>;
  onAddressSelect?: (address: any) => void;
  selectedAddressId?: string;
  isLoading?: boolean;
  title?: string;
  submitButtonText?: string;
  showSelection?: boolean;
}

export default function BillingAddressForm({
  onSubmit,
  onAddressSelect,
  selectedAddressId,
  isLoading = false,
  title = "Billing Address Details",
  submitButtonText = "Add Address",
  showSelection = false,
}: BillingAddressFormProps) {
  const [user, setUser] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      nick_name: "",
      building_no: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
    },
  });
  const userId = useAppSelector((state)=> state.auth.user?._id)

  const handleFormSubmit = async (data: AddressFormValues) => {
    try {
      console.log("Form submitted with data:", data);
      // Transform form data to API format (array of addresses)
      const addressData: UpdateAddressRequest = {
        address: [
          {
            nick_name: data.nick_name,
            building_no: data.building_no,
            street: data.street,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
          },
        ],
      };
      await onSubmit(addressData);
      reset();
      setShowForm(false); // Hide form after successful submission
      setShowAllAddresses(false); // Reset to show only first 3 addresses
      // Refetch user data to show updated addresses
      if (userId) {
        try {
          const response = await getUserById(userId);
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  useEffect(() => {
    const fetchUserById = async () => {
      if (!userId) return;
      try {
        const response = await getUserById(userId);
        setUser(response.data);
        // Show form automatically if no addresses exist
        if (!response.data?.address || response.data.address.length === 0) {
          setShowForm(true);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUserById();
  }, [userId]);
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {title}
        </h2>
        {!showForm && (
          <Button
            onClick={() => {
              console.log("Add New Address button clicked");
              setShowForm(true);
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Add New Address
          </Button>
        )}
      </div>

      {/* Existing Addresses */}
      {user?.address && user.address.length > 0 && !showForm && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Your Addresses</h3>
              {showSelection && (
                <p className="text-sm text-gray-600 mt-1">Select an address for your order</p>
              )}
            </div>
            {user.address.length > 3 && (
              <Button
                variant="outline"
                onClick={() => setShowAllAddresses(!showAllAddresses)}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                {showAllAddresses ? 'View Less' : `View More (${user.address.length - 3} more)`}
              </Button>
            )}
          </div>
          <div className="grid gap-4">
            {(showAllAddresses ? user.address : user.address.slice(0, 3)).map((address: any, index: number) => {
              const isSelected = showSelection && selectedAddressId === address._id;
              return (
                <div
                  key={index}
                  className={`border rounded-lg p-4 transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-red-500 bg-red-50 shadow-md' 
                      : 'border-gray-200 hover:border-red-300'
                  } ${showSelection ? 'cursor-pointer' : ''}`}
                  onClick={() => showSelection && onAddressSelect?.(address)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {showSelection && (
                        <div className="mt-1">
                          <input
                            type="radio"
                            name="selectedAddress"
                            checked={isSelected}
                            onChange={() => onAddressSelect?.(address)}
                            className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm font-medium px-2 py-1 rounded ${
                            isSelected 
                              ? 'text-red-700 bg-red-100' 
                              : 'text-red-600 bg-red-50'
                          }`}>
                            {address.nick_name || `Address ${index + 1}`}
                          </span>
                          {isSelected && (
                            <span className="text-xs text-red-600 font-medium">Selected</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="text-gray-900 font-medium">{address.street}</p>
                          <p>{address.city}, {address.state}</p>
                          <p>Pin Code: {address.pincode}</p>
                        </div>
                      </div>
                    </div>
                    {!showSelection && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {!showAllAddresses && user.address.length > 3 && (
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                Showing 3 of {user.address.length} addresses
              </p>
            </div>
          )}
        </div>
      )}

      {/* No addresses message */}
      {(!user?.address || user.address.length === 0) && !showForm && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses found</h3>
          <p className="text-gray-600 mb-4">Add your first address to continue</p>
        </div>
      )}

      {/* Address Form */}
      {showForm && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add New Address</h3>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              className="text-gray-600"
            >
              Cancel
            </Button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="nick_name"
                className="block text-sm font-medium text-gray-700"
              >
                Add address type
              </label>
              <Controller
                name="nick_name"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Select a address type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Home">Home</SelectItem>
                      <SelectItem value="Office">shop</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
                      
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.nick_name && (
                <p className="text-red-600 text-sm">
                  {errors.nick_name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="building_no"
                className="block text-sm font-medium text-gray-700"
              >
                Building Number
              </label>
              <Input
                id="building_no"
                {...register("building_no")}
                placeholder="Building Number"
                className="mt-1"
              />
              {errors.building_no && (
                <p className="text-red-600 text-sm">
                  {errors.building_no.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="street"
                className="block text-sm font-medium text-gray-700"
              >
                Street
              </label>
              <Input
                id="street"
                {...register("street")}
                placeholder="Street Address"
                className="mt-1"
              />
              {errors.street && (
                <p className="text-red-600 text-sm">
                  {errors.street.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City
                </label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="City"
                  className="mt-1"
                />
                {errors.city && (
                  <p className="text-red-600 text-sm">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State
                </label>
                <Input
                  id="state"
                  {...register("state")}
                  placeholder="State"
                  className="mt-1"
                />
                {errors.state && (
                  <p className="text-red-600 text-sm">
                    {errors.state.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="pincode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Pin Code
                </label>
                <Input
                  id="pincode"
                  {...register("pincode")}
                  placeholder="Pin Code"
                  className="mt-1"
                  maxLength={6}
                />
                {errors.pincode && (
                  <p className="text-red-600 text-sm">
                    {errors.pincode.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2"
                disabled={isLoading}
                onClick={() => {
                  console.log("Submit button clicked");
                  console.log("Form errors:", errors);
                }}
              >
                {isLoading ? "Adding..." : submitButtonText}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 