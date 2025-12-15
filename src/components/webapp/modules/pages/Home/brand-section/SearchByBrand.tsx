"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectVehicleTypeId } from '@/store/slice/vehicle/vehicleSlice';
import { getBrandsByType } from '@/service/product-Service';
import { Brand } from '@/types/catalogue-types';
import { Loader2, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface SearchByBrandProps {
  className?: string;
}

const SearchByBrand: React.FC<SearchByBrandProps> = ({ className = "" }) => {
  const router = useRouter();
  const typeId = useAppSelector(selectVehicleTypeId);
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [typeId]);

  const handleBrandClick = (brand: Brand) => {
    const brandId = (brand as any)._id || brand.id;
    if (!brandId) {
      console.warn("No brand ID found for:", brand);
      return;
    }
  
    const params = new URLSearchParams();
    params.set("brand", brandId);
    if (typeId) params.set("vehicleTypeId", typeId);
  
    router.push(`/shop/model/${brandId}`);
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
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Search by Brands</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg border border-gray-200 p-8 min-h-[240px] text-center flex flex-col items-center justify-center"
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
      </section>
    );
  }

  if (error) {
    return (
      <section className={`py-12 px-4 bg-white ${className}`}>
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
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

  const displayedBrands = brands.slice(0, 6);

  return (
    <section className={`py-12 px-4 bg-white ${className}`}>
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Search by Brands</h2>
          <Button
            onClick={() => router.push(`/shop/brands/${typeId}`)}
            variant="outline"
            className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            View More
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {displayedBrands.map((brand: Brand, idx: number) => (
            <div
              key={(brand as any)._id ?? brand.id ?? idx}
              className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow cursor-pointer min-h-[240px] text-center flex flex-col items-center justify-center"
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
    </section>
  );
};

export default SearchByBrand;
