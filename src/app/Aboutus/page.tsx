import AboutUs from '@/components/landingPage/module/AboutUs'
import Footer from '@/components/landingPage/module/Footer'
import { Header } from '@/components/webapp/layout/Header'
import React from 'react'




// About Us Page
function page() {
  return (
    <div>
      <Header/>
      <AboutUs />
      <Footer/>
    </div>
  )
}

export default page
