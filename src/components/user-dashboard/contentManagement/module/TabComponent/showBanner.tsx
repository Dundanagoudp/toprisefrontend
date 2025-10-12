"use client";
import { useState, useEffect } from "react";
import { useToast as useGlobalToast } from "@/components/ui/toast";
import { getBanners, deleteBanner, Banner } from "@/service/product-Service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShowBannerProps {
  searchQuery?: string;
}

export default function ShowBanner({ searchQuery }: ShowBannerProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const { showToast } = useGlobalToast();

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await getBanners();
      setBanners(response.data || []);
    } catch (error: any) {
      console.error("Error fetching banners:", error);
      showToast(
        error?.response?.data?.message || "Failed to fetch banners",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    
    // Listen for banner created event
    const handleBannerCreated = () => {
      fetchBanners();
    };
    
    window.addEventListener("bannerCreated", handleBannerCreated);
    
    return () => {
      window.removeEventListener("bannerCreated", handleBannerCreated);
    };
  }, []);

  const handleDelete = async (bannerId: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      setDeleteLoading(bannerId);
      await deleteBanner(bannerId);
      showToast("Banner deleted successfully", "success");
      fetchBanners();
    } catch (error: any) {
      console.error("Error deleting banner:", error);
      showToast(
        error?.response?.data?.message || "Failed to delete banner",
        "error"
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredBanners = banners.filter((banner) =>
    searchQuery
      ? banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banner.vehicle_type.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {filteredBanners.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchQuery ? "No banners found matching your search" : "No banners available"}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Vehicle Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Images</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBanners.map((banner) => (
                <TableRow key={banner._id}>
                  <TableCell className="font-medium">{banner.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{banner.vehicle_type}</Badge>
                  </TableCell>
                  <TableCell>
                    {banner.is_active ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <Eye className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {banner.web && (
                        <Badge variant="secondary" className="text-xs">
                          Web
                        </Badge>
                      )}
                      {banner.mobile && (
                        <Badge variant="secondary" className="text-xs">
                          Mobile
                        </Badge>
                      )}
                      {banner.tablet && (
                        <Badge variant="secondary" className="text-xs">
                          Tablet
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewBanner(banner)}
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(banner._id)}
                        disabled={deleteLoading === banner._id}
                        title="Delete"
                      >
                        {deleteLoading === banner._id ? (
                          <div className="h-4 w-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-600" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewBanner} onOpenChange={() => setPreviewBanner(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewBanner?.title}</DialogTitle>
            <DialogDescription>
              Vehicle Type: {previewBanner?.vehicle_type} | Status:{" "}
              {previewBanner?.is_active ? "Active" : "Inactive"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewBanner?.web && (
              <div>
                <h4 className="font-semibold mb-2">Web Banner</h4>
                <img
                  src={previewBanner.web}
                  alt="Web banner"
                  className="w-full rounded-lg border"
                />
              </div>
            )}
            {previewBanner?.mobile && (
              <div>
                <h4 className="font-semibold mb-2">Mobile Banner</h4>
                <img
                  src={previewBanner.mobile}
                  alt="Mobile banner"
                  className="w-full max-w-sm rounded-lg border"
                />
              </div>
            )}
            {previewBanner?.tablet && (
              <div>
                <h4 className="font-semibold mb-2">Tablet Banner</h4>
                <img
                  src={previewBanner.tablet}
                  alt="Tablet banner"
                  className="w-full max-w-md rounded-lg border"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

