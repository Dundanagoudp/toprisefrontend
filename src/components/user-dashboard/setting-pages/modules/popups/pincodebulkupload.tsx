"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, CheckCircle, AlertCircle, FileText } from "lucide-react"
import { bulkUploadPincodes } from "@/service/pincodeServices"
import { useToast } from "@/components/ui/toast"

interface BulkUploadModalProps {
  onSuccess: () => void
  onCancel: () => void
}

export function BulkUploadModal({ onSuccess, onCancel }: BulkUploadModalProps) {
  const { showToast } = useToast()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    totalRows: number
    inserted: number
    skipped: number
    errors?: Array<{ row: number; error: string }>
  } | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        showToast("Please select a CSV file", "error")
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast("File size should not exceed 5MB", "error")
        return
      }
      setSelectedFile(file)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const result = await bulkUploadPincodes(selectedFile)
      console.log("📤 Upload result:", result)
      
      // Ensure errors array exists, even if empty
      const uploadData = {
        ...result.data,
        errors: result.data.errors || []
      }
      
      setUploadResult(uploadData)
      
      // Show appropriate message based on errors and results
      if (uploadData.errors && uploadData.errors.length > 0) {
        showToast(
          `Upload completed with ${uploadData.errors.length} error(s). Please check the details below.`,
          "error"
        )
      } else if (uploadData.inserted === 0 && uploadData.skipped > 0) {
        showToast(
          `No records were inserted. ${uploadData.skipped} row(s) were skipped. Please check your CSV data.`,
          "error"
        )
      } else if (uploadData.inserted > 0 && uploadData.skipped > 0) {
        showToast(
          `Upload completed! ${uploadData.inserted} inserted, ${uploadData.skipped} skipped.`,
          "warning"
        )
      } else {
        showToast(result.message, "success")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      showToast("Failed to upload file. Please try again.", "error")
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setUploadResult(null)
  }

  // const handleDownloadSample = () => {
  //   const sampleCSV = `pincode,city,state,district,area,shipRocket_availability,borzo_standard,borzo_endOfDay,delivery_available,delivery_charges,estimated_delivery_days,cod_available,status
  // 560001,Bangalore,Karnataka,Bangalore Urban,MG Road,true,true,false,true,0,3,true,active
  // 560002,Bangalore,Karnataka,Bangalore Urban,Shivaji Nagar,true,false,true,true,50,2,true,active
  // 560003,Bangalore,Karnataka,Bangalore Urban,Malleshwaram,false,true,false,true,0,4,false,active`

  //   const blob = new Blob([sampleCSV], { type: 'text/csv' })
  //   const url = window.URL.createObjectURL(blob)
  //   const a = document.createElement('a')
  //   a.href = url
  //   a.download = 'pincode-sample.csv'
  //   a.click()
  //   window.URL.revokeObjectURL(url)
  // }

  return (
    <div className="space-y-6">
      {/* Sample Template Download */}
      {/* <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">CSV Template</h4>
              <p className="text-xs text-blue-700 mb-2">
                Download the sample CSV template to see the required format
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadSample}
                className="h-8 text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Download className="w-3 h-3 mr-1" />
                Download Sample CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* File Upload Section */}
      {!uploadResult && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file" className="text-sm font-medium">
              Select CSV File *
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex-1"
                disabled={uploading}
              />
            </div>
            {selectedFile && (
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Required CSV Columns:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• pincode, city, state, district, area</li>
              <li>• shipRocket_availability, borzo_standard, borzo_endOfDay</li>
              <li>• delivery_available, delivery_charges, estimated_delivery_days</li>
              <li>• cod_available, status</li>
            </ul>
          </div>
        </div>
      )}

      {/* Upload Results */}
      {uploadResult && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="text-sm font-semibold text-gray-900">Upload Complete</h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-xs text-blue-600 mb-1">Total Rows</p>
                <p className="text-2xl font-bold text-blue-900">{uploadResult.totalRows}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-xs text-green-600 mb-1">Inserted</p>
                <p className="text-2xl font-bold text-green-900">{uploadResult.inserted}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-md">
                <p className="text-xs text-yellow-600 mb-1">Skipped</p>
                <p className="text-2xl font-bold text-yellow-900">{uploadResult.skipped}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-md">
                <p className="text-xs text-red-600 mb-1">Errors</p>
                <p className="text-2xl font-bold text-red-900">{uploadResult.errors?.length || 0}</p>
              </div>
            </div>

            {/* Error Details Section - Simple compact message */}
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-300 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800">
                    <strong>Validation errors found in {uploadResult.errors.length} {uploadResult.errors.length === 1 ? 'row' : 'rows'}.</strong> Please fix the errors in your CSV file and upload again.
                  </p>
                </div>
              </div>
            )}

            {/* Info Section - Shows general skip reasons when no specific errors */}
            {uploadResult.skipped > 0 && (!uploadResult.errors || uploadResult.errors.length === 0) && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <h5 className="text-sm font-semibold text-yellow-900">Info:</h5>
                </div>
                <p className="text-xs text-yellow-700">
                  {uploadResult.skipped} row(s) were skipped. This usually happens when:
                </p>
                <ul className="text-xs text-yellow-700 space-y-1 pl-6 mt-2">
                  <li>• Pincode already exists in the database (duplicates)</li>
                  <li>• Invalid data format in CSV columns</li>
                  <li>• Missing required fields</li>
                </ul>
                <p className="text-xs text-yellow-700 mt-2">
                  Please verify your CSV data and ensure all pincodes are unique and properly formatted.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        {!uploadResult ? (
          <>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="bg-[#C72920] hover:bg-[#C72920]/90 text-white"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload CSV
                </div>
              )}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={handleReset}
            >
              Upload Another
            </Button>
            <Button
              onClick={() => {
                // Only call onSuccess if there are no errors
                if (uploadResult.errors && uploadResult.errors.length > 0) {
                  onCancel() // Close modal without success message
                } else {
                  onSuccess() // Close modal with success message
                }
              }}
              className="bg-[#C72920] hover:bg-[#C72920]/90 text-white"
            >
              Done
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
