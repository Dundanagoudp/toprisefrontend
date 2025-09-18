"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { selectVehicleTypeId } from "@/store/slice/vehicle/vehicleSlice"
import { 
  getYearRange, 
  getBrandsByType,
  getModelsByBrand,
  getVariantsByModel
} from "@/service/product-Service"
import { useToast } from "@/components/ui/toast"

interface Model {
  _id: string;
  model_name: string;
  brand_id: string;
}

interface Variant {
  _id: string;
  variant_name: string;
  model_id: string;
}

interface Year {
  _id: string;
  year_name: string;
}

interface Brand {
  _id: string;
  brand_name: string;
}

export default function BannerSection() {
  const [offsetY, setOffsetY] = useState(0)
  const handleScroll = () => setOffsetY(window.pageYOffset)
  
  // Vehicle search state
  const { showToast } = useToast()
  const router = useRouter()
  const typeId = useAppSelector(selectVehicleTypeId)
  
  // State for dropdown data
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [years, setYears] = useState<Year[]>([])
  
  // State for selected values
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [selectedVariant, setSelectedVariant] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  
  // Number plate search
  const [numberPlate, setNumberPlate] = useState<string>("")

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fetch initial data when typeId changes
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [brandsRes, yearsRes] = await Promise.all([
          getBrandsByType(typeId),
          getYearRange()
        ])
        
        if (brandsRes.success && brandsRes.data) {
          const brandsData = Array.isArray(brandsRes.data) ? brandsRes.data : brandsRes.data.products || []
          setBrands(brandsData as Brand[])
        }
        
        if (yearsRes.success && yearsRes.data) {
          const yearsData = Array.isArray(yearsRes.data) ? yearsRes.data : yearsRes.data.products || []
          setYears(yearsData as Year[])
        }
        
        // Reset all selections when vehicle type changes
        setSelectedBrand("")
        setSelectedModel("")
        setSelectedVariant("")
        setModels([])
        setVariants([])
      } catch (error) {
        console.error("Error fetching initial data:", error)
        showToast("Failed to load initial data", "error")
      }
    }

    if (typeId) {
      fetchInitialData()
    }
  }, [typeId, showToast])

  // Fetch models when brand changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!selectedBrand) {
        setModels([])
        setSelectedModel("")
        setSelectedVariant("")
        setVariants([])
        return
      }

      try {
        const modelsRes = await getModelsByBrand(selectedBrand)
        
        if (modelsRes.success && modelsRes.data) {
          const modelsData = Array.isArray(modelsRes.data) ? modelsRes.data : modelsRes.data.products || []
          setModels(modelsData as Model[])
        } else {
          setModels([])
        }
        
        // Reset dependent selections
        setSelectedModel("")
        setSelectedVariant("")
        setVariants([])
      } catch (error) {
        console.error("Error fetching models:", error)
        showToast("Failed to load models", "error")
        setModels([])
      }
    }

    fetchModels()
  }, [selectedBrand, showToast])

  // Fetch variants when model changes
  useEffect(() => {
    const fetchVariants = async () => {
      if (!selectedModel) {
        setVariants([])
        setSelectedVariant("")
        return
      }

      try {
        const variantsRes = await getVariantsByModel(selectedModel)
        
        if (variantsRes.success && variantsRes.data) {
          const variantsData = Array.isArray(variantsRes.data) ? variantsRes.data : variantsRes.data.products || []
          setVariants(variantsData as Variant[])
        } else {
          setVariants([])
        }
        
        // Reset dependent selection
        setSelectedVariant("")
      } catch (error) {
        console.error("Error fetching variants:", error)
        showToast("Failed to load variants", "error")
        setVariants([])
      }
    }

    fetchVariants()
  }, [selectedModel, showToast])

  // Handle vehicle search
