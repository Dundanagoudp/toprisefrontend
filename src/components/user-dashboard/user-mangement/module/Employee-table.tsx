"use client"
import { MoreHorizontal, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"

const employeeData = [
  {
    id: "EM123",
    name: "Kadin Rosser",
    email: "Kadin@gmail.com",
    phone: "+91 9381406724",
    role: "Admin",
    department: "Sales",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "EM124",
    name: "Omar Passaquindici Arcand",
    email: "Omar@gmail.com",
    phone: "+91 9381406724",
    role: "Sales",
    department: "Tech",
    status: "In-active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "EM125",
    name: "Erin Rosser",
    email: "Erin@gmail.com",
    phone: "+91 9381406724",
    role: "Support",
    department: "Logistics",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "EM126",
    name: "Dulce Passaquindici Arcand",
    email: "Dulce@gmail.com",
    phone: "+91 9381406724",
    role: "Warehouse",
    department: "Logistics",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "EM127",
    name: "Tiana Aminoff",
    email: "Tiana@gmail.com",
    phone: "+91 9381406724",
    role: "Warehouse",
    department: "Sales",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function Employeetable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">
              <Checkbox />
            </th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Profile</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Name</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">ID</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Email</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Phone</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Role</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Department</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Access Permission</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm">Status</th>
            <th className="text-left p-3 md:p-4 font-medium text-gray-600 text-sm"></th>
          </tr>
        </thead>
        <tbody>
          {employeeData.map((employee, index) => (
            <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-3 md:p-4">
                <Checkbox />
              </td>
              <td className="p-3 md:p-4">
                <img
                  src={employee.avatar || "/placeholder.svg"}
                  alt={employee.name}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                />
              </td>
              <td className="p-3 md:p-4 font-medium text-gray-900 text-sm">{employee.name}</td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">{employee.id}</td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">{employee.email}</td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">{employee.phone}</td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">{employee.role}</td>
              <td className="p-3 md:p-4 text-gray-600 text-sm">{employee.department}</td>
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
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    employee.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {employee.status}
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

      <div className="p-3 md:p-4 text-sm text-gray-500 border-t border-gray-200">Showing 1-5 of 32 products</div>
    </div>
  )
}
