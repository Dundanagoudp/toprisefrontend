import type React from "react"
import ChartCard from "./chart-card"
import { Users, UserCheck, UserX, UserMinus } from "lucide-react"

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
    <ChartCard title={title} className={`p-3 sm:p-5 ${className}`} contentClassName="pt-1">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {stats.map((stat, index) => {
          const IconComponent = getIcon(stat.label)
          return (
            <div key={index} className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <div
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: stat.color }}
                >
                  <IconComponent className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                </div>
                <span className="text-xs sm:text-sm text-gray-600 leading-tight">{stat.label}</span>
              </div>
              <div className="space-y-1">
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</p>
                <div className="h-1 w-full rounded-full" style={{ backgroundColor: stat.color }} />
              </div>
            </div>
          )
        })}
      </div>
    </ChartCard>
  )
}

export default ManagementCard
