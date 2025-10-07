"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DynamicButton from "@/components/common/button/button";
import { useToast as GlobalToast } from "@/components/ui/toast";
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface UpdateModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (formData: FormData) => Promise<void>;
  item: any;
  type: 'category' | 'subcategory' | 'brand' | 'model' | 'variant';
  vehicleTypes?: any[];
  categories?: any[];
  brands?: any[];
  models?: any[];
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
  models = []
}: UpdateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'Active',
    vehicleType: '',
    category: '',
    brand: '',
    model: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { showToast } = GlobalToast();

  useEffect(() => {
    if (open && item) {
      console.log("UpdateModal - Loading item:", item);
      setFormData({
        name: item.category_name || item.subcategory_name || item.brand_name || item.model_name || item.variant_name || '',
        code: item.category_code || item.subcategory_code || item.brand_code || item.model_code || item.variant_code || '',
        description: item.category_description || item.subcategory_description || item.brand_description || item.model_description || item.variant_Description || item.description || '',
        status: item.category_Status || item.subcategory_status || item.brand_Status || item.status || item.model_Status || item.variant_status || 'Active',
        vehicleType: item.type || item.vehicleType_id || '',
        category: item.category_ref || item.category_id || '',
        brand: item.brand_ref || item.brand_id || (typeof item.brand === 'object' ? item.brand?._id : item.brand) || '',
        model: item.model || item.model_id || ''
      });
      console.log("UpdateModal - Form data set:", {
        name: item.category_name || item.subcategory_name || item.brand_name || item.model_name || item.variant_name || '',
        description: item.category_description || item.subcategory_description || item.brand_description || item.model_description || item.variant_Description || item.description || '',
        brand: item.brand_ref || item.brand_id || (typeof item.brand === 'object' ? item.brand?._id : item.brand) || ''
      });
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
      
      // Add type-specific name fields
      if (type === 'category') {
        submitFormData.append('category_name', formData.name);
        if (formData.code) submitFormData.append('category_code', formData.code);
        if (formData.description) submitFormData.append('category_description', formData.description);
        if (formData.vehicleType) submitFormData.append('type', formData.vehicleType);
        submitFormData.append('category_Status', formData.status);
      } else if (type === 'subcategory') {
        submitFormData.append('subcategory_name', formData.name);
        if (formData.code) submitFormData.append('subcategory_code', formData.code);
        if (formData.description) submitFormData.append('subcategory_description', formData.description);
        if (formData.category) submitFormData.append('category_ref', formData.category);
        submitFormData.append('subcategory_status', formData.status);
      } else if (type === 'brand') {
        submitFormData.append('brand_name', formData.name);
        if (formData.code) submitFormData.append('brand_code', formData.code);
        if (formData.description) submitFormData.append('brand_description', formData.description);
        submitFormData.append('status', formData.status);
      } else if (type === 'model') {
        submitFormData.append('model_name', formData.name);
        if (formData.code) submitFormData.append('model_code', formData.code);
        if (formData.description) submitFormData.append('model_description', formData.description);
        if (formData.brand) submitFormData.append('brand_ref', formData.brand);
        submitFormData.append('status', formData.status);
      } else if (type === 'variant') {
        submitFormData.append('variant_name', formData.name);
        if (formData.code) submitFormData.append('variant_code', formData.code);
        if (formData.description) submitFormData.append('variant_Description', formData.description);
        if (formData.model) submitFormData.append('model', formData.model);
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
      onClose();
    } catch (error: any) {
      console.error(`Error updating ${type}:`, error);
      showToast(error?.response?.data?.message || `Failed to update ${type}`, "error");
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
      <DialogOverlay className="bg-transparent" />
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

          {/* Description Field */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={`Enter ${type} description`}
              className="min-h-[80px]"
            />
            {formData.description && (
              <p className="text-xs text-gray-500">
                {formData.description.length} characters
              </p>
            )}
          </div>

          {/* Vehicle Type Field (for categories) */}
          {type === 'category' && vehicleTypes.length > 0 && (
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
