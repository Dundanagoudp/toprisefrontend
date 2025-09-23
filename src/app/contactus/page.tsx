import Footer from '@/components/landingPage/module/Footer'
import ContactPage from '@/components/landingPage/module/popup/contactus'
import { Header } from '@/components/webapp/layout/Header'
import React from 'react'

export default function page() {
  return (
    <div>
        <Header/>
      <ContactPage/>
      <Footer/>
    </div>
  )
}
