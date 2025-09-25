import Footer from '@/components/landingPage/module/Footer'
import { Header } from '@/components/webapp/layout/Header'
import SubcategoryFilter from '@/components/webapp/product/module/SubcategoryFilter'
import React from 'react'

function page() {
  return (
    <div>
      <Header/>
      <SubcategoryFilter/>
      <Footer/>
    </div>
  )
}

export default page
