"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import DynamicButton from "@/components/common/button/button";
import { useToast as GlobalToast } from "@/components/ui/toast";
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface UpdateModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (formData: FormData) => Promise<void>;
  item: any;
  type: 'category' | 'subcategory' | 'brand' | 'model' | 'variant'|'year';
  vehicleTypes?: any[];
  categories?: any[];
  brands?: any[];
  models?: any[];
  years?: any[];
}

export default function UpdateModal({
  open,
  onClose,
  onUpdate,
  item,
  type,
  vehicleTypes = [],
  categories = [],
  brands = [],
  models = [],
  years = []
}: UpdateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    status: 'active',
    vehicleType: '',
    category: '',
    brand: '',
    model: '',
    years: [] as string[],
    featured_brand: false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { showToast } = GlobalToast();

  useEffect(() => {
    if (open && item) {
      console.log("UpdateModal - Loading item:", item);
      
      // Extract values with proper field mapping
      const name = item.category_name || item.subcategory_name || item.brand_name || item.model_name || item.variant_name || '';
      const code = item.category_code || item.subcategory_code || item.brand_code || item.model_code || item.variant_code || '';
      // Extract status with proper mapping for categories and subcategories
      let status = item.status || item.brand_Status || item.category_Status || item.subcategory_status || item.model_Status || item.variant_status || 'active';
      
      // Map all content type status values to dropdown options
      // if (type === 'category' || type === 'subcategory' || type === 'brand' || type === 'model' || type === 'variant') {
      //   if (status === 'Created' || status === 'active') {
      //     status = 'active';
      //   } else if (status === 'Draft' || status === 'inactive') {
      //     status = 'inactive';
      //   }
      // }
     
      if(type === 'category' ){
        if (status === 'Created' || status === 'active') {
          status = 'Active';
        } else if (status === 'Draft' || status === 'inactive') {
          status = 'Inactive';
        }

      }else if(type === 'subcategory' ){
        if (status === 'Created' || status === 'active') {
          status = 'Active';
        } else if (status === 'Draft' || status === 'inactive') {
          status = 'Inactive';
        }
      }else if(type === 'brand' ){
         if (status === 'Created' || status === 'active') {
          status = 'Active';
        } else if (status === 'Draft' || status === 'inactive') {
          status = 'Inactive';
        }
        
      }else if(type === 'model' ){
        if (status === 'Created' || status === 'active') {
          status = 'Active';
        } else if (status === 'Draft' || status === 'inactive') {
          status = 'Inactive';
        }
        
      }else if(type === 'variant' ){
        if (status === 'Created' || status === 'active') {
          status = 'Active';
        } else if (status === 'Draft' || status === 'inactive') {
          status = 'Inactive';
        }
      }
       console.log("type: ", type, "  status:", status);

      // Extract vehicle type properly for categories
      const vehicleType = (typeof item.type === 'object' ? item.type?._id : item.type) || item.vehicleType_id || item.type_id || '';
      
      // Extract model ID properly (handle both object and string)
      const modelValue = typeof item.model === 'object' && item.model?._id 
        ? item.model._id 
        : (item.model || item.model_id || '');
      
      // Extract years (handle both array of IDs and array of objects)
      const yearValues = item.Year && Array.isArray(item.Year)
        ? item.Year.map((year: any) => 
            typeof year === 'object' && year?._id ? year._id : year
          )
        : [];
      
      // Extract category ID properly for subcategories
      const categoryValue = typeof item.category_ref === 'object' && item.category_ref?._id 
        ? item.category_ref._id 
        : (item.category_ref || item.category_id || '');
      
      setFormData({
        name,
        code,
        status,
        vehicleType,
        category: categoryValue,
        brand: (typeof item.brand_ref === 'object' ? item.brand_ref?._id : item.brand_ref) || item.brand_id || (typeof item.brand === 'object' ? item.brand?._id : item.brand) || '',
        model: modelValue,
        years: yearValues,
        featured_brand: item.featured_brand || false
      });
      
      console.log("UpdateModal - Form data set:", { name, code, status, vehicleType, category: categoryValue, brand: (typeof item.brand_ref === 'object' ? item.brand_ref?._id : item.brand_ref) || item.brand_id || (typeof item.brand === 'object' ? item.brand?._id : item.brand) || '', model: modelValue, years: yearValues });
      console.log("UpdateModal - Original status from item:", item.brand_Status || item.category_Status || item.subcategory_status || item.model_Status || item.variant_status, "Mapped to:", status);
      console.log("UpdateModal - Original vehicle type from item:", item.type, "Mapped to:", vehicleType);
      console.log("UpdateModal - Original brand data from item:", {
        brand_ref: item.brand_ref,
        brand_id: item.brand_id,
        brand: item.brand,
        brand_ref_type: typeof item.brand_ref,
        brand_ref_id: typeof item.brand_ref === 'object' ? item.brand_ref?._id : item.brand_ref
      }, "Mapped to:", (typeof item.brand_ref === 'object' ? item.brand_ref?._id : item.brand_ref) || item.brand_id || (typeof item.brand === 'object' ? item.brand?._id : item.brand) || '');
      console.log("UpdateModal - Full item data for debugging:", item);
      
      setImagePreview(item.category_image || item.subcategory_image || item.brand_logo || item.model_image || item.variant_image || '');
      setImageFile(null);
    }
  }, [open, item]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showToast("Name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const submitFormData = new FormData();
      
      console.log("Submitting update for", type, "with data:", formData);
      if(type === 'category' ){
        if (formData.status === 'Active') {
          formData.status = 'Active';
        } else if ( formData.status === 'Inactive') {
          formData.status = 'Inactive';
        }

      }else if(type === 'subcategory' ){
        if (formData.status === 'Active') {
          formData.status = 'Active';
        } else if ( formData.status === 'Inactive') {
          formData.status = 'Inactive';
        }
      }else if(type === 'brand' ){
        if (formData.status === 'Active') {
          formData.status = 'active';
        } else if ( formData.status === 'Inactive') {
          formData.status = 'inactive';
        }
        
      }else if(type === 'model' ){
        if (formData.status === 'Active') {
          formData.status = 'Active';
        } else if ( formData.status === 'Inactive') {
          formData.status = 'Inactive';
        }
        
      }else if(type === 'variant' ){
        if (formData.status === 'Active') {
          formData.status = 'active';
        } else if ( formData.status === 'Inactive') {
          formData.status = 'inactive';
        }
      }
      // Add type-specific name fields
      if (type === 'category') {
        submitFormData.append('category_name', formData.name);
        if (formData.code) submitFormData.append('category_code', formData.code);
        if (formData.vehicleType) submitFormData.append('type', formData.vehicleType);
        submitFormData.append('category_Status', formData.status);
      } else if (type === 'subcategory') {
        submitFormData.append('subcategory_name', formData.name);
        if (formData.code) submitFormData.append('subcategory_code', formData.code);
        if (formData.category) submitFormData.append('category_ref', formData.category);
        submitFormData.append('subcategory_status', formData.status);
      } else if (type === 'brand') {
        submitFormData.append('brand_name', formData.name);
        if (formData.code) submitFormData.append('brand_code', formData.code);
        if (formData.vehicleType) submitFormData.append('type', formData.vehicleType);
        submitFormData.append('status', formData.status);
        submitFormData.append('featured_brand', String(formData.featured_brand));
      } else if (type === 'model') {
        submitFormData.append('model_name', formData.name);
        if (formData.code) submitFormData.append('model_code', formData.code);
        if (formData.brand) submitFormData.append('brand_ref', formData.brand);
        submitFormData.append('status', formData.status);
      } else if (type === 'variant') {
        submitFormData.append('variant_name', formData.name);
        if (formData.code) submitFormData.append('variant_code', formData.code);
        if (formData.model) submitFormData.append('model', formData.model);
        // Years field removed from update modal
        submitFormData.append('variant_status', formData.status);
      }
      
      // Add image if selected
      if (imageFile) {
        const imageFieldName = type === 'category' ? 'file' : 
                              type === 'subcategory' ? 'file' :
                              type === 'brand' ? 'file' :
                              type === 'model' ? 'model_image' : 'file';
        submitFormData.append(imageFieldName, imageFile);
      }

      // Log FormData contents
      console.log("FormData contents:");
      for (let pair of submitFormData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      await onUpdate(submitFormData);
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`, "success");
      
      // Reset form and close modal
      setFormData({
        name: '',
        code: '',
        status: 'active',
        vehicleType: '',
        category: '',
        brand: '',
        model: '',
        years: [],
        featured_brand: false
      });
      setImageFile(null);
      setImagePreview('');
      onClose();
    } catch (error: any) {
      console.error(`Error updating ${type}:`, error);
      // Extract error message from API response
      const errorMessage = error?.response?.data?.message || 
                         error?.response?.data?.error || 
                         error?.message || 
                         `Failed to update ${type}. Please try again.`;
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'category': return 'Update Category';
      case 'subcategory': return 'Update Subcategory';
      case 'brand': return 'Update Brand';
      case 'model': return 'Update Model';
      case 'variant': return 'Update Variant';
      default: return 'Update Item';
    }
  };

  const getImageFieldName = () => {
    switch (type) {
      case 'category': return 'Category Image';
      case 'subcategory': return 'Subcategory Image';
      case 'brand': return 'Brand Logo';
      case 'model': return 'Model Image';
      case 'variant': return 'Variant Image';
      default: return 'Image';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" key={item?._id}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{getTitle()}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name Field */}
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={`Enter ${type} name`}
            />
          </div>

          {/* Code Field */}
          <div className="grid gap-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              placeholder={`Enter ${type} code`}
            />
          </div>


          {/* Vehicle Type Field (for categories and brands) */}
          {(type === 'category' || type === 'brand') && vehicleTypes.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange('vehicleType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type._id} value={type._id}>
                      {type.type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category Field (for subcategories) */}
          {type === 'subcategory' && categories.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Brand Field (for models) */}
          {type === 'model' && brands.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="brand">Brand</Label>
              <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand._id} value={brand._id}>
                      {brand.brand_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Model Field (for variants) */}
          {type === 'variant' && models.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="model">Model</Label>
              <Select value={formData.model} onValueChange={(value) => handleInputChange('model', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model._id} value={model._id}>
                      {model.model_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status Field */}
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Featured Brand Toggle (only for brands) */}
          {type === 'brand' && (
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="featured_brand" className="text-sm font-medium">
                    Featured Brand
                  </Label>
                  <p className="text-xs text-gray-500">
                    Mark this brand as featured to highlight it on the platform
                  </p>
                </div>
                <Switch
                  id="featured_brand"
                  checked={formData.featured_brand}
                  onCheckedChange={(checked) => handleInputChange('featured_brand', checked as any)}
                />
              </div>
            </div>
          )}

          {/* Image Upload Field - Hide for Variants */}
          {type !== 'variant' && (
            <div className="grid gap-2">
              <Label htmlFor="image">{getImageFieldName()}</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('image')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <DynamicButton
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </DynamicButton>
          <DynamicButton
            onClick={handleSubmit}
            disabled={loading}
            loading={loading}
          >
            Update {type.charAt(0).toUpperCase() + type.slice(1)}
          </DynamicButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
