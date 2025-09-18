import Footer from '@/components/landingPage/module/Footer'
import { Header } from '@/components/webapp/layout/Header'
import ProductListing from '@/components/webapp/modules/pages/Home/category/module/CategoryProducts'
import React from 'react'

export default function page() {
  return (
    <div>
       <Header/>
<ProductListing/>
<Footer/>

    </div>
  )
}
