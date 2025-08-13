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
  size?: "sm" | "md"
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  value,
  change,
  changeType = "positive",
  children,
  className = "",
  contentClassName = "",
  size = "md",
}) => {
  return (
    <Card className={`${size === "sm" ? "p-4" : "p-5"} bg-white border border-neutral-200 rounded-lg overflow-hidden ${className}`}>
      <div className={`flex items-center justify-between ${size === "sm" ? "mb-2" : "mb-4"}`}>
        <div>
          <h3 className="b2 font-semibold text-neutral-1000 mb-1">{title}</h3>
          {value && (
            <div className="flex items-center gap-2">
              <p className="h6 text-neutral-1000">{value}</p>
              {change && (
                <div
                  className={`flex items-center gap-1 ${changeType === "positive" ? "text-green-200" : "text-red-200"}`}
                >
                  <TrendingUp className={`${size === "sm" ? "h-3 w-3" : "h-3 w-3"}`} />
                  <span className="b4">{change}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className={`${size === "sm" ? "h-7 w-7" : "h-8 w-8"} p-0`}>
            <Download className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} text-neutral-600`} />
          </Button>
          <Button variant="ghost" size="sm" className={`${size === "sm" ? "h-7 w-7" : "h-8 w-8"} p-0`}>
            <MoreHorizontal className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} text-neutral-600`} />
          </Button>
        </div>
      </div>

      <div className={`w-full ${contentClassName || (size === "sm" ? "h-28" : "h-48")}`}>{children}</div>
    </Card>
  )
}

export default ChartCard
