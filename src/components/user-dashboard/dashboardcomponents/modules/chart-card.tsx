import type React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, MoreHorizontal, TrendingUp } from "lucide-react"

interface ChartCardProps {
  title: string
  value?: string
  change?: string
  changeType?: "positive" | "negative"
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  value,
  change,
  changeType = "positive",
  children,
  className = "",
  contentClassName = "",
}) => {
  return (
    <Card className={`p-3 bg-white border border-neutral-200 rounded-lg overflow-hidden  ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
          {value && (
            <div className="flex items-center gap-1">
              <p className="text-lg font-bold text-neutral-900">{value}</p>
              {change && (
                <div
                  className={`flex items-center gap-0.5 ${
                    changeType === "positive" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs">{change}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Download className="h-3 w-3 text-neutral-600" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-3 w-3 text-neutral-600" />
          </Button>
        </div>
      </div>

      {/* Chart/Content */}
      <div className={`w-full ${contentClassName || "h-20"}`}>{children}</div>
    </Card>
  )
}

export default ChartCard
