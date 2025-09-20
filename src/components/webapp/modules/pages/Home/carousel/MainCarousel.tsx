"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CarouselItem {
  id: string
  title: string
  description: string
  image: string
  ctaText: string
  ctaLink: string
}

const carouselData: CarouselItem[] = [
  {
    id: "1",
    title: "Premium Auto Parts",
    description: "Discover our extensive collection of high-quality automotive parts for all vehicle types. From engine components to accessories, we have everything you need.",
    image: "/assets/HeroCard.jpg",
    ctaText: "Shop Now",
    ctaLink: "/shop"
  },
  {
    id: "2", 
    title: "Expert Installation",
    description: "Professional installation services available. Our certified technicians ensure your parts are installed correctly and safely.",
    image: "/assets/Engineers.jpg",
    ctaText: "Learn More",
    ctaLink: "/services"
  },
  {
    id: "3",
    title: "Fast Delivery",
    description: "Get your parts delivered quickly with our express shipping options. Same-day delivery available in select areas.",
    image: "/assets/Gear.jpg",
    ctaText: "View Options",
    ctaLink: "/delivery"
  }
]

export default function MainCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === carouselData.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? carouselData.length - 1 : currentIndex - 1)
    setIsAutoPlaying(false) // Stop auto-play when user interacts
  }

  const goToNext = () => {
    setCurrentIndex(currentIndex === carouselData.length - 1 ? 0 : currentIndex + 1)
    setIsAutoPlaying(false) // Stop auto-play when user interacts
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false) // Stop auto-play when user interacts
  }

  return (
    <section className="relative w-full h-96 overflow-hidden bg-gray-100">
      {/* Carousel Container */}
      <div className="relative w-full h-full">
        {carouselData.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-full">
              {/* Background Image */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-screen-2xl mx-auto px-4 w-full">
                  <div className="max-w-2xl text-white">
                    <h2 className="text-4xl font-bold mb-4">{item.title}</h2>
                    <p className="text-xl mb-6 opacity-90">{item.description}</p>
                    <button 
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                      onClick={() => window.open(item.ctaLink, '_blank')}
                    >
                      {item.ctaText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {carouselData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-white' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
