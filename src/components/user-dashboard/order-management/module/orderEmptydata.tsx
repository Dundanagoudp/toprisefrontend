"use client"
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function OrderEmpty() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-white p-4">
      <div className="flex flex-col items-center space-y-4">
        <Image src="/images/emptydata.png" alt="Document icon" width={120} height={120} className="w-30 h-30" />
        <p className="text-lg font-semibold text-gray-700">Data is not avilable</p>
        <div className="flex gap-4">
        </div>
      </div>
    </div>
  );
}
