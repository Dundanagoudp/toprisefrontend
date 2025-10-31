"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, ArrowLeft } from "lucide-react"
import apiClient from "@/apiClient"

export default function PurchaseRequestDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [request, setRequest] = useState<any | null>(null)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await apiClient.get(`/orders/api/documents/admin/${id}`)
        const data = res?.data?.data
        setRequest(data || null)
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load purchase request")
        setRequest(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C72920]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Card>
          <CardContent className="p-6 text-red-600">{error}</CardContent>
        </Card>
      </div>
    )
  }

  if (!request) return null

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Purchase Request #{request.document_number}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{request.status}</Badge>
          <Badge variant="secondary">{request.priority}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Customer</div>
              <div className="font-medium">{request.customer_details?.name}</div>
              <div className="text-sm text-gray-500">{request.customer_details?.email}</div>
              <div className="text-sm text-gray-500">{request.customer_details?.phone}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Address</div>
              <div className="font-medium">
                {request.customer_details?.address} - {request.customer_details?.pincode}
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Description</div>
            <div className="font-medium">{request.description || "—"}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">Estimated Order Value</div>
              <div className="font-semibold">₹{(request.estimated_order_value || 0).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Created</div>
              <div className="font-medium">{new Date(request.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Updated</div>
              <div className="font-medium">{new Date(request.updatedAt).toLocaleString()}</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-2">Files</div>
            <div className="flex flex-wrap gap-2">
              {(request.document_files || []).map((f: any) => (
                <a key={f._id} href={f.url} target="_blank" rel="noreferrer" className="px-3 py-1 border rounded text-sm hover:bg-gray-50">
                  {f.file_name || f.file_type}
                </a>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


