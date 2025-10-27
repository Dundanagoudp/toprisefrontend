"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectVehicleType, selectVehicleTypeId } from '@/store/slice/vehicle/vehicleSlice';
import { getBrandsByType } from '@/service/product-Service';
import { Brand } from '@/types/catalogue-types';
import { Car, Bike, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface SearchByBrandProps {
  className?: string;
}

const SearchByBrand: React.FC<SearchByBrandProps> = ({ className = "" }) => {
  const router = useRouter();
  const vehicleType = useAppSelector(selectVehicleType);
  const typeId = useAppSelector(selectVehicleTypeId);
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch brands based on vehicle type
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getBrandsByType(typeId);

        if (response?.data) {
          setBrands(Array.isArray(response.data) ? response.data : []);
        } else {
          setBrands([]);
        }
      } catch (err) {
        console.error('Failed to fetch brands:', err);
        setError('Failed to load brands');
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    if (typeId) {
      fetchBrands();
    }
  }, [typeId, vehicleType]);

  const handleBrandClick = (brand: Brand) => {
    if (!brand?._id) {
      console.warn("No brand ID found for:", brand);
      return;
    }
  
    const params = new URLSearchParams();
    params.set("brand", brand._id);
    if (typeId) params.set("vehicleTypeId", typeId);
  
    router.push(`/shop/search-results?${params.toString()}`);
  };
  

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const getVehicleIcon = () => {
    return vehicleType === 'car' ? (
      <Car className="h-5 w-5 text-blue-600" />
    ) : (
      <Bike className="h-5 w-5 text-green-600" />
    );
  };

  const buildImageUrl = (path?: string) => {
    if (!path) return "/placeholder.svg";
    if (/^https?:\/\//i.test(path)) return path;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const filesOrigin = apiBase.replace(/\/api$/, "");
    return `${filesOrigin}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  if (loading) {
    return (
      <section className={`py-12 px-4 bg-white ${className}`}>
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            {getVehicleIcon()}
            <h2 className="text-3xl font-bold text-gray-900">Search by Brands</h2>
          </div>
          
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 bg-white rounded-lg border border-gray-200 p-8 min-w-[240px] min-h-[240px] text-center flex flex-col items-center justify-center"
                >
                  <div className="mb-4 flex justify-center">
                    <Loader2 className="w-24 h-24 animate-spin text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    Loading...
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`py-12 px-4 bg-white ${className}`}>
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            {getVehicleIcon()}
            <h2 className="text-3xl font-bold text-gray-900">Search by Brands</h2>
          </div>
          
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 px-4 bg-white ${className}`}>
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          
          <h2 className="text-3xl font-bold text-gray-900">Search by Brands</h2>
        </div>

        <div className="relative">
          {/* Left Arrow - Hidden on mobile, visible on desktop */}
          <button
            onClick={scrollLeft}
            className="hidden md:flex absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow hover:bg-gray-50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>

          {/* Right Arrow - Hidden on mobile, visible on desktop */}
          <button
            onClick={scrollRight}
            className="hidden md:flex absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow hover:bg-gray-50"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide md:scroll-smooth"
          >
            {(brands.length > 0 ? brands : []).map((brand: Brand, idx: number) => (
              <div
                key={brand?._id ?? idx}
                className="flex-shrink-0 bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow cursor-pointer min-w-[240px] min-h-[240px] text-center flex flex-col items-center justify-center"
                onClick={() => handleBrandClick(brand)}
              >
                <div className="mb-4 flex justify-center">
                  <img
                    src={buildImageUrl(brand?.brand_logo)}
                    alt={brand?.brand_name || "Brand"}
                    className="w-24 h-24 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold text-2xl">${brand.brand_name?.charAt(0) || 'B'}</div>`;
                      }
                    }}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                  {brand?.brand_name || "\u00A0"}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

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
  );
};

export default SearchByBrand;
