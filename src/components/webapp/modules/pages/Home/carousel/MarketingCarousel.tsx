"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star, Shield, Truck, Headphones } from "lucide-react"

interface MarketingItem {
  id: string
  title: string
  description: string
  image: string
  features: string[]
  icon: React.ReactNode
  bgColor: string
}

const marketingData: MarketingItem[] = [
  {
    id: "1",
    title: "Quality Assurance",
    description: "All our products undergo rigorous quality testing to ensure they meet the highest standards for performance and durability.",
    image: "/assets/Engineers.jpg",
    features: ["ISO Certified", "Warranty Included", "Tested Components"],
    icon: <Shield className="w-8 h-8" />,
    bgColor: "bg-blue-50"
  },
  {
    id: "2",
    title: "Fast & Reliable Delivery",
    description: "Get your orders delivered quickly with our nationwide network of logistics partners. Track your shipment in real-time.",
    image: "/assets/Gear.jpg",
    features: ["Same Day Delivery", "Real-time Tracking", "Secure Packaging"],
    icon: <Truck className="w-8 h-8" />,
    bgColor: "bg-green-50"
  },
  {
    id: "3",
    title: "Expert Customer Support",
    description: "Our knowledgeable support team is here to help you find the right parts and answer any questions you may have.",
    image: "/assets/AboutUs.jpg",
    features: ["24/7 Support", "Expert Advice", "Installation Help"],
    icon: <Headphones className="w-8 h-8" />,
    bgColor: "bg-purple-50"
  },
  {
    id: "4",
    title: "Customer Satisfaction",
    description: "Join thousands of satisfied customers who trust us for their automotive needs. Read our reviews and see why we're rated 5 stars.",
    image: "/assets/HeroCard.jpg",
    features: ["5-Star Rating", "10K+ Reviews", "Loyalty Program"],
    icon: <Star className="w-8 h-8" />,
    bgColor: "bg-yellow-50"
  }
]

export default function MarketingCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === marketingData.length - 1 ? 0 : prevIndex + 1
      )
    }, 6000) // Change slide every 6 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? marketingData.length - 1 : currentIndex - 1)
    setIsAutoPlaying(false)
  }

  const goToNext = () => {
    setCurrentIndex(currentIndex === marketingData.length - 1 ? 0 : currentIndex + 1)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  const currentItem = marketingData[currentIndex]

  return (
    <section className="py-16 px-4">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Toprise?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to providing the best automotive parts and services to our customers
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div className={`${currentItem.bgColor} rounded-2xl overflow-hidden shadow-lg`}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Content Side */}
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    {currentItem.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {currentItem.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  {currentItem.description}
                </p>

                {/* Features List */}
                <div className="space-y-3">
                  {currentItem.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Side */}
              <div className="relative h-80 md:h-96">
                <Image
                  src={currentItem.image}
                  alt={currentItem.title}
                  fill
                  className="object-cover"
                  priority={currentIndex === 0}
                />
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {marketingData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-blue-600' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
