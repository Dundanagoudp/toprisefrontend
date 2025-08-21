"use client"

import type React from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface UserCountsBarProps {
  data: Array<{ name: string; value: number }>
}

const UserCountsBar: React.FC<UserCountsBarProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6B7280" }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#6B7280" }} />
        <Tooltip cursor={{ fill: "#F3F4F6" }} />
        <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default UserCountsBar

