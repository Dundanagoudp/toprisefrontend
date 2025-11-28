"use client";

import Footer from '@/components/landingPage/module/Footer'
import { Header } from '@/components/webapp/layout/Header'
import ProfilePage from '@/components/webapp/modules/UserSetting/ProfilePage'
import withProtectedRoute from '@/components/protectionRoute/withProtectedRoute'
import React from 'react'

function Page() {
  return (
    <div>
      <Header/>
        <ProfilePage />
        <Footer/>
    </div>
  )
}

export default withProtectedRoute(Page, { redirectTo: "/" });
