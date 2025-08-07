"use client"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Productcard } from "../productCard"
import { getCurrentDealerProfile } from "@/service/dealer-profile"
import type { DealerProfile } from "@/types/dealer-profiletypes"

const Button = dynamic(() => import("@/components/ui/button").then((mod) => mod.Button), { ssr: false })

type DealerDisplay = {
  dealer_id: string
  legal_name: string
  trade_name: string
  gstin: string
  pan: string
  state: string
  pincode: string
  address: string
  contact_person: string
  mobile_number: string
  email: string
  default_margin_percent: number
  sla_type: string
  sla_max_dispatch_time: number
}

export default function Dealerprofile() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [dealer, setDealer] = useState<DealerDisplay | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDealerProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get dealer profile from API
        const dealerProfile = await getCurrentDealerProfile()
        
        // Transform API data to display format
        const displayData: DealerDisplay = {
          dealer_id: dealerProfile._id || "N/A",
          legal_name: dealerProfile.username || "N/A",
          trade_name: dealerProfile.username || "N/A",
          gstin: "N/A", 
          pan: "N/A", // Not available in current API response
          state: "N/A", // Not available in current API response
          pincode: "N/A", // Not available in current API response
          address: dealerProfile.address?.length > 0 ? dealerProfile.address[0]?.street || "N/A" : "N/A",
          contact_person: dealerProfile.username || "N/A",
          mobile_number: dealerProfile.phone_Number || "N/A",
          email: dealerProfile.email || "N/A",
          default_margin_percent: 0, // Not available in current API response
          sla_type: "N/A", // Not available in current API response
          sla_max_dispatch_time: 0, // Not available in current API response
        }
        
        setDealer(displayData)
      } catch (err) {
        console.error("Error fetching dealer profile:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch dealer profile")
      } finally {
        setLoading(false)
      }
    }

    fetchDealerProfile()
  }, [])

  // const handleEdit = () => {
  //   // Navigate to edit page with current dealer ID
  //   const dealerId = dealer?.dealer_id || params.id
  //   router.push(`/dealer/dashboard/dealer/edit/${dealerId}`)
  // }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dealer profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="default"
            className="bg-blue-500 hover:bg-blue-600"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="ml-2">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 ">Personal Details</h1>
              <p className="text-base font-medium font-sans text-gray-500">Add your personal Details</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* <Button 
              variant="default" 
              className="bg-red-500 hover:bg-red-600 text-white font-mono"
              onClick={handleEdit}
            >
              Edit
            </Button> */}
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="p-4 sm:p-6 space-y-8">
        {/* Top Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dealer Identification */}
          <div>
            <Productcard
              title="Dealer Identification"
              description="Basic information to uniquely identify the dealer in the system"
              data={
                dealer
                  ? [
                      { label: "Dealer ID", value: dealer.dealer_id || "-" },
                      { label: "Legal Name", value: dealer.legal_name || "-" },
                      { label: "Trade Name", value: dealer.trade_name || "-" },
                    ]
                  : []
              }
            />
          </div>
          {/* Legal & Tax Information */}
          <div>
            <Productcard
              title="Legal & Tax Information"
              description="Compliance details needed for GST and invoicing"
              data={
                dealer
                  ? [
                      { label: "GSTIN", value: dealer.gstin || "-" },
                      { label: "PAN", value: dealer.pan || "-" },
                      { label: "State", value: dealer.state || "-" },
                      { label: "Pincode", value: dealer.pincode || "-" },
                    ]
                  : []
              }
            />
          </div>
        </div>
        {/* Bottom Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Productcard
            title="Contact Information"
            description="Primary contact and communication details"
            data={
              dealer
                ? [
                    { label: "Address", value: dealer.address || "-" },
                    { label: "Contact Person", value: dealer.contact_person || "-" },
                    { label: "Mobile Number", value: dealer.mobile_number || "-" },
                    { label: "Email", value: dealer.email || "-" },
                  ]
                : []
            }
          />
          {/* Margins & Service Level */}
          <Productcard
            title="Margins & Service Level"
            description="Business logic for pricing and fulfilment commitments."
            data={
              dealer
                ? [
                    { label: "Default Margin %", value: dealer.default_margin_percent || "-" },
                    { label: "SLA Type", value: dealer.sla_type || "-" },
                    { label: "SLA Max Dispatch Time", value: dealer.sla_max_dispatch_time || "-" },
                  ]
                : []
            }
          />
        </div>
      </div>
    </div>
  )
}
