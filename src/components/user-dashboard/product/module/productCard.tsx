"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProductCardProps {
  title: string
  description: string
  data: { label: string; value: string | React.ReactNode }[]
  children?: React.ReactNode
}

export function Productcard({ title, description, data, children }: ProductCardProps) {
  return (
    <Card className="border border-gray-200 rounded-lg shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
        <CardDescription className="text-sm text-gray-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex flex-row items-center justify-between gap-2 sm:block sm:space-y-1">
              <div className="text-sm text-gray-600 flex-shrink-0">{item.label}</div>
              <div className="text-sm font-medium text-gray-900 text-right sm:text-left break-words">{item.value}</div>
            </div>
          ))}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}
