"use client"

import type React from "react"
import { Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart, Tooltip } from "recharts"

interface LineChartDatum {
  name: string
  value1: number
  orders?: number
  value2?: number
  value3?: number
  amount1?: number
  amount2?: number
  amount3?: number
}

interface LineChartProps {
  data: Array<LineChartDatum>
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const point = payload[0]?.payload as LineChartDatum
    return (
      <div className="rounded-md border bg-white p-2 shadow-sm text-xs text-neutral-800">
        <div className="font-semibold mb-1">{label}</div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: "#3B82F6" }} />
            <span>Revenue: ₹{point.value1.toLocaleString()}</span>
          </div>
          {typeof point.orders === "number" && (
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: "#10B981" }} />
              <span>Orders: {point.orders}</span>
            </div>
          )}
          {typeof point.value2 === "number" && (
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: "#EF4444" }} />
              <span>Previous Orders: {point.value2}</span>
            </div>
          )}
        </div>
      </div>
    )
  }
  return null
}

const CustomLineChart: React.FC<LineChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6B7280" }} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "#6B7280" }}
          domain={[0, "dataMax + 20"]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="value1" stroke="#3B82F6" strokeWidth={2} fill="url(#colorBlue)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default CustomLineChart
