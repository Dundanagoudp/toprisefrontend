"use client"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { Productcard } from "../productCard"

const Button = dynamic(() => import("@/components/ui/button").then((mod) => mod.Button), { ssr: false })
type Dealer = {
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

// Static data for the dealer, matching the screenshot content
const staticDealer: Dealer = {
  dealer_id: "DLR302",
  legal_name: "Shree Auto Spares Pvt Ltd",
  trade_name: "ShreeAuto",
  gstin: "27ABCDE1234F1Z2",
  pan: "ABCDE1234F",
  state: "Maharashtra",
  pincode: "411026",
  address: "Plot 14, MIDC Bhosari, Pune",
  contact_person: "Rakesh Jadhav",
  mobile_number: "+91 98200 12345",
  email: "dealer@shreeauto.in",
  default_margin_percent: 18.0,
  sla_type: "SLA Type", 
  sla_max_dispatch_time: 24,
}

export default function Dealerprofile() {
  const router = useRouter()
  const id = useParams<{ id: string }>()

  // const handleEdit = () => {
  //   // Use a static ID or the actual ID if available from the URL
  //   router.push(`/dealer/dashboard/dealer/edit/${id.id || "static-dealer-id"}`)
  // }

  const dealer = staticDealer

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
            <Button variant="default" className="bg-red-500 hover:bg-red-600 text-white font-mono" >
              Edit
            </Button>
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
