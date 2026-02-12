import React from 'react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import SearchBar from '../components/Searchbar'
import Banner from '../components/Banner'

export default function Home() {
  return (
    <div className="overflow-x-hidden min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <SearchBar />
        <Banner />
        <Card />
      </div>
    </div>
  )
}
