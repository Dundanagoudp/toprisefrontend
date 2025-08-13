"use client"

import type React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface DonutChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
  centerValue?: string
  centerLabel?: string
}

const DonutChart: React.FC<DonutChartProps> = ({ data, centerValue, centerLabel }) => {
  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
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
