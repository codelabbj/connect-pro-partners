import React from "react"

type StatCardProps = {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: { value: number; isPositive: boolean }
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-card rounded-lg shadow p-6 flex flex-col space-y-2">
    <div className="flex items-center space-x-2">
      <Icon className="h-6 w-6 text-primary" />
      <span className="text-sm font-medium text-muted-foreground">{title}</span>
    </div>
    <div className="text-2xl font-bold">{value}</div>
    {trend && (
      <div className={`text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
        {trend.isPositive ? "▲" : "▼"} {trend.value}%
      </div>
    )}
  </div>
)