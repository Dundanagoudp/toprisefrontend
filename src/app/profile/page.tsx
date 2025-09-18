import Footer from '@/components/landingPage/module/Footer'
import { Header } from '@/components/webapp/layout/Header'
import ProfilePage from '@/components/webapp/modules/UserSetting/ProfilePage'
import React from 'react'

export default function page() {
  return (
    <div>
      <Header/>
        <ProfilePage />
        <Footer/>
    </div>
  )
}
