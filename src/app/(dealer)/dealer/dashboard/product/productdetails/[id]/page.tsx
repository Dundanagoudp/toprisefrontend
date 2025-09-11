import ProductDetailsWrapper from '@/components/dealer-dashboard/products/ProductDetailsWrapper'
import React from 'react'

interface ProductDetailsPageProps {
  params: {
    id: string;
  };
}

export default function page({ params }: ProductDetailsPageProps) {
  return <ProductDetailsWrapper productId={params.id} />
}
