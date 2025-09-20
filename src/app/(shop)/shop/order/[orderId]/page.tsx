'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getOrderById } from '@/service/order-service'
import OrderDetailsPage from '@/components/webapp/OrderDetailsPage'

export default function ShopOrderDetailsPage() {
  const params = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const response = await getOrderById(params.orderId)
        setOrder(response.data)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch order details')
      } finally {
        setLoading(false)
      }
    }

    if (params.orderId) {
      fetchOrder()
    }
  }, [params.orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h1>
          <p className="text-gray-600">The order you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return <OrderDetailsPage order={order} />
}
