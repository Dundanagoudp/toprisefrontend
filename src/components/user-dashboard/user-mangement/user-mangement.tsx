"use client"

import { useState } from "react"
import Employeetable from "./module/Employee-table"
import Dealertable from "./module/Dealer-table"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import addSquare from "../../../../public/assets/addSquare.svg";
import { useRouter } from "next/navigation";
import DynamicButton from "@/components/common/button/button";
import uploadFile from "../../../../public/assets/uploadFile.svg";
import FileUploadModal from "./module/Employee-upload"


export default function Usermangement() {
  const [activeTab, setActiveTab] = useState("employee")
  const [addLoading, setAddLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const router = useRouter();


  return (
    <div className="flex-1 p-4 md:p-6 bg-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6">User Management</h1>

        {/* Tabs - Connected design */}
        <div className="inline-flex mb-4 md:mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("employee")}
            className={`px-6 py-2 -mb-px font-medium text-lg transition-colors duration-200 border-b-2 focus:outline-none ${
              activeTab === "employee"
                ? "border-[#C72920] text-[#C72920]"
                : "border-transparent text-gray-500 hover:text-[#C72920]"
            }`}
          >
            Employee
          </button>
          <button
            onClick={() => setActiveTab("dealer")}
            className={`px-6 py-2 -mb-px font-medium text-lg transition-colors duration-200 border-b-2 focus:outline-none ${
              activeTab === "dealer"
                ? "border-[#C72920] text-[#C72920]"
                : "border-transparent text-gray-500 hover:text-[#C72920]"
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
              <Input
                placeholder="Search Spare parts"
                className="pl-10 bg-gray-50 border-gray-200 w-full"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={role} onValueChange={setRole} defaultValue="all">
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="dealer">Dealer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
            {activeTab === "dealer" && (
              <DynamicButton
                variant="default"
                customClassName="flex items-center text-[#408EFD] border-[#408EFD] gap-3 bg-[#408EFD1A] border-[#408EFD] hover:bg-[#408ffd3a] rounded-[8px] px-4 py-2 min-w-[140px] justify-center"
                onClick={() => {
                  setUploadLoading(true);
                  setUploadOpen(true);
                  setTimeout(() => setUploadLoading(false), 800);
                }}
                disabled={uploadLoading}
                loading={uploadLoading}
                loadingText="Opening..."
                icon={<Image src={uploadFile} alt="Upload" className="h-4 w-4" />}
                text="Upload"
              />
            )}
            <Button
              className="flex items-center gap-3 bg-[#C729201A] border border-[#C72920] hover:bg-[#c728203a] text-[#C72920] rounded-[8px] px-4 py-2 min-w-[140px] justify-center"
              variant="default"
              onClick={async () => {
                setAddLoading(true);
                if (activeTab === "employee") {
                  router.push("/user/dashboard/user/addemployee");
                } else {
                  router.push("/user/dashboard/user/adddealer");
                }
                setTimeout(() => setAddLoading(false), 1000); // Simulate loading
              }}
              disabled={addLoading}
            >
              {addLoading ? (
                <svg className="animate-spin h-5 w-5 text-[#C72920]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              ) : (
                <Image src={addSquare} alt="Add" className="h-4 w-4" />
              )}
              <span className="b3 font-RedHat">
                {activeTab === "employee" ? "Add Employee" : "Add Dealer"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Table Content - Mobile responsive */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {activeTab === "employee"
          ? <Employeetable />
          : <Dealertable search={search} role={role === "all" ? "" : role} />}
      </div>
      <FileUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        mode="uploadDealer"
      />
    
    </div>
  )
}
