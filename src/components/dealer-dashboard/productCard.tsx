import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProductCardProps {
  title: string
  description: string
  data?: { label: string; value: string | number | boolean }[]
  children?: React.ReactNode
}

export function Productcard({ title, description, data, children }: ProductCardProps) {
  return (
    <Card className="shadow-sm rounded-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 font-sans">{title}</CardTitle>
        <p className="text-sm text-gray-500 font-sans">{description}</p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {data?.map((item, index) => (
          <div key={index} className="flex flex-col">
            <span className="text-sm text-gray-600 font-sans">{item.label}</span>
            <span className="text-base font-medium text-gray-900 font-sans">{item.value}</span>
          </div>
        ))}
        {children}
      </CardContent>
    </Card>
  )
}
