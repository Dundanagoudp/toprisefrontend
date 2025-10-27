import Footer from '@/components/landingPage/module/Footer'
import { Header } from '@/components/webapp/layout/Header'
import CategoriesListing from '@/components/webapp/modules/pages/Home/category/CategoriesListing'
import React from 'react'

function page() {
  return (
    <div>
      <Header/>
      <CategoriesListing/>
      <Footer/>
    </div>
  )
}

export default page
