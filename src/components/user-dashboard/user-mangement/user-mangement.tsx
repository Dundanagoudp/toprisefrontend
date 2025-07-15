"use client"

import { useState } from "react"
import Employeetable from "./module/Employee-table"
import Dealertable from "./module/Dealer-table"
import { Search, Upload, Plus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import addSquare from "../../../../public/assets/addSquare.svg";
import uploadFile from "../../../../public/assets/uploadFile.svg";
import { useRouter } from "next/navigation";


export default function Usermangement() {
  const [activeTab, setActiveTab] = useState("employee")
  const router = useRouter();

  return (
    <div className="flex-1 p-4 md:p-6 bg-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6">User Management</h1>

        {/* Tabs - Connected design */}
        <div className="inline-flex rounded-lg bg-gray-200 p-1 mb-4 md:mb-6">
          <button
            onClick={() => setActiveTab("employee")}
            className={`px-4 md:px-6 py-2.5 rounded-md font-medium text-sm whitespace-nowrap transition-all duration-200 ${
              activeTab === "employee"
                ? "bg-red-600 text-white shadow-sm"
                : "bg-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            Employee
          </button>
          <button
            onClick={() => setActiveTab("dealer")}
            className={`px-4 md:px-6 py-2.5 rounded-md font-medium text-sm whitespace-nowrap transition-all duration-200 ${
              activeTab === "dealer"
                ? "bg-red-600 text-white shadow-sm"
                : "bg-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            Dealer
          </button>
        </div>

        {/* Search and Actions Bar - Mobile responsive */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search Spare parts" className="pl-10 bg-gray-50 border-gray-200 w-full" />
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent whitespace-nowrap">
                <Filter className="w-4 h-4" />
                Filters
              </Button>

              <Select defaultValue="role">
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
<Button
                variant="default"
                className="flex items-center gap-3 bg-[#408EFD1A] border-[#408EFD] hover:bg-[#408ffd3a] rounded-[8px] px-4 py-2 min-w-[120px] justify-center"
              >
                <Image src={uploadFile} alt="Add" className="h-4 w-4" />
                <span className="text-[#408EFD] b3">Upload</span>
              </Button>
              <Button
                className="flex items-center gap-3 bg-[#C729201A] border border-[#C72920] hover:bg-[#c728203a] text-[#C72920] rounded-[8px] px-4 py-2 min-w-[140px] justify-center"
                variant="default"
                onClick={() => {
                  if (activeTab === "employee") {
                    router.push("/user/dashboard/user/addemployee");
                  } else {
                    router.push("/user/dashboard/user/adddealer");
                  }
                }}
              >
                <Image src={addSquare} alt="Add" className="h-4 w-4" />
                <span className="b3 font-RedHat">
                  {activeTab === "employee" ? "Add Employee" : "Add Dealer"}
                </span>
              </Button>
          </div>
        </div>
      </div>

      {/* Table Content - Mobile responsive */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {activeTab === "employee" ? <Employeetable /> : <Dealertable />}
      </div>
    </div>
  )
}
