'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Calendar, 
  CreditCard, 
  Truck, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  CheckCircle, 
  Clock, 
  XCircle,
  ExternalLink,
  ArrowLeft,
  Download,
  Printer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getProductById } from '@/service/product-Service'
import formatDate from '@/utils/formateDate'
import { Header } from './layout/Header'
import Footer from '../landingPage/module/Footer'

interface OrderDetailsPageProps {
  order: any
}

export default function OrderDetailsPage({ order }: OrderDetailsPageProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      if (!order?.skus) {
        setLoading(false)
        return
      }

      try {
        const productPromises = order.skus.map(async (sku: any) => {
          try {
            const response = await getProductById(sku.productId)
            return {
              ...response.data,
              quantity: sku.quantity,
              sku: sku.sku,
              totalPrice: sku.totalPrice || (response.data.selling_price * sku.quantity)
            }
          } catch (error) {
            console.error(`Failed to fetch product ${sku.productId}:`, error)
            return {
              _id: sku.productId,
              product_name: sku.productName || 'Product not found',
              selling_price: 0,
              images: [],
              quantity: sku.quantity,
              sku: sku.sku,
              totalPrice: sku.totalPrice || 0
            }
          }
        })

        const fetchedProducts = await Promise.all(productPromises)
        setProducts(fetchedProducts)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [order])

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || ''
    switch (s) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'packed':
        return 'bg-purple-100 text-purple-800'
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase() || ''
    switch (s) {
      case 'delivered':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'shipped':
        return <Truck className="w-4 h-4" />
      case 'packed':
        return <Package className="w-4 h-4" />
      case 'assigned':
        return <Clock className="w-4 h-4" />
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
      case 'canceled':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const buildImageUrl = (path?: string) => {
    if (!path) return "/placeholder.svg"
    if (/^https?:\/\//i.test(path)) return path
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
    const filesOrigin = apiBase.replace(/\/api$/, "")
    return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Create a downloadable version of the order details
    const orderData = {
      orderId: order.orderId,
      orderDate: order.orderDate,
      status: order.status,
      customer: order.customerDetails,
      products: products,
      total: order.order_Amount,
      subtotal: order.order_Amount - (order.GST || 0) - (order.deliveryCharges || 0),
      gst: order.GST || 0,
      deliveryCharges: order.deliveryCharges || 0
    }
    
    const dataStr = JSON.stringify(orderData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `order-${order.orderId}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div> 
      <Header/>
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link 
              href="/" 
              className="hover:text-primary cursor-pointer transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link 
              href="/shop" 
              className="hover:text-primary cursor-pointer transition-colors"
            >
              Shop
            </Link>
            <span>/</span>
            <span className="text-foreground">Order Details</span>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/shop">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600">Order #{order.orderId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`px-3 py-1 ${getStatusColor(order.status)}`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                {order.status}
              </div>
            </Badge>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Order Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold text-gray-900">
                    {order.orderDate ? formatDate(order.orderDate, { includeTime: true }) : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-900">
                    {order.paymentType || '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delivery Type</p>
                  <p className="font-semibold text-gray-900">
                    {order.type_of_delivery || 'Standard'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    ₹{order.order_Amount?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Customer & Delivery Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium">{order.customerDetails?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-medium">{order.customerDetails?.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-medium">{order.customerDetails?.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">User ID</p>
                    <p className="font-medium text-sm">{order.customerDetails?.userId || '-'}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{order.customerDetails?.address || '-'}</p>
                    <p className="text-sm text-gray-600">Pincode: {order.customerDetails?.pincode || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items ({products.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={buildImageUrl(product.images?.[0])} 
                            alt={product.product_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {product.product_name}
                          </h3>
                          <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                          <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₹{product.totalPrice?.toLocaleString() || '0'}
                          </p>
                          <p className="text-sm text-gray-600">
                            ₹{product.selling_price?.toLocaleString() || '0'} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tracking Information */}
            {order.order_track_info && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Tracking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Courier Status</p>
                      <p className="font-medium">{order.order_track_info.borzo_order_status || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                      <p className="font-medium">
                        {order.order_track_info.borzo_last_updated ? 
                          formatDate(order.order_track_info.borzo_last_updated, { includeTime: true }) : '-'}
                      </p>
                    </div>
                  </div>
                  
                  {order.order_track_info.borzo_tracking_url && (
                    <div>
                      <a 
                        href={order.order_track_info.borzo_tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Track Package
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ₹{((order.order_Amount || 0) - (order.GST || 0) - (order.deliveryCharges || 0)).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">GST</span>
                  <span className="font-medium">
                    ₹{(order.GST || 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="font-medium">
                    ₹{(order.deliveryCharges || 0).toLocaleString()}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{(order.order_Amount || 0).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Order Confirmed</p>
                      <p className="text-xs text-gray-600">
                        {order.createdAt ? formatDate(order.createdAt, { includeTime: true }) : '-'}
                      </p>
                    </div>
                  </div>
                  
                  {order.timestamps?.assignedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Order Assigned</p>
                        <p className="text-xs text-gray-600">
                          {formatDate(order.timestamps.assignedAt, { includeTime: true })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {order.timestamps?.packedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Order Packed</p>
                        <p className="text-xs text-gray-600">
                          {formatDate(order.timestamps.packedAt, { includeTime: true })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {order.timestamps?.shippedAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Order Shipped</p>
                        <p className="text-xs text-gray-600">
                          {formatDate(order.timestamps.shippedAt, { includeTime: true })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {order.timestamps?.deliveredAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-sm">Order Delivered</p>
                        <p className="text-xs text-gray-600">
                          {formatDate(order.timestamps.deliveredAt, { includeTime: true })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </div>
  )
}
