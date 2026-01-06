"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { dealerSchema, type DealerFormValues } from "@/lib/schemas/dealer-schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Check, ChevronsUpDown } from "lucide-react"
import { createDealer, getAllCategories, getAllSlaTypes } from "@/service/dealerServices"
import { getPincodes, Pincode } from "@/service/pincodeServices"
import { getAllFulfillmentStaff, getAllFulfillmentStaffWithoutPagination } from "@/service/employeeServices"
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { useState, useEffect, Fragment, useRef } from "react"
import type { User, Category } from "@/types/dealer-types"
import { SlaType } from "@/types/sla-types"
import { useRouter } from "next/navigation"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { useAppSelector } from "@/store/hooks"
import { getBrand } from "@/service/product-Service"

export default function AddDealer() {
  const { showToast } = useGlobalToast();
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [allBrands, setAllBrands] = useState<any[]>([])
  const [pincodes, setPincodes] = useState<Pincode[]>([])
  const [slaTypes, setSlaTypes] = useState<SlaType[]>([])
  const [submitLoading, setSubmitLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [formData, setFormData] = useState<DealerFormValues | null>(null)
  const allowedRoles = ["Super-admin", "Inventory-Admin", "Fulfillment-Admin"];
  const auth = useAppSelector((state) => state.auth.user);

  const form = useForm<DealerFormValues>({
    resolver: zodResolver(dealerSchema) as any, 
    defaultValues: {  
      email: "",
      password: "",
      phone_Number: "",
      serviceable_pincodes: [],
      legal_name: "",
      trade_name: "",
      GSTIN: "",
      Pan: "",
      Address: {
        street: "",
        city: "",
        pincode: "",
        state: "",
      },
      contact_person: {
        name: "",
        email: "",
        phone_number: "",
      },
      brands_allowed: [],
      upload_access_enabled: true,
      default_margin: 15,
      last_fulfillment_date: new Date().toISOString(),
      assigned_Toprise_employee: [],
      SLA_type: "Standard",
      onboarding_date: new Date().toISOString().split("T")[0], // Format as YYYY-MM-DD
      remarks: "",
    },
  })

  useEffect(() => {
    fetchUsers()
    fetchBrands()
    fetchSlaTypes()
    fetchPincodes()
  }, [])

  // Ensure form is properly reset when component mounts
  useEffect(() => {
    form.reset({
      email: "",
      password: "",
      phone_Number: "",
      serviceable_pincodes: [],
      legal_name: "",
      trade_name: "",
      GSTIN: "",
      Pan: "",
      Address: {
        street: "",
        city: "",
        pincode: "",
        state: "",
      },
      contact_person: {
        name: "",
        email: "",
        phone_number: "",
      },
      brands_allowed: [],
      upload_access_enabled: true,
      default_margin: 15,
      last_fulfillment_date: new Date().toISOString(),
      assigned_Toprise_employee: [],
      SLA_type: "Standard",
      onboarding_date: new Date().toISOString().split("T")[0],
      remarks: "",
    })
  }, [form])

  const fetchUsers = async () => {
    setIsLoadingData(true)
    try {
      const response = await getAllFulfillmentStaffWithoutPagination()
      
      if (response.success && response.data?.data) {
        const staff = response.data.data
          .filter((s: any) => s.role === "Fulfillment-Staff")
          .map((s: any) => ({
            _id: s._id,
            email: s.email,
            username: s.First_name,
            employee_id: s.employee_id,
          }))
        
        setUsers(staff)
        if (staff.length === 0) {
          showToast("No Fulfillment Staff found.", "warning");
        }
      }
    } catch (error) {
      showToast("Failed to load fulfillment staff.", "error");
    } finally {
      setIsLoadingData(false)
    }
  }

  const fetchBrands = async () => {
    try {
      const brandsResponse = await getBrand()
      if (brandsResponse.success) {
        setAllBrands(brandsResponse.data)
      }
    } catch (error) {
      showToast("Failed to load brands. Please refresh the page.", "error");
    }
  }

  const fetchSlaTypes = async () => {
    try {
      const slaTypesResponse = await getAllSlaTypes()
      const item = slaTypesResponse.data
      setSlaTypes(item)
    } catch (error) {
      showToast("Failed to load SLA types. Please refresh the page.", "error");
    }
  }

  const fetchPincodes = async () => {
    try {
      const response = await getPincodes({ limit: 1000 });
      if (response.success && response.data?.pincodes) {
        setPincodes(response.data.pincodes);
      }
    } catch (error) {
      console.error("Failed to fetch pincodes:", error);
    }
  }

  const onSubmit = async (data: DealerFormValues) => {
    setFormData(data)
    setShowConfirmDialog(true)
  }

  const handleConfirmSubmit = async () => {
    if (!formData) return
    
    setSubmitLoading(true)
    try {
      // Ensure remarks is always a string
      const safeData = { ...formData, password: formData.password ?? "", remarks: formData.remarks ?? "" };
      const response = await createDealer(safeData)
      if (response.success) {
        // Enhanced success notification
        showToast(`Dealer "${formData.legal_name}" (${formData.trade_name}) has been created successfully! They can now log in and start using the platform. 🎉`, "success");
        
        // Close confirmation dialog
        setShowConfirmDialog(false);
        
        // Redirect after showing success message
        setTimeout(() => {
          router.push("/user/dashboard/user");
        }, 2000);
      }
    } catch (error: any) {
      // Enhanced error handling with specific messages for duplicates
      let errorMessage = "Failed to create dealer. Please try again.";

      console.error("Error creating dealer:", error);
      
      // Extract specific error message from API response
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid data provided. Please check your inputs.";
      } else if (error.response?.status === 409) {
        errorMessage = "Dealer with this email, phone number, GSTIN, or PAN already exists.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }

      // Log the full error details for debugging
      if (error.response) {
        console.error("API error response:", error.response.data);
      }

      showToast(errorMessage, "error");
      setShowConfirmDialog(false); // Close confirmation dialog on error
    } finally {
      setSubmitLoading(false)
    }
  }

  // Role-based access control
  if (!auth || !allowedRoles.includes(auth.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600 font-bold">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  if (isLoadingData) {
    return (
      <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading form data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-(neutral-100)-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Add Dealer</h1>
        <p className="text-sm text-gray-500">Add your dealer details</p>
      </div>

      <Form {...form}>
        <form id="add-dealer-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative pb-20">
          {/* Account Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">Account Information</CardTitle>
              <p className="text-sm text-gray-500">Login credentials and basic account details.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} className="bg-gray-50 border-gray-200" autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                        className="bg-gray-50 border-gray-200"
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_Number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Phone Number"
                        maxLength={15}
                        {...field}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "");
                          field.onChange(digitsOnly);
                        }}
                        className="bg-gray-50 border-gray-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* servicesble pincode dropdown */}

              <FormField
                control={form.control}
                name="serviceable_pincodes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode (Serviceable)</FormLabel>
                    <FormControl>
                      <MultiSelectDropdown
                        options={pincodes}
                        selected={field.value || []}
                        onChange={field.onChange}
                        placeholder="Select Pincodes"
                        labelKey="pincode"
                        valueKey="_id"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">Business Information</CardTitle>
              <p className="text-sm text-gray-500">Legal business details and tax information.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="legal_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABC Enterprises Pvt. Ltd."
                        {...field}
                        className="bg-gray-50 border-gray-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trade_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trade Name</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC Traders" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="GSTIN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSTIN</FormLabel>
                    <FormControl>
                      <Input placeholder="GSTIN" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Pan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN</FormLabel>
                    <FormControl>
                      <Input placeholder="Pan" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">Address Information</CardTitle>
              <p className="text-sm text-gray-500">Business address details.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="Address.street"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="MG Road" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Bangalore" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="Karnataka" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Address.pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Pincode"
                        maxLength={6}
                        {...field}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "");
                          field.onChange(digitsOnly);
                        }}
                        className="bg-gray-50 border-gray-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Person */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">Contact Person</CardTitle>
              <p className="text-sm text-gray-500">Primary contact person details.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contact_person.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_person.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_person.phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person Phone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Phone Number"
                        maxLength={15}
                        {...field}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "");
                          field.onChange(digitsOnly);
                        }}
                        className="bg-gray-50 border-gray-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Brands & Access */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">Brands & Access</CardTitle>
              <p className="text-sm text-gray-500">Product Brands and access permissions.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brands Allowed *</label>
                {/* Multi-select Dropdown */}
                <MultiSelectDropdown
                  options={allBrands}
                  selected={form.watch("brands_allowed")}
                  onChange={(selected) => form.setValue("brands_allowed", selected)}
                />
                {form.formState.errors.brands_allowed && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.brands_allowed.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="upload_access_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">Upload Access Enabled</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="default_margin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Margin (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="15"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="bg-gray-50 border-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* SLA & Operations */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">SLA & Operations</CardTitle>
              <p className="text-sm text-gray-500">Service level agreements and operational settings.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="SLA_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SLA Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 border-gray-200">
                          <SelectValue placeholder="Select SLA Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {slaTypes && slaTypes.length > 0 ? (
                          slaTypes.map((sla) => (
                            <SelectItem key={sla._id} value={sla._id}>
                              {sla.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-sla-types" disabled>No SLA Types</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="last_fulfillment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Fulfillment Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? field.value.split("T")[0] : ""}
                        readOnly
                        className="bg-gray-100 border-gray-200 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </CardContent>
          </Card>

          {/* Employee Assignment */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600 font-semibold text-lg">Assignment & Additional Info</CardTitle>
              <p className="text-sm text-gray-500">Employee assignment and additional details.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="assigned_Toprise_employee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Fulfillment Staff</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange([{ assigned_user: value, status: "Active" }])
                      }}
                      value={field.value?.[0]?.assigned_user || ""}
                      disabled={isLoadingData}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 border-gray-200">
                          <SelectValue placeholder={
                            isLoadingData 
                              ? "Loading fulfillment staff..." 
                              : users.length === 0 
                              ? "No fulfillment staff available" 
                              : "Select a fulfillment staff"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.length === 0 ? (
                          <SelectItem value="no-users" disabled>
                            No fulfillment staff found
                          </SelectItem>
                        ) : (
                          users.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                              {user.username || user.email} ({user.employee_id}) - {user.email}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="onboarding_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Onboarding Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-gray-50 border-gray-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Additional notes about the dealer"
                          {...field}
                          className="bg-gray-50 border-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              form="add-dealer-form"
              disabled={isLoading || submitLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-sm"
            >
              {(isLoading || submitLoading) ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  Adding Dealer...
                </span>
              ) : "Add Dealer"}
            </Button>
          </div>
        </form>
      </Form>

              <ConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmSubmit}
          title="Add Dealer"
          description="Are you sure you want to add this dealer?"
          confirmText="Yes, Add Dealer"
          cancelText="No, Cancel"
        />
    </div>
  )
}

function MultiSelectDropdown({ 
  options, 
  selected, 
  onChange,
  labelKey = "brand_name",
  valueKey = "_id",
  placeholder = "Select..."
}: {
  options: any[];
  selected: string[];
  onChange: (selected: string[]) => void;
  labelKey?: string;
  valueKey?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const getLabel = (item: any) => item[labelKey] || "";
  const getValue = (item: any) => item[valueKey];

  const filtered = options.filter(item => 
    String(getLabel(item)).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative" ref={ref}>
      <div
        className={`flex items-center justify-between min-h-[42px] px-3 py-2 border rounded-md cursor-pointer transition-colors bg-white hover:bg-gray-50
          ${open ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}
        `}
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex flex-wrap gap-1.5 max-w-[calc(100%-24px)]">
          {selected.length === 0 && <span className="text-gray-400 text-sm">{placeholder}</span>}
          {selected.map(val => {
            const item = options.find(o => getValue(o) === val)
            return (
              <Badge key={val} variant="default" className="mr-1 mb-1 bg-red-50 text-red-700 hover:bg-red-100 border-red-200">
                {item ? getLabel(item) : val}
                <button
                  type="button"
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-red-200"
                  onClick={e => {
                    e.stopPropagation()
                    onChange(selected.filter(s => s !== val))
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
        <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
          <div className="p-2 border-b border-gray-100">
            <input
              className="w-full px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 && <div className="p-2 text-center text-gray-400 text-sm">No options found</div>}
            {filtered.map(item => {
              const val = getValue(item);
              const label = getLabel(item);
              const isSelected = selected.includes(val);
              
              return (
                <div
                  key={val}
                  className={`
                    flex items-center justify-between px-2 py-2 text-sm rounded-sm cursor-pointer select-none
                    ${isSelected ? 'bg-red-50 text-red-900' : 'hover:bg-gray-100 text-gray-900'}
                  `}
                  onClick={e => {
                    e.stopPropagation()
                    if (isSelected) {
                      onChange(selected.filter(s => s !== val))
                    } else {
                      onChange([...selected, val])
                    }
                  }}
                >
                  <span>{label}</span>
                  {isSelected && <Check className="h-4 w-4 text-red-600" />}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
