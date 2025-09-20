"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { selectVehicleTypeId } from "@/store/slice/vehicle/vehicleSlice"
import { Search, Car, Bike } from "lucide-react"
import { useToast } from "@/components/ui/toast"

export default function SearchBanner() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const { showToast } = useToast()
  const router = useRouter()
  const typeId = useAppSelector(selectVehicleTypeId)

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      showToast("Please enter a search term", "error")
      return
    }

    const searchParams = new URLSearchParams({
      query: searchQuery.trim(),
      vehicleTypeId: typeId,
    })

    router.push(`/shop/search/?${searchParams.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-indigo-100">
      <div className="max-w-screen-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Search for Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the perfect parts for your vehicle. Search by product name, part number, or any keyword.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for products, parts, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-8">
          <div className="flex items-center gap-2 text-gray-600">
            <Car className="w-5 h-5" />
            <span className="text-sm">Car Parts</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Bike className="w-5 h-5" />
            <span className="text-sm">Bike Parts</span>
          </div>
        </div>
      </div>
    </section>
  )
}
