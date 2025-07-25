"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import addSquare from "../../../../../public/assets/addSquare.svg";
import uploadFile from "../../../../../public/assets/uploadFile.svg";
import UploadBulkCard from "./uploadBulk";
import DynamicButton from "@/components/common/button/button";

export default function Emptydata() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleAddProduct = () => {
    router.push("/user/dashboard/product/Addproduct");
  };

  const handleUploadBulk = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-white p-4">
      <div className="flex flex-col items-center space-y-4">
        <Image
          src="/images/emptydata.png"
          alt="Document icon"
          width={120}
          height={120}
          className="w-30 h-30"
        />
        <p className="text-lg font-semibold text-gray-700">
          Add or upload the data
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <DynamicButton
              variant="default"
              customClassName=" bg-[#408EFD1A] text-[#408EFD] border-[#408EFD] hover:bg-[#408ffd3a] rounded-[8px] px-4 py-2 min-w-[120px] justify-center"
              onClick={handleUploadBulk}
              disabled={isModalOpen}
              text="Upload Bulk"
              icon={<Image src={uploadFile} alt="Add" className="h-4 w-4" />}
            />
            <DynamicButton
              variant="default"
              customClassName=" bg-[#C729201A] border border-[#C72920] hover:bg-[#c728203a] text-[#C72920] rounded-[8px] px-4 py-2 min-w-[140px] justify-center"
              onClick={handleAddProduct}
              text="Add Product"
              icon={<Image src={addSquare} alt="Add" className="h-4 w-4" />}
            />
          </div>
        </div>
        <UploadBulkCard
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}