const handleVehicleSearch = () => {
  if (!selectedBrand || !selectedModel) {
    showToast("Please select at least Brand and Model", "error");
    return;
  }

  // Resolve human-readable names from selected ids (fallback to id if name not found)
  const brandName = brands.find(b => b._id === selectedBrand)?.brand_name || selectedBrand;
  const modelName = models.find(m => m._id === selectedModel)?.model_name || selectedModel;
  const variantName = variants.find(v => v._id === selectedVariant)?.variant_name || selectedVariant;
  const yearName = years.find(y => y._id === selectedYear)?.year_name || selectedYear;

  // Build a single query string (same shape as your working example)
  const queryParts = [brandName, modelName, variantName, yearName].filter(Boolean);
  const queryStr = queryParts.join(' ').trim();

  const searchParams = new URLSearchParams();
  if (queryStr) searchParams.append('query', queryStr);
  if (typeId) searchParams.append('vehicleTypeId', typeId);

  router.push(`/shop/search-results/?${searchParams.toString()}`);
};

  // Handle number plate search
  const handleNumberPlateSearch = () => {
    if (!numberPlate.trim()) {
      showToast("Please enter a number plate", "error")
      return
    }

    const searchParams = new URLSearchParams({
      query: numberPlate.trim(),
      vehicleTypeId: typeId,
    })

    router.push(`/shop/search-results/?${searchParams.toString()}`)
  }

  return (
     <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0 z-0" style={{ transform: `translateY(${offsetY * 0.5}px)` }}>
        <Image
          src="/assets/HeroBg.jpg"
          alt="Background"
          fill
          className="object-cover scale-110 blur-[1px] md:blur-[2px]"
          priority
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60" />
        {/* Top gradient to blend with white navbar */}
        <div className="absolute inset-x-0 top-0 h-24 md:h-28 bg-gradient-to-b from-white/45 to-transparent pointer-events-none" />
      </div>

      {/* Content Grid */}
      <div className="relative z-10 container mx-auto px-4 pt-8 pb-8 h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center">
          {/* Left Side - Text Content */}
          <div className="text-white space-y-6">
            <h1 className="font-sans font-bold text-white text-4xl md:text-5xl lg:text-6xl leading-tight">
              Get Genuine Spare Parts of your Vehicle – Quick Shopping & Rapid Delivery
            </h1>
            <p className="font-sans text-white/90 text-lg md:text-xl">
            Seach thousands of parts for bikes, scooters and cars – Get it delivered pan India (Same day in NCR)
            </p>
          </div>

          {/* Right Side - Search Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 w-full max-w-md space-y-6 shadow-2xl">
              {/* Vehicle Search Form */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-lg mb-4">Search by vehicle</h3>

                <div className="grid grid-cols-2 gap-3">
                  <select 
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-700/80 backdrop-blur-sm text-white border border-gray-600 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 hover:bg-gray-600/80 transition-colors"
                  >
                    <option value="" className="bg-gray-800 text-white">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id} className="bg-gray-800 text-white">
                        {brand.brand_name}
                      </option>
                    ))}
                  </select>

                  <select 
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={!selectedBrand}
                    className="w-full p-3 rounded-lg bg-gray-700/80 backdrop-blur-sm text-white border border-gray-600 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 hover:bg-gray-600/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-gray-800 text-white">
                      {selectedBrand ? "Select Model" : "Select Brand first"}
                    </option>
                    {models.map((model) => (
                      <option key={model._id} value={model._id} className="bg-gray-800 text-white">
                        {model.model_name}
                      </option>
                    ))}
                  </select>

                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-700/80 backdrop-blur-sm text-white border border-gray-600 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 hover:bg-gray-600/80 transition-colors"
                  >
                    <option value="" className="bg-gray-800 text-white">Select Year</option>
                    {years.map((year) => (
                      <option key={year._id} value={year._id} className="bg-gray-800 text-white">
                        {year.year_name}
                      </option>
                    ))}
                  </select>

                  <select 
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    disabled={!selectedModel}
                    className="w-full p-3 rounded-lg bg-gray-700/80 backdrop-blur-sm text-white border border-gray-600 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 hover:bg-gray-600/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-gray-800 text-white">
                      {selectedModel ? "Select Variant" : "Select Model first"}
                    </option>
                    {variants.map((variant) => (
                      <option key={variant._id} value={variant._id} className="bg-gray-800 text-white">
                        {variant.variant_name}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={handleVehicleSearch}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Search
                </button>
              </div>

              {/* Number Plate Search */}
              <div className="space-y-4 pt-4 border-t border-white/20">
                <h3 className="text-white font-semibold">Search by number plate</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., ABC123"
                    value={numberPlate}
                    onChange={(e) => setNumberPlate(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleNumberPlateSearch()
                      }
                    }}
                    className="flex-1 p-3 rounded-lg bg-gray-700/80 backdrop-blur-sm text-white border border-gray-600 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 placeholder-white/70 hover:bg-gray-600/80 transition-colors"
                  />
                  <button 
                    onClick={handleNumberPlateSearch}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* App Download CTA */}
              <div className="pt-4 border-t border-white/20">
                <div className="flex justify-center lg:justify-end">
                  <a
                    href="https://play.google.com/store/apps/details?id=com.toprise"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Download the TopRise app from Google Play"
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Download App
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat/Help Button
      <div className="fixed bottom-6 right-6 z-20">
        <button className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl transition-colors shadow-lg">
          N
        </button>
      </div> */}
    </section>
  )
}
