"use client"

import type React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface DonutChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
  centerValue?: string
  centerLabel?: string
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0]
    const name: string = item?.name ?? item?.payload?.name
    const value: number = item?.value ?? item?.payload?.value
    return (
      <div className="rounded-md border bg-white/95 px-3 py-2 text-xs shadow-md">
        <div className="font-medium">{name}</div>
        <div className="text-neutral-700">{value}</div>
      </div>
    )
  }
  return null
}

const DonutChart: React.FC<DonutChartProps> = ({ data, centerValue, centerLabel }) => {
  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {centerValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="h5 text-neutral-1000 font-bold">{centerValue}</p>
            {centerLabel && <p className="b4 text-neutral-600 uppercase tracking-wide">{centerLabel}</p>}
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="px-2 py-1 rounded text-white text-xs font-medium"
            style={{ backgroundColor: item.color }}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DonutChart
