import ProductDetailsWrapper from '@/components/dealer-dashboard/products/ProductDetailsWrapper'
import React from 'react'

interface ProductDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function page({ params }: ProductDetailsPageProps) {
  const resolvedParams = await params;
  const productId = typeof resolvedParams === 'string' ? JSON.parse(resolvedParams).id : resolvedParams.id;
 
  return <ProductDetailsWrapper productId={productId} />
}
