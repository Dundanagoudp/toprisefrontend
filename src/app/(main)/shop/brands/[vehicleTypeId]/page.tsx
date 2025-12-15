import Footer from '@/components/landingPage/module/Footer'
import { Header } from '@/components/webapp/layout/Header'
import BrandSelection from '@/components/webapp/modules/pages/Home/product-sections/module/BrandSelection'
import React from 'react'

interface BrandSelectionPageProps {
  params: {
    vehicleTypeId: string
  }
}

export default async function BrandSelectionPage({ params }: BrandSelectionPageProps) {
  const { vehicleTypeId } = await params;
  return (
    <>
      <Header/>
      <BrandSelection vehicleTypeId={vehicleTypeId as string} />
      <Footer/>
    </>
  )
}
