import ViewProductDetails from '@/components/user-dashboard/product/module/productDetails'
import React from 'react'

interface PageProps {
  params: {
    id: string
  }
}

export default function ProductDetailsPage({ params }: PageProps) {
  return (
    <div>
      <ViewProductDetails />
    </div>
  )
}