"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { exportDataToCsv } from "@/service/csvExportService";
import { Employee } from "@/types/employee-types";
import { Dealer } from "@/types/dealer-types";
import { AppUser } from "@/types/user-types";

interface ExportButtonProps {
  data: Employee[] | Dealer[] | AppUser[];
  dataType: "employees" | "dealers" | "users";
  disabled?: boolean;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function ExportButton({
  data,
  dataType,
  disabled = false,
  className = "",
  variant = "outline",
  size = "default"
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { showToast } = useToast();

  const handleExport = async () => {
    if (!data || data.length === 0) {
      showToast("No data available to export", "error");
      return;
    }

    setIsExporting(true);
    
    try {
      await exportDataToCsv(data, dataType);
      
      const dataTypeLabel = dataType.charAt(0).toUpperCase() + dataType.slice(1);
      showToast(`${dataTypeLabel} data exported successfully!`, "success");
    } catch (error) {
      console.error("Export failed:", error);
      showToast("Failed to export data. Please try again.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const getButtonText = () => {
    if (isExporting) {
      return "Exporting...";
    }
    return `Export ${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`;
  };

  const getIcon = () => {
    if (isExporting) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    return <Download className="h-4 w-4" />;
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isExporting || !data || data.length === 0}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      {getIcon()}
      {size !== "icon" && getButtonText()}
    </Button>
  );
}
