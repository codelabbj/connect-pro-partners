import React from "react"

type StatCardProps = {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: { value: string | number; isPositive: boolean }
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-card rounded-lg shadow p-3 sm:p-4 lg:p-6 flex flex-col space-y-2">
    <div className="flex items-center space-x-2">
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0" />
      <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</span>
    </div>
    <div className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{value}</div>
    {trend && (
      <div className={`text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
        {trend.isPositive ? "▲" : "▼"} {trend.value}
      </div>
    )}
  </div>
)