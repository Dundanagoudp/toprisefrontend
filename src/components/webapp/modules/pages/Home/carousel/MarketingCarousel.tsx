"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Shield,
  Truck,
  Headphones,
} from "lucide-react";
import { getRandomBanners } from "@/service/product-Service";
import { useAppSelector } from "@/store/hooks";
import {
  selectVehicleType,
  selectVehicleTypeId,
} from "@/store/slice/vehicle/vehicleSlice";

interface MarketingItem {
  id: string;
  title: string;
  description: string;
  image: string;
  features: string[];
  icon: React.ReactNode;
  bgColor: string;
}

export default function MarketingCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const vehicle_type = useAppSelector(selectVehicleTypeId);
  const [banners, setBanners] = useState<any[]>([]);
  const [screenSize, setScreenSize] = useState<"web" | "mobile" | "tablet">(
    "web"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await getRandomBanners(vehicle_type);
        console.log("banners", response.data);
        setBanners(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, [vehicle_type]);

  // Update screen size state based on window width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setScreenSize("mobile");
      } else if (window.innerWidth < 1024) {
        setScreenSize("tablet");
      } else {
        setScreenSize("web");
      }
    };

    handleResize(); // Set initial screen size
    window.addEventListener("resize", handleResize); // Update on window resize
    return () => window.removeEventListener("resize", handleResize); // Cleanup
  }, []);

  // Transform API response to match the expected data structure
  const transformedBanners = useMemo(() => {
    return banners.map((banner) => ({
      id: banner._id,
      title: banner.title,
      description: "", // Default empty description
      image: banner.image[screenSize], // Use image URL based on screen size
      features: [], // Default empty features array
      icon: <Shield className="w-8 h-8" />, // Default icon
      bgColor: "bg-blue-50", // Default background color
    }));
  }, [banners, screenSize]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || transformedBanners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === transformedBanners.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000); // Change slide every 6 seconds
    return () => clearInterval(interval);
  }, [isAutoPlaying, transformedBanners.length]);

  const goToPrevious = () => {
    setCurrentIndex(
      currentIndex === 0 ? transformedBanners.length - 1 : currentIndex - 1
    );
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex(
      currentIndex === transformedBanners.length - 1 ? 0 : currentIndex + 1
    );
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentItem = transformedBanners[currentIndex];

  // Show loading state while fetching banners
  if (loading) {
    return <div>Loading banners...</div>;
  }

  // Show error message if fetch failed
  if (error) {
    return <div>Error loading banners: {error}</div>;
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header section */}
        {/* <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Toprise?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to providing the best automotive parts and services to our customers
          </p>
        </div> */}

        {/* Carousel content */}
        {transformedBanners.length > 0 ? (
          <>
            <div className="relative">
              {/* Carousel item */}
              <div className="rounded-2xl overflow-hidden ">
                {/* Image content */}
                <div className="relative w-full aspect-video md:aspect-[16/6]">
                  {" "}
                  {currentItem && (
                    <Image
                      src={currentItem.image}
                      alt={currentItem.title}
                      fill
                      className="object-contain"
                      priority={currentIndex === 0}
                    />
                  )}
                </div>
              </div>

              {/* Navigation arrows */}
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

            {/* Dots indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {transformedBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? "bg-blue-600"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        ) : (
          // Message when no banners are available
          <div className="text-center text-gray-600">No banners available.</div>
        )}
      </div>
    </section>
  );
}
