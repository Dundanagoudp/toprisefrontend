import Footer from '@/components/landingPage/module/Footer'
import { Header } from '@/components/webapp/layout/Header'
import VariantSelection from '@/components/webapp/modules/pages/Home/product-sections/module/VariantSelection'
import React from 'react'

interface VariantSelectionPageProps {
  params: {
    modelId: string
  }
}

export default function VariantSelectionPage({ params }: VariantSelectionPageProps) {
  return (
    <>
      <Header/>
      <VariantSelection modelId={params.modelId} />
      <Footer/>
    </>
  )
}
