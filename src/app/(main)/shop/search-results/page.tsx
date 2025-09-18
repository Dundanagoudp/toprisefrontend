import Footer from '@/components/landingPage/module/Footer'
import { Header } from '@/components/webapp/layout/Header'
import SearchResults from '@/components/webapp/modules/pages/Home/product-sections/module/SearchedProduct'
import React from 'react'

interface SearchResultsPageProps {
  params: {
    searchQuery: string
  }
}

export default function SearchResultsPage({ params }: SearchResultsPageProps) {
  const decodedQuery = decodeURIComponent(params.searchQuery)
  
  return (
    <>
      <Header/>
      <SearchResults  />
      <Footer/>
    </>
  )
}
