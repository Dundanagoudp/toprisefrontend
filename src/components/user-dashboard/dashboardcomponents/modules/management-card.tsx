import type React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Users, UserCheck, UserX, UserMinus } from "lucide-react"

interface ManagementCardProps {
  title: string
  stats: Array<{
    label: string
    value: string
    color: string
    icon?: string
  }>
  className?: string
}

const ManagementCard: React.FC<ManagementCardProps> = ({ title, stats, className = "" }) => {
  const getIcon = (label: string) => {
    if (label.includes("Total") || label.includes("Top")) return Users
    if (label.includes("Active")) return UserCheck
    if (label.includes("Suspend")) return UserMinus
    if (label.includes("Deactivated")) return UserX
    return Users
  }

  return (
    <Card className={`p-5 bg-white border border-neutral-200 rounded-lg overflow-hidden ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4 text-gray-600" />
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = getIcon(stat.label)
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: stat.color }}
                >
                  <IconComponent className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-600">{stat.label}</span>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <div className="h-1 w-full rounded-full" style={{ backgroundColor: stat.color }} />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default ManagementCard
