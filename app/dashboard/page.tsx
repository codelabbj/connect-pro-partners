"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ChartContainer } from "@/components/ui/chart"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { useRouter } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClipboardList, Users, KeyRound, Bell, Clock, TrendingUp, Loader, ServerCrash } from "lucide-react";
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"

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
  const [authError, setAuthError] = useState("")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showOnlyActiveUsers, setShowOnlyActiveUsers] = useState(false)
  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [transactionStats, setTransactionStats] = useState<any>(null);
  const [transactionStatsLoading, setTransactionStatsLoading] = useState(false);
  const [transactionStatsError, setTransactionStatsError] = useState("");

  const [systemEvents, setSystemEvents] = useState<any[]>([]);
  const [systemEventsLoading, setSystemEventsLoading] = useState(false);
  const [systemEventsError, setSystemEventsError] = useState("");

  const apiFetch = useApi();
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    setAuthError("");
    setShowAuthModal(false);
    try {
      const data = await apiFetch(`${baseUrl}api/auth/admin/notifications/stats/`);
      setStats(data);
      toast({
        title: t("dashboard.success"),
        description: t("dashboard.statsLoadedSuccessfully"),
      });
    } catch (err: any) {
      let backendError = extractErrorMessages(err) || t("dashboard.failedToLoadStats");
      // Detect authentication error (401 or token error)
      if (
        err?.code === 'token_not_valid' ||
        err?.status === 401 ||
        (typeof backendError === 'string' && backendError.toLowerCase().includes('token'))
      ) {
        setAuthError(backendError);
        setShowAuthModal(true);
        setLoading(false);
        return;
      }
      setError(backendError);
      toast({
        title: t("dashboard.failedToLoadStats"),
        description: backendError,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary data
  useEffect(() => {
    const fetchSummary = async () => {
      setSummaryLoading(true);
      setSummaryError("");
      try {
        const res = await apiFetch(`${baseUrl}api/payments/dashboard/summary/`);
        setSummary(res);
      } catch (err: any) {
        setSummaryError("Failed to load payment summary");
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, [apiFetch, baseUrl]);

  // Fetch transaction stats
  useEffect(() => {
    const fetchTransactionStats = async () => {
      setTransactionStatsLoading(true);
      setTransactionStatsError("");
      try {
        const res = await apiFetch(`${baseUrl}api/payments/stats/transactions/`);
        setTransactionStats(res);
      } catch (err: any) {
        setTransactionStatsError("Failed to load transaction stats");
      } finally {
        setTransactionStatsLoading(false);
      }
    };
    fetchTransactionStats();
  }, [apiFetch, baseUrl]);

  // Fetch system events
  useEffect(() => {
    const fetchSystemEvents = async () => {
      setSystemEventsLoading(true);
      setSystemEventsError("");
      try {
        const res = await apiFetch(`${baseUrl}api/payments/system-events/`);
        setSystemEvents(res.results || []);
      } catch (err: any) {
        setSystemEventsError("Failed to load system events");
      } finally {
        setSystemEventsLoading(false);
      }
    };
    fetchSystemEvents();
  }, [apiFetch, baseUrl]);

  useEffect(() => {
    fetchStats();
    
  // }, [fetchStats, fetchSystemEvents, fetchSummary, fetchTransactionStats]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiFetch, baseUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-lg font-semibold">{t("common.loading")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={fetchStats}
        variant="full"
        showDismiss={false}
      />
    );
  }

  if (!stats) {
    // Should not happen, but just in case
    return null;
  }

  return (
    <>
      {/* Auth Error Modal */}
      <Dialog open={showAuthModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dashboard.authError")}</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-red-600">{authError}</div>
          <DialogFooter>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
              onClick={() => { setShowAuthModal(false); router.push("/"); }}
            >
              {t("common.ok")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Main Dashboard Content */}
    <div className="space-y-10 px-4 py-8 max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1">{t("dashboard.adminDashboard")}</h1>
        <p className="text-muted-foreground text-lg">{t("dashboard.liveOverview")}</p>
      </div>

        {/* All Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Stats Filter */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-center gap-4 mb-2">
            <Switch
              id="active-users-toggle"
              checked={showOnlyActiveUsers}
              onCheckedChange={setShowOnlyActiveUsers}
            />
            <label htmlFor="active-users-toggle" className="text-sm font-medium">
              {t("dashboard.showOnlyActiveUsers")}
            </label>
          </div>
          {/* Task Stats */}
          <Card className="flex flex-col items-center hover:shadow-lg transition-shadow border-blue-100 dark:border-blue-900">
            <CardHeader className="flex flex-row items-center gap-3 w-full">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <ClipboardList className="text-blue-600 dark:text-blue-300 w-6 h-6" />
              </div>
              <CardTitle className="text-blue-700 dark:text-blue-200 text-lg">{t("dashboard.taskStats")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 w-full">
              <div className="flex justify-between items-center"><span>{t("dashboard.activeTasks")}</span><Badge className="bg-blue-600 text-white">{stats.task_stats.active}</Badge></div>
              <div className="flex justify-between items-center"><span>{t("dashboard.scheduledTasks")}</span><Badge className="bg-blue-400 text-white">{stats.task_stats.scheduled}</Badge></div>
              <div className="flex justify-between items-center"><span>{t("dashboard.reservedTasks")}</span><Badge className="bg-blue-300 text-white">{stats.task_stats.reserved}</Badge></div>
            </CardContent>
          </Card>
          {/* User Stats */}
          <Card className="flex flex-col items-center hover:shadow-lg transition-shadow border-green-100 dark:border-green-900">
            <CardHeader className="flex flex-row items-center gap-3 w-full">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                <Users className="text-green-600 dark:text-green-300 w-6 h-6" />
              </div>
              <CardTitle className="text-green-700 dark:text-green-200 text-lg">{t("dashboard.userStats")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 w-full">
              {showOnlyActiveUsers ? (
                <div className="flex justify-between items-center"><span>{t("dashboard.activeUsers")}</span><Badge className="bg-green-500 text-white">{stats.user_stats.active_users}</Badge></div>
              ) : (
                <>
                  <div className="flex justify-between items-center"><span>{t("dashboard.totalUsers")}</span><Badge className="bg-green-600 text-white">{stats.user_stats.total_users}</Badge></div>
                  <div className="flex justify-between items-center"><span>{t("dashboard.activeUsers")}</span><Badge className="bg-green-500 text-white">{stats.user_stats.active_users}</Badge></div>
                  <div className="flex justify-between items-center"><span>{t("dashboard.pendingUsers")}</span><Badge className="bg-yellow-500 text-white">{stats.user_stats.pending_users}</Badge></div>
                  <div className="flex justify-between items-center"><span>{t("dashboard.verifiedUsers")}</span><Badge className="bg-green-400 text-white">{stats.user_stats.verified_users}</Badge></div>
                  <div className="flex justify-between items-center"><span>{t("dashboard.usersRegisteredToday")}</span><Badge className="bg-blue-500 text-white">{stats.user_stats.users_registered_today}</Badge></div>
                  <div className="flex justify-between items-center"><span>{t("dashboard.usersRegisteredWeek")}</span><Badge className="bg-blue-400 text-white">{stats.user_stats.users_registered_week}</Badge></div>
                </>
              )}
            </CardContent>
          </Card>
          {/* Code Stats */}
          <Card className="flex flex-col items-center hover:shadow-lg transition-shadow border-yellow-100 dark:border-yellow-900">
            <CardHeader className="flex flex-row items-center gap-3 w-full">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-full">
                <KeyRound className="text-yellow-600 dark:text-yellow-300 w-6 h-6" />
              </div>
              <CardTitle className="text-yellow-700 dark:text-yellow-200 text-lg">{t("dashboard.codeStats")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 w-full">
              <div className="flex justify-between items-center"><span>{t("dashboard.pendingPasswordReset")}</span><Badge className="bg-yellow-600 text-white">{stats.code_stats.pending_password_reset}</Badge></div>
              <div className="flex justify-between items-center"><span>{t("dashboard.pendingEmailVerification")}</span><Badge className="bg-yellow-500 text-white">{stats.code_stats.pending_email_verification}</Badge></div>
              <div className="flex justify-between items-center"><span>{t("dashboard.pendingPhoneVerification")}</span><Badge className="bg-yellow-400 text-white">{stats.code_stats.pending_phone_verification}</Badge></div>
            </CardContent>
          </Card>
          {/* Notification Info */}
          <Card className="flex flex-col items-center hover:shadow-lg transition-shadow border-purple-100 dark:border-purple-900 col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center gap-3 w-full">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                <Bell className="text-purple-700 dark:text-purple-200 w-6 h-6" />
              </div>
              <CardTitle className="text-purple-700 dark:text-purple-200 text-lg">{t("dashboard.notificationInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 w-full">
              <div className="flex justify-between items-center"><span>{t("dashboard.emailService")}</span><span className="font-bold">{stats.notification_info.email_service}</span></div>
              <div className="flex justify-between items-center"><span>{t("dashboard.smsService")}</span><span className="font-bold">{stats.notification_info.sms_service}</span></div>
              <div className="flex justify-between items-center"><span>{t("dashboard.asyncEnabled")}</span><Badge className={stats.notification_info.async_enabled ? "bg-green-600 text-white" : "bg-red-600 text-white"}>{stats.notification_info.async_enabled ? t("dashboard.enabled") : t("dashboard.disabled")}</Badge></div>
              <div className="flex justify-between items-center"><span>{t("dashboard.loggingEnabled")}</span><Badge className={stats.notification_info.logging_enabled ? "bg-green-600 text-white" : "bg-red-600 text-white"}>{stats.notification_info.logging_enabled ? t("dashboard.enabled") : t("dashboard.disabled")}</Badge></div>
            </CardContent>
          </Card>
          {/* Timestamp */}
          <Card className="flex flex-col items-center hover:shadow-lg transition-shadow border-gray-100 dark:border-gray-900 col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center gap-3 w-full">
              <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-full">
                <Clock className="text-gray-700 dark:text-gray-200 w-6 h-6" />
              </div>
              <CardTitle className="text-gray-700 dark:text-gray-200 text-lg">{t("dashboard.timestamp")}</CardTitle>
            </CardHeader>
            <CardContent className="w-full text-center font-mono text-sm text-gray-500 dark:text-gray-400">
              {stats.timestamp}
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary Card */}
        <div className="mb-8">
          <Card className="flex flex-col items-center hover:shadow-lg transition-shadow border-indigo-100 dark:border-indigo-900">
            <CardHeader className="flex flex-row items-center gap-3 w-full">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full">
                <TrendingUp className="text-indigo-700 dark:text-indigo-200 w-6 h-6" />
              </div>
              <CardTitle className="text-indigo-700 dark:text-indigo-200 text-lg">
                {t("dashboard.paymentSummary") || "Payment Summary"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 w-full">
              {summaryLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader className="animate-spin mr-2" /> {t("common.loading")}
                </div>
              ) : summaryError ? (
                <div className="text-red-600 text-center py-2">{summaryError}</div>
              ) : summary ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">{t("dashboard.todayTransactions") || "Today's Transactions"}:</span>
                    <span className="ml-2">{summary.today_transactions}</span>
                  </div>
                  <div>
                    <span className="font-medium">{t("dashboard.todayCompleted") || "Today's Completed"}:</span>
                    <span className="ml-2">{summary.today_completed}</span>
                  </div>
                  <div>
                    <span className="font-medium">{t("dashboard.todayRevenue") || "Today's Revenue"}:</span>
                    <span className="ml-2">{summary.today_revenue}</span>
                  </div>
                  <div>
                    <span className="font-medium">{t("dashboard.todaySuccessRate") || "Today's Success Rate"}:</span>
                    <span className="ml-2">{summary.today_success_rate}%</span>
                  </div>
                  <div>
                    <span className="font-medium">{t("dashboard.onlineDevices") || "Online Devices"}:</span>
                    <span className="ml-2">{summary.online_devices}</span>
                  </div>
                  <div>
                    <span className="font-medium">{t("dashboard.pendingTransactions") || "Pending Transactions"}:</span>
                    <span className="ml-2">{summary.pending_transactions}</span>
                  </div>
                  <div className="col-span-2 text-right text-xs text-gray-500 mt-2">
                    {t("dashboard.lastUpdated") || "Last Updated"}:{" "}
                    {summary.last_updated ? new Date(summary.last_updated).toLocaleString() : "-"}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-2">{t("dashboard.noData") || "No data"}</div>
              )}
            </CardContent>
          </Card>
        </div>

      {/* Transaction Stats Card */}
      <div className="mb-8">
        <Card className="flex flex-col items-center hover:shadow-lg transition-shadow border-pink-100 dark:border-pink-900">
          <CardHeader className="flex flex-row items-center gap-3 w-full">
            <div className="bg-pink-100 dark:bg-pink-900 p-2 rounded-full">
              <TrendingUp className="text-pink-700 dark:text-pink-200 w-6 h-6" />
            </div>
            <CardTitle className="text-pink-700 dark:text-pink-200 text-lg">
              {t("dashboard.transactionStats") || "Transaction Stats"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 w-full">
            {transactionStatsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="animate-spin mr-2" /> {t("common.loading")}
              </div>
            ) : transactionStatsError ? (
              <div className="text-red-600 text-center py-2">{transactionStatsError}</div>
            ) : transactionStats ? (
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-medium">{t("dashboard.totalTransactions") || "Total Transactions"}:</span> <span className="ml-2">{transactionStats.total_transactions}</span></div>
                <div><span className="font-medium">{t("dashboard.completedTransactions") || "Completed"}:</span> <span className="ml-2">{transactionStats.completed_transactions}</span></div>
                <div><span className="font-medium">{t("dashboard.failedTransactions") || "Failed"}:</span> <span className="ml-2">{transactionStats.failed_transactions}</span></div>
                <div><span className="font-medium">{t("dashboard.pendingTransactions") || "Pending"}:</span> <span className="ml-2">{transactionStats.pending_transactions}</span></div>
                <div><span className="font-medium">{t("dashboard.processingTransactions") || "Processing"}:</span> <span className="ml-2">{transactionStats.processing_transactions}</span></div>
                <div><span className="font-medium">{t("dashboard.successRate") || "Success Rate"}:</span> <span className="ml-2">{transactionStats.success_rate}%</span></div>
                <div><span className="font-medium">{t("dashboard.avgProcessingTime") || "Avg. Processing Time"}:</span> <span className="ml-2">{transactionStats.avg_processing_time ?? "-"}</span></div>
                <div><span className="font-medium">{t("dashboard.totalAmount") || "Total Amount"}:</span> <span className="ml-2">{transactionStats.total_amount ?? "-"}</span></div>
                <div><span className="font-medium">{t("dashboard.depositsCount") || "Deposits"}:</span> <span className="ml-2">{transactionStats.deposits_count}</span></div>
                <div><span className="font-medium">{t("dashboard.withdrawalsCount") || "Withdrawals"}:</span> <span className="ml-2">{transactionStats.withdrawals_count}</span></div>
                <div><span className="font-medium">{t("dashboard.depositsAmount") || "Deposits Amount"}:</span> <span className="ml-2">{transactionStats.deposits_amount ?? "-"}</span></div>
                <div><span className="font-medium">{t("dashboard.withdrawalsAmount") || "Withdrawals Amount"}:</span> <span className="ml-2">{transactionStats.withdrawals_amount ?? "-"}</span></div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-2">{t("dashboard.noData") || "No data"}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Events Card */}
      <div className="mb-8">
        <Card className="flex flex-col items-center hover:shadow-lg transition-shadow border-cyan-100 dark:border-cyan-900">
          <CardHeader className="flex flex-row items-center gap-3 w-full">
            <div className="bg-cyan-100 dark:bg-cyan-900 p-2 rounded-full">
              <ServerCrash className="text-cyan-700 dark:text-cyan-200 w-6 h-6" />
            </div>
            <CardTitle className="text-cyan-700 dark:text-cyan-200 text-lg">
              {t("dashboard.systemEvents") || "System Events"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 w-full">
            {systemEventsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="animate-spin mr-2" /> {t("common.loading")}
              </div>
            ) : systemEventsError ? (
              <div className="text-red-600 text-center py-2">{systemEventsError}</div>
            ) : systemEvents && systemEvents.length > 0 ? (
              <div className="divide-y divide-cyan-100 dark:divide-cyan-800">
                {systemEvents.slice(0, 5).map((event, idx) => (
                  <div key={event.uid} className="py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{event.event_type.replace(/_/g, " ").toUpperCase()}</span>
                      <span className="text-xs text-gray-400">{new Date(event.created_at).toLocaleString()}</span>
                      <Badge className="ml-2" variant="outline">{event.level}</Badge>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-200">{event.description}</div>
                    {event.data && (
                      <pre className="bg-cyan-50 dark:bg-cyan-950 rounded p-2 mt-1 text-xs overflow-x-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-2">{t("dashboard.noEvents") || "No recent events"}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trends Chart & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trends Chart */}
        {/* <div className="col-span-2 bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col">
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
        </div> */}
        {/* Live Activity Feed */}
        {/* <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col h-full">
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
        </div> */}
      </div>
    </div>
    </>
  )
}
