import CatalogProducts from '@/components/user-dashboard/catalogues/CatalogProducts'
import React from 'react'

interface PageProps {
  params: {
    id: string
  }
}

export default function CatalogProductsPage({ params }: PageProps) {
  return (
    <div>
      <CatalogProducts catalogId={params.id} />
    </div>
  )
}
