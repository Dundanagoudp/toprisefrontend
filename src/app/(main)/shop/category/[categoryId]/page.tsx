import React from 'react'
import CategoryProducts from '@/components/webapp/modules/pages/Home/category/module/CategoryProducts'
import { Header } from '@/components/webapp/layout/Header'
import Footer from '@/components/landingPage/module/Footer'

export default function CategoryPage() {
  return (
    <>
      <Header />
      <CategoryProducts />
      <Footer />
    </>
  )
}
