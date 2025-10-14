"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingCart, 
  Search, 
  Plus,
  Trash2,
  ArrowLeft,
  PackageCheck,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  ExternalLink
} from "lucide-react"
import SearchInput from "@/components/common/search/SearchInput"
import apiClient from "@/apiClient"
import { useToast } from "@/components/ui/toast"
import { useAppSelector } from "@/store/hooks"
import { getProductsByPage } from "@/service/product-Service"

interface SelectedProduct {
  sku: string
  quantity: number
  productId: string
  productName: string
  selling_price: number
  mrp: number
  gst_percentage: number
  gst_amount: number
  totalPrice: number
}

interface CustomerDetails {
  userId: string
  name: string
  phone: string
  email: string
  address: string
  pincode: string
}

export default function CreateOrderPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as string
  const { showToast } = useToast()
  const auth = useAppSelector((state) => state.auth.user)

  const [loading, setLoading] = useState(false)
  const [documentData, setDocumentData] = useState<any>(null)
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null)
  
  // Product search and selection
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [searchingProducts, setSearchingProducts] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  
  // Order details
  const [deliveryCharges, setDeliveryCharges] = useState<number>(0)
  const [paymentType, setPaymentType] = useState<string>("COD")
  const [deliveryType, setDeliveryType] = useState<string>("Standard")
  const [submitting, setSubmitting] = useState(false)

  // Fetch document details
  useEffect(() => {
    const fetchDocumentDetails = async () => {
      setLoading(true)
      try {
        const response = await apiClient.get(`https://api.toprise.in/api/orders/api/documents/${documentId}`)
        
        if (response.data.success && response.data.data) {
          setDocumentData(response.data.data)
          
          // Set customer details from document
          if (response.data.data.customer_details) {
            setCustomerDetails({
              userId: response.data.data.customer_details.user_id,
              name: response.data.data.customer_details.name,
              phone: response.data.data.customer_details.phone,
              email: response.data.data.customer_details.email,
              address: response.data.data.customer_details.address,
              pincode: response.data.data.customer_details.pincode
            })
          }
        }
      } catch (error: any) {
        console.error("Error fetching document:", error)
        showToast("Failed to fetch document details", "error")
      } finally {
        setLoading(false)
      }
    }

    if (documentId) {
      fetchDocumentDetails()
    }
  }, [documentId])

  // Search products
  const searchProducts = async () => {
    if (!searchQuery.trim()) {
      setProducts([])
      return
    }

    setSearchingProducts(true)
    try {
      console.log("Searching for products with query:", searchQuery.trim())
      
      const response = await getProductsByPage(
        1,                      // page
        50,                     // limit - increased to get more results
        "Approved",             // status - only approved products
        searchQuery.trim(),     // searchQuery
        undefined,              // categoryFilter
        undefined               // subCategoryFilter
      )

      console.log("Product search response:", response)
      console.log("Response structure check:", {
        hasResponse: !!response,
        hasData: !!response?.data,
        hasProducts: !!response?.data?.products,
        isArray: Array.isArray(response?.data?.products),
        productsLength: response?.data?.products?.length
      })

      if (response && response.data && response.data.products && Array.isArray(response.data.products)) {
        console.log(`Found ${response.data.products.length} products`)
        setProducts(response.data.products)
        
        if (response.data.products.length === 0) {
          showToast("No products found matching your search", "warning")
        }
      } else {
        setProducts([])
        console.warn("Unexpected response structure:", response)
        showToast("No products found", "warning")
      }
    } catch (error: any) {
      console.error("Error searching products:", error)
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Failed to search products"
      showToast(errorMessage, "error")
      setProducts([])
    } finally {
      setSearchingProducts(false)
    }
  }

  // Add product to order
  const addProductToOrder = (product: any, quantity: number = 1) => {
    // Check if product already added
    if (selectedProducts.find(p => p.productId === product._id)) {
      showToast("Product already added to order", "warning")
      return
    }

    const gstPercentage = product.gst_percentage || 18
    const sellingPrice = product.selling_price || product.dealer_price || 0
    const mrp = product.mrp || 0
    const totalPrice = sellingPrice * quantity
    const gstAmount = (totalPrice * gstPercentage) / 100

    const selectedProduct: SelectedProduct = {
      sku: product.sku || product.SKU || "N/A",
      quantity: quantity,
      productId: product._id,
      productName: product.product_name || "Unnamed Product",
      selling_price: sellingPrice,
      mrp: mrp,
      gst_percentage: gstPercentage,
      gst_amount: parseFloat(gstAmount.toFixed(2)),
      totalPrice: parseFloat(totalPrice.toFixed(2))
    }

    setSelectedProducts([...selectedProducts, selectedProduct])
    setSearchQuery("")
    setProducts([])
    showToast("Product added to order", "success")
  }

  // Remove product from order
  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId))
  }

  // Update product quantity
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setSelectedProducts(selectedProducts.map(p => {
      if (p.productId === productId) {
        const totalPrice = p.selling_price * newQuantity
        const gstAmount = (totalPrice * p.gst_percentage) / 100
        return {
          ...p,
          quantity: newQuantity,
          totalPrice: parseFloat(totalPrice.toFixed(2)),
          gst_amount: parseFloat(gstAmount.toFixed(2))
        }
      }
      return p
    }))
  }

  // Calculate totals
  const subtotal = selectedProducts.reduce((sum, p) => sum + p.totalPrice, 0)
  const totalGST = selectedProducts.reduce((sum, p) => sum + p.gst_amount, 0)
  const grandTotal = subtotal + totalGST + deliveryCharges

  // Create order
  const handleCreateOrder = async () => {
    if (!customerDetails) {
      showToast("Customer details not found", "error")
      return
    }

    if (selectedProducts.length === 0) {
      showToast("Please add at least one product to the order", "error")
      return
    }

    if (!auth?._id) {
      showToast("User authentication required", "error")
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        created_by: auth._id,
        customerDetails: customerDetails,
        skus: selectedProducts,
        order_Amount: grandTotal,
        deliveryCharges: deliveryCharges,
        paymentType: paymentType,
        type_of_delivery: deliveryType
      }

      console.log("Creating order with payload:", payload)

      const response = await apiClient.post(
        `https://api.toprise.in/api/orders/api/documents/admin/${documentId}/create-order`,
        payload
      )

      if (response.data.success) {
        showToast("Order created successfully!", "success")
        setTimeout(() => {
          router.push("/user/dashboard/purchase-requests")
        }, 1500)
      } else {
        showToast(response.data.message || "Failed to create order", "error")
      }
    } catch (error: any) {
      console.error("Error creating order:", error)
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          "Failed to create order"
      showToast(errorMessage, "error")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C72920]"></div>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 overflow-x-hidden p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Order</h1>
          <p className="text-sm text-gray-500">
            Document: {documentData?.document_number || documentId}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Details & Product Search */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{customerDetails?.name || "N/A"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{customerDetails?.email || "N/A"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{customerDetails?.phone || "N/A"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{customerDetails?.pincode || "N/A"}</span>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Address</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{customerDetails?.address || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Search Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5" />
                Add Products
              </CardTitle>
              <CardDescription>
                Search and add products to the order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <form 
                 onSubmit={(e) => {
                   e.preventDefault()
                   if (searchQuery.trim()) {
                     searchProducts()
                   }
                 }}
                 className="flex gap-2"
               >
                 <div className="flex-1">
                   <SearchInput
                     value={searchQuery}
                     onChange={setSearchQuery}
                     onClear={() => {
                       setSearchQuery("")
                       setProducts([])
                     }}
                     placeholder="Search by product name, SKU, or category"
                     className="w-full"
                   />
                 </div>
                 <Button 
                   type="submit"
                   disabled={searchingProducts || !searchQuery.trim()}
                   className="bg-[#C72920] hover:bg-[#A01E1A] text-white"
                 >
                   {searchingProducts ? (
                     <>
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                       Searching...
                     </>
                   ) : (
                     <>
                       <Search className="h-4 w-4 mr-2" />
                       Search
                     </>
                   )}
                 </Button>
               </form>

              {/* Search Results */}
              {searchingProducts && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C72920] mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Searching products...</p>
                </div>
              )}

              {!searchingProducts && products.length === 0 && searchQuery.trim() && (
                <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
                  <Search className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No products found</p>
                  <p className="text-xs text-gray-400 mt-1">Try different search terms</p>
                </div>
              )}

              {products.length > 0 && !searchingProducts && (
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>MRP</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{product.product_name}</span>
                              <span className="text-xs text-gray-500">
                                {product.category?.category_name || "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{product.sku || product.SKU}</TableCell>
                          <TableCell className="font-medium">₹{product.selling_price || product.dealer_price || 0}</TableCell>
                          <TableCell className="text-gray-600">₹{product.mrp || 0}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addProductToOrder(product)}
                              disabled={selectedProducts.some(p => p.productId === product._id)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Products Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Selected Products ({selectedProducts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No products added yet</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>GST ({selectedProducts[0]?.gst_percentage}%)</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProducts.map((product) => (
                        <TableRow key={product.productId}>
                          <TableCell className="font-medium">{product.productName}</TableCell>
                          <TableCell className="text-sm text-gray-600">{product.sku}</TableCell>
                          <TableCell>₹{product.selling_price}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={product.quantity}
                              onChange={(e) => updateQuantity(product.productId, parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>₹{product.gst_amount.toFixed(2)}</TableCell>
                          <TableCell className="font-medium">₹{product.totalPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProduct(product.productId)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          {/* Order Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment-type">Payment Type *</Label>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger id="payment-type">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COD">Cash on Delivery</SelectItem>
                    <SelectItem value="Prepaid">Prepaid</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Net Banking">Net Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery-type">Delivery Type *</Label>
                <Select value={deliveryType} onValueChange={setDeliveryType}>
                  <SelectTrigger id="delivery-type">
                    <SelectValue placeholder="Select delivery type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Express">Express</SelectItem>
                    <SelectItem value="Same Day">Same Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery-charges">Delivery Charges (₹)</Label>
                <Input
                  id="delivery-charges"
                  type="number"
                  min="0"
                  value={deliveryCharges}
                  onChange={(e) => setDeliveryCharges(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total GST</span>
                <span className="font-medium">₹{totalGST.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Charges</span>
                <span className="font-medium">₹{deliveryCharges.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Grand Total</span>
                <span className="font-bold text-lg text-[#C72920]">₹{grandTotal.toFixed(2)}</span>
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  className="w-full bg-[#C72920] hover:bg-[#A01E1A] text-white"
                  onClick={handleCreateOrder}
                  disabled={submitting || selectedProducts.length === 0}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <PackageCheck className="h-4 w-4 mr-2" />
                      Create Order
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

           {/* Document Info Card */}
           {documentData && (
             <Card>
               <CardHeader>
                 <CardTitle className="text-sm">Document Information</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3 text-sm">
                 <div className="flex justify-between">
                   <span className="text-gray-600">Status:</span>
                   <Badge className="bg-yellow-100 text-yellow-800">{documentData.status}</Badge>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600">Priority:</span>
                   <Badge className="bg-red-100 text-red-800">{documentData.priority}</Badge>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600">Uploaded Files:</span>
                   <span className="font-medium">{documentData.document_files?.length || 0}</span>
                 </div>
                 {documentData.description && (
                   <div className="pt-2 border-t">
                     <span className="text-gray-600 block mb-1">Description:</span>
                     <p className="text-xs text-gray-700">{documentData.description}</p>
                   </div>
                 )}
                 
                 {/* Display Uploaded Documents */}
                 {documentData.document_files && documentData.document_files.length > 0 && (
                   <div className="pt-3 border-t">
                     <span className="text-gray-600 block mb-2">Uploaded Documents:</span>
                     <div className="space-y-2">
                       {documentData.document_files.map((file: any, index: number) => (
                         <div key={file._id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                           <div className="flex items-center gap-2 flex-1 min-w-0">
                             <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                             <div className="flex flex-col min-w-0">
                               <span className="text-xs font-medium truncate" title={file.file_name}>
                                 {file.file_name}
                               </span>
                               <span className="text-xs text-gray-500">
                                 {new Date(file.uploaded_at).toLocaleDateString('en-IN', {
                                   day: '2-digit',
                                   month: 'short',
                                   year: 'numeric'
                                 })}
                               </span>
                             </div>
                           </div>
                           <Button
                             variant="ghost"
                             size="sm"
                             className="h-8 px-2 flex-shrink-0"
                             onClick={() => window.open(file.url, '_blank')}
                           >
                             <ExternalLink className="h-3 w-3" />
                           </Button>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </CardContent>
             </Card>
           )}
        </div>
      </div>
    </div>
  )
}

