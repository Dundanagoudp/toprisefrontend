import Footer from '@/components/landingPage/module/Footer'
import { Header } from '@/components/webapp/layout/Header'
import ModelSelection from '@/components/webapp/modules/pages/Home/product-sections/module/ModelSelection'
import React from 'react'

interface ModelSelectionPageProps {
  params: {
    brandId: string
  }
}

export default function ModelSelectionPage({ params }: ModelSelectionPageProps) {
  return (
    <>
      <Header/>
      <ModelSelection brandId={params.brandId} />
      <Footer/>
    </>
  )
}
