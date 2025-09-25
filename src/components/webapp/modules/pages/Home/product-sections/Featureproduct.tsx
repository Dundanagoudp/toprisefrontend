"use client"
import React from "react"
import { Heart, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react"
import { getPopularVehicles } from "@/service/product-Service"
import { DynamicButton } from "@/components/common/button"
import { useRouter } from "next/navigation"
import { selectVehicleTypeId, selectVehicleType } from "@/store/slice/vehicle/vehicleSlice"
import { useAppSelector } from "@/store/hooks"

interface Vehicle {
  _id: string;
  vehicle_name: string;
  vehicle_image: string;
  product_type?: string;
  brand_id: {
    _id: string;
    brand_name: string;
    brand_logo: string;
  };
  model_id: {
    _id: string;
    model_name: string;
    model_image: string;
  };
  variant_id: {
    _id: string;
    variant_name: string;
  };
  vehicle_type: {
    _id: string;
    type_name: string;
  };
}

export default function FeaturedProducts() {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [currentSlide, setCurrentSlide] = React.useState<number>(0)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const cardsPerView = 4 // Number of cards visible at once on desktop
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const filesOrigin = React.useMemo(() => apiBase.replace(/\/api$/, ""), [apiBase])
  const buildImageUrl = React.useCallback((path?: string) => {
    if (!path) return "/placeholder.svg"
    if (/^https?:\/\//i.test(path)) return path
    return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`
  }, [filesOrigin])

  const router = useRouter()
  const vehicle_type = useAppSelector(selectVehicleTypeId)
  const vehicleTypeName = useAppSelector(selectVehicleType)
  const handleVehicleClick = (vehicle: Vehicle) => {
    navigateToVehicleProducts(vehicle)
  }

  const navigateToVehicleProducts = (vehicle: Vehicle) => {
    if (!vehicle) return

    const params = new URLSearchParams()
    const productType = vehicle.product_type?.trim() || "OE"
    params.set("productType", productType)

    if (vehicle.brand_id?.brand_name) {
      params.set("brand", vehicle.brand_id._id)
    }

    if (vehicle.model_id?.model_name) {
      params.set("model", vehicle.model_id._id)
    }

    if (vehicle.variant_id?.variant_name) {
      params.set("variant", vehicle.variant_id._id)
    }

    // if (vehicle.vehicle_name) {
    //   params.set("vehicleName", vehicle.vehicle_name)
    // }

    // if (vehicle.vehicle_type?.type_name) {
    //   params.set("vehicleType", vehicle.vehicle_type.type_name)
    // }

    router.push(`/shop/vehicle-products?${params.toString()}`)
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth / cardsPerView
      scrollRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' })
      setCurrentSlide(prev => Math.max(0, prev - 1))
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth / cardsPerView
      const maxSlide = Math.max(0, vehicles.length - cardsPerView)
      scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' })
      setCurrentSlide(prev => Math.min(maxSlide, prev + 1))
    }
  }

  const goToSlide = (slideIndex: number) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth / cardsPerView
      scrollRef.current.scrollTo({ left: slideIndex * cardWidth, behavior: 'smooth' })
      setCurrentSlide(slideIndex)
    }
  }
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        console.log("Fetching popular vehicles for type:", vehicle_type)
        const res = await getPopularVehicles(vehicle_type)
        const items = (res.data || [])
        console.log("Fetched vehicles:", items)
        setVehicles(items)
      } catch (e) {
        console.error("Error fetching vehicles:", e)
        setVehicles([])
      } finally {
        setLoading(false)
      }
    }
    if (vehicle_type) {
      fetchData()
    }
  }, [vehicle_type])


  return (
    <section className="py-12 px-4 max-w-screen-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Popular {vehicleTypeName === 'bike' ? 'Bike/Scooter' : 'Car'} Vehicles
        </h2>
      </div>

      {!loading && vehicles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No popular vehicles found for the selected vehicle type.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={scrollLeft}
            disabled={currentSlide === 0}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous vehicles"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>

          <button
            onClick={scrollRight}
            disabled={currentSlide >= Math.max(0, vehicles.length - cardsPerView)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next vehicles"
          >
            <ArrowRight className="h-5 w-5 text-gray-600" />
          </button>

          {/* Carousel Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          >
            {(loading ? Array.from({ length: 8 }) : vehicles).map((vehicle: Vehicle | any, idx: number) => {
          const imageSrc = vehicle?.vehicle_image || "/placeholder.svg"
          const name = vehicle?.vehicle_name || "Vehicle"
          const brand = vehicle?.brand_id?.brand_name || ""
          const model = vehicle?.model_id?.model_name || ""
          const variant = vehicle?.variant_id?.variant_name || ""
          const type = vehicle?.vehicle_type?.type_name || ""
          const key = vehicle?._id ?? idx

          return (
            <div
              key={key}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex-shrink-0 w-80 ${vehicle?._id ? 'cursor-pointer' : ''}`}
              onClick={vehicle?._id ? () => handleVehicleClick(vehicle) : undefined}
              role={vehicle?._id ? "button" : undefined}
              tabIndex={vehicle?._id ? 0 : -1}
            >
              <div className="relative p-4 bg-gray-50">
                {/* <button
                  className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: wishlist logic
                  }}
                >
                  <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                </button> */}
                <img
                  src={imageSrc}
                  alt={name}
                  className="w-full h-48 object-contain"
                  onClick={vehicle?._id ? (e) => {
                    e.stopPropagation()
                    handleVehicleClick(vehicle)
                  } : undefined}
                />
                <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium">
                  {type}
                </div>
              </div>

              <div className="p-4">
                <h3
                  className="font-semibold text-gray-900 mb-1"
                  onClick={vehicle?._id ? (e) => {
                    e.stopPropagation()
                    handleVehicleClick(vehicle)
                  } : undefined}
                >
                  {name}
                </h3>
                {brand && (
                  <p className="text-sm text-gray-600 mb-1">{brand}</p>
                )}
                {model && (
                  <p className="text-sm text-gray-500 mb-3">{model}</p>
                )}
                {variant && (
                  <p className="text-xs text-gray-400 mb-3">{variant}</p>
                )}

                <DynamicButton
                  className="w-full bg-red-600 text-white py-2 px-4 rounded font-medium transition-colors hover:bg-red-700"
                  text="View Details"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (vehicle?._id) handleVehicleClick(vehicle)
                  }}
                />
              </div>
            </div>
          )
        })}
          </div>

          {/* Dot Indicators */}
          {!loading && vehicles.length > cardsPerView && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: Math.ceil(vehicles.length / cardsPerView) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    Math.floor(currentSlide / cardsPerView) === index
                      ? 'bg-red-600'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
