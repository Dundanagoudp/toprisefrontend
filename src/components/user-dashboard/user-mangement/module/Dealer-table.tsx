"use client"
import { MoreHorizontal, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"

const dealerData = [
  {
    dealerId: "05 Jan 2025",
    dealerName: "EMP102",
    name: "Mahesh Shinde",
    emailPhone: "Mahesh@company.com",
    role: "Support",
    department: "Tech",
    status: "Active",
  },
  {
    dealerId: "05 Jan 2025",
    dealerName: "EMP102",
    name: "Mahesh Shinde",
    emailPhone: "Mahesh@company.com",
    role: "Support",
    department: "Tech",
    status: "Active",
  },
  {
    dealerId: "05 Jan 2025",
    dealerName: "EMP102",
    name: "Mahesh Shinde",
    emailPhone: "Mahesh@company.com",
    role: "Support",
    department: "Tech",
    status: "Active",
  },
  {
    dealerId: "05 Jan 2025",
    dealerName: "EMP102",
    name: "Mahesh Shinde",
    emailPhone: "Mahesh@company.com",
    role: "Support",
    department: "Tech",
    status: "Active",
  },
  {
    dealerId: "05 Jan 2025",
    dealerName: "EMP102",
    name: "Mahesh Shinde",
    emailPhone: "Mahesh@company.com",
    role: "Support",
    department: "Tech",
    status: "Active",
  },
  {
    dealerId: "05 Jan 2025",
    dealerName: "EMP102",
    name: "Mahesh Shinde",
    emailPhone: "Mahesh@company.com",
    role: "Support",
    department: "Tech",
    status: "Active",
  },
  {
    dealerId: "05 Jan 2025",
    dealerName: "EMP102",
    name: "Mahesh Shinde",
    emailPhone: "Mahesh@company.com",
    role: "Support",
    department: "Tech",
    status: "Active",
  },
  {
    dealerId: "05 Jan 2025",
    dealerName: "EMP102",
    name: "Mahesh Shinde",
    emailPhone: "Mahesh@company.com",
    role: "Support",
    department: "Tech",
    status: "Active",
  },
]

export default function Dealertable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
              <Checkbox />
            </th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Dealer ID</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Dealer Name</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Name</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Email/Phone</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Role</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Department</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Access Permission</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Status</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm"></th>
          </tr>
        </thead>
        <tbody>
          {dealerData.map((dealer, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-3 md:p-4">
                <Checkbox />
              </td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">{dealer.dealerId}</td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">{dealer.dealerName}</td>
              <td className="p-3 md:p-4 font-medium text-gray-900 text-sm">{dealer.name}</td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">{dealer.emailPhone}</td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">{dealer.role}</td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">{dealer.department}</td>
              <td className="p-3 md:p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent text-xs">
                      Role Access
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Full Access</DropdownMenuItem>
                    <DropdownMenuItem>Limited Access</DropdownMenuItem>
                    <DropdownMenuItem>Read Only</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
              <td className="p-3 md:p-4">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {dealer.status}
                </span>
              </td>
              <td className="p-3 md:p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
