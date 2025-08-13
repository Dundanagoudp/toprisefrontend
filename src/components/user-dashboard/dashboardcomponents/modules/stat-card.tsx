import type React from "react"
import { Card } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  color: string
  className?: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color, className = "" }) => {
  return (
    <Card className={`p-4 bg-white border border-neutral-200 rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="b4 text-neutral-600 mb-1">{title}</p>
          <p className="h6 text-neutral-1000 font-bold">{value}</p>
        </div>
        <div className="w-8 h-8 rounded-md flex-shrink-0" style={{ backgroundColor: color }} />
      </div>
    </Card>
  )
}

export default StatCard
