"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ChartContainer } from "@/components/ui/chart"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { useRouter } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

// Mock data for chart and activity feed
const mockChartData = [
  { time: "09:00", users: 10, tasks: 5 },
  { time: "10:00", users: 15, tasks: 8 },
  { time: "11:00", users: 20, tasks: 12 },
  { time: "12:00", users: 25, tasks: 15 },
  { time: "13:00", users: 30, tasks: 18 },
  { time: "14:00", users: 28, tasks: 16 },
  { time: "15:00", users: 35, tasks: 20 },
]
const mockFeed = [
  { time: "2 min ago", message: "User JohnDoe registered." },
  { time: "5 min ago", message: "Task #123 completed." },
  { time: "10 min ago", message: "User JaneSmith verified email." },
  { time: "15 min ago", message: "Task #124 scheduled." },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const apiFetch = useApi();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    setLoading(true)
    apiFetch(`${baseUrl}api/auth/admin/notifications/stats/`)
      .then(data => setStats(data))
      .catch((err) => {
        setError(t("dashboard.failedToLoadStats"))
        if (typeof window !== 'undefined') {
          router.push("/")
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-10 px-4 py-8 max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1">{t("dashboard.adminDashboard")}</h1>
        <p className="text-muted-foreground text-lg">{t("dashboard.liveOverview")}</p>
      </div>

      {/* Key Metrics Row */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div className="flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900 rounded-lg py-6 shadow">
            <span className="text-lg text-blue-800 dark:text-blue-200 font-semibold">{t("dashboard.activeUsers")}</span>
            <span className="text-4xl font-bold text-blue-700 dark:text-blue-100">{stats.user_stats.active_users}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-green-50 dark:bg-green-900 rounded-lg py-6 shadow">
            <span className="text-lg text-green-800 dark:text-green-200 font-semibold">{t("dashboard.activeTasks")}</span>
            <span className="text-4xl font-bold text-green-700 dark:text-green-100">{stats.task_stats.active}</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-yellow-50 dark:bg-yellow-900 rounded-lg py-6 shadow">
            <span className="text-lg text-yellow-800 dark:text-yellow-200 font-semibold">{t("dashboard.pendingCodes")}</span>
            <span className="text-4xl font-bold text-yellow-700 dark:text-yellow-100">{stats.code_stats.pending_email_verification + stats.code_stats.pending_password_reset + stats.code_stats.pending_phone_verification}</span>
          </div>
        </div>
      )}

      {/* Status Bar */}
      {stats && (
        <div className="flex flex-wrap gap-4 mb-4">
          <Badge variant={stats.notification_info.async_enabled ? "default" : "destructive"}>
            {t("dashboard.async")}: {stats.notification_info.async_enabled ? t("dashboard.enabled") : t("dashboard.disabled")}
          </Badge>
          <Badge variant={stats.notification_info.logging_enabled ? "default" : "destructive"}>
            {t("dashboard.logging")}: {stats.notification_info.logging_enabled ? t("dashboard.enabled") : t("dashboard.disabled")}
          </Badge>
          <Badge variant="outline">{t("dashboard.email")}: {stats.notification_info.email_service}</Badge>
          <Badge variant="outline">{t("dashboard.sms")}: {stats.notification_info.sms_service}</Badge>
        </div>
      )}

      {/* Trends Chart & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trends Chart */}
        <div className="col-span-2 bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">{t("dashboard.userTaskActivity")}</h2>
          <ChartContainer
            config={{ users: { color: '#2563eb', label: t("dashboard.users") }, tasks: { color: '#16a34a', label: t("dashboard.tasks") } }}
            className="h-72"
          >
            <ResponsiveContainer>
              <LineChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="time" stroke="#8884d8" />
                <YAxis stroke="#8884d8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="tasks" stroke="#16a34a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        {/* Live Activity Feed */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">{t("dashboard.liveActivityFeed")}</h2>
          <div className="flex-1 overflow-y-auto max-h-72">
            <Table>
              <TableBody>
                {mockFeed.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="w-24 text-muted-foreground">{item.time}</TableCell>
                    <TableCell className="text-gray-900 dark:text-gray-100">{item.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
