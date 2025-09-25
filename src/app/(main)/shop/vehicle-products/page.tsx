import Footer from '@/components/landingPage/module/Footer'
import { Header } from '@/components/webapp/layout/Header'
import VehicleProductsPage from '@/components/webapp/product/VehicleProduct'
import React from 'react'

function page() {
  return (
    <div>
      <Header/>
      <VehicleProductsPage/>
      <Footer/>
    </div>
  )
}

export default page
