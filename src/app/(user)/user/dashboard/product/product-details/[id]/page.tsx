import ProductInformation from '@/components/user-dashboard/products/ProductInformation'
import React from 'react'

interface PageProps {
  params: {
    id: string
  }
}

export default function ProductDetailsPage({ params }: PageProps) {
  return (
    <div>
      <ProductInformation productId={params.id} />
    </div>
  )
}