"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, CreditCard, DollarSign, TrendingUp, TrendingDown, Wallet, RefreshCw } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { StatCard } from "@/components/ui/stat-card"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

const chartConfig = {
  deposits: { color: "#16a34a", label: "Dépôts" },
  withdrawals: { color: "#dc2626", label: "Retraits" },
  approved: { color: "#2563eb", label: "Approuvé" },
  rejected: { color: "#dc2626", label: "Rejeté" },
  pending: { color: "#f59e0b", label: "En attente" },
}

const NETWORK_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#8b5cf6"]

function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload) return null
  return (
    <div className="bg-white dark:bg-gray-900 p-2 rounded shadow text-xs border">
      <div className="font-semibold">{label}</div>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} style={{ color: entry.color || entry.fill }}>
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { t } = useLanguage()
  const apiFetch = useApi()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState<any>(null)
  const [userStats, setUserStats] = useState<any>(null)
  const [rechargeStats, setRechargeStats] = useState<any>(null)
  
  // Account data state (from UserPaymentPage)
  const [accountData, setAccountData] = useState<any>(null)
  const [accountLoading, setAccountLoading] = useState(true)
  const [accountError, setAccountError] = useState("")

  // Fetch account data (from UserPaymentPage)
  const fetchAccountData = async () => {
    setAccountLoading(true)
    setAccountError("")
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/account/`
      const data = await apiFetch(endpoint)
      setAccountData(data)
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setAccountError(errorMessage)
      toast({ title: t("payment.failedToLoadAccount"), description: errorMessage, variant: "destructive" })
    } finally {
      setAccountLoading(false)
    }
  }

  const refreshAccountData = async () => {
    setAccountLoading(true)
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/account/`
      const data = await apiFetch(endpoint)
      setAccountData(data)
      toast({ title: t("payment.accountRefreshed"), description: t("payment.accountDataUpdated") })
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      toast({ title: t("payment.refreshFailed"), description: errorMessage, variant: "destructive" })
    } finally {
      setAccountLoading(false)
    }
  }

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      setError("")
      try {
        const [dashboard, userStatsRes, rechargeStatsRes] = await Promise.all([
          apiFetch(`${baseUrl}api/payments/user/dashboard/`),
          apiFetch(`${baseUrl}api/payments/user/stats/`),
          apiFetch(`${baseUrl}api/payments/recharge-requests/stats/`),
        ])
        setStats(dashboard)
        setUserStats(userStatsRes)
        setRechargeStats(rechargeStatsRes)
      } catch (err: any) {
        setError("Impossible de charger les données du tableau de bord.")
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
    fetchAccountData() // Fetch account data
  }, [apiFetch, baseUrl])

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre plateforme</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <ErrorDisplay error={error} variant="full" />
      </div>
    )
  }

  // Prepare stat values from real API data
  const totalUsers = stats?.account?.user_name ? 1 : 0
  const totalTransactions = userStats?.total_transactions ?? 0
  const totalApprovedRecharges = rechargeStats?.total_approved_amount ?? 0
  const totalRecharged = parseFloat(stats?.account?.total_recharged ?? "0")

  // Create charts data from API responses
  
  // Transaction comparison chart data
  const transactionComparisonData = [
    {
      name: "Dépôts",
      count: userStats?.deposits?.count ?? 0,
      amount: userStats?.deposits?.total_amount ?? 0,
      completed: userStats?.deposits?.completed_count ?? 0,
    },
    {
      name: "Retraits", 
      count: userStats?.withdrawals?.count ?? 0,
      amount: userStats?.withdrawals?.total_amount ?? 0,
      completed: userStats?.withdrawals?.completed_count ?? 0,
    }
  ]

  // Transaction status distribution for pie chart
  const transactionStatusData = userStats?.by_status ? Object.entries(userStats.by_status).map(([key, value]: [string, any]) => ({
    name: value.name,
    value: value.count,
    key: key
  })).filter((item: any) => item.value > 0) : []

  // Recharge status distribution for pie chart
  const rechargeStatusData = rechargeStats?.by_status ? Object.entries(rechargeStats.by_status).map(([key, value]: [string, any]) => ({
    name: value.name,
    value: value.count,
    key: key
  })).filter((item: any) => item.value > 0) : []

  // Network distribution data
  const networkData = userStats?.by_network ? Object.entries(userStats.by_network).map(([network, data]: [string, any], index) => ({
    name: network,
    count: data.count,
    amount: data.amount,
    color: NETWORK_COLORS[index % NETWORK_COLORS.length]
  })) : []

  // Recent activity from recent_transactions with ALL transaction details
  type RecentTransaction = {
    uid: string;
    type: string;
    type_display: string;
    amount: string;
    formatted_amount: string;
    recipient_phone: string;
    recipient_name?: string;
    display_recipient_name?: string;
    network?: { 
      uid: string;
      nom: string; 
      code: string;
      country_name: string;
      country_code: string;
    };
    objet: string;
    status: string;
    status_display: string;
    reference: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
    processing_duration?: string;
    retry_count: number;
    max_retries: number;
    can_retry: boolean;
    error_message?: string;
    priority: number;
    fees?: string;
    balance_before?: string;
    balance_after?: string;
  };

  const recentActivity = stats?.recent_transactions?.slice(0, 6).map((txn: RecentTransaction) => ({
    ...txn,
    action:
      txn.type === "deposit"
        ? "Dépôt effectué"
        : txn.type === "withdrawal"
        ? "Retrait effectué"
        : "Transaction",
    user: stats.account.user_name,
    time: new Date(txn.created_at).toLocaleString("fr-FR", { 
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit", 
      minute: "2-digit" 
    }),
    networkInfo: txn.network,
  })) ?? []

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Vue d'ensemble de votre plateforme</p>
      </div>

      {/* Account Overview Section - From UserPaymentPage */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
              {t("payment.accountOverview") || "Account Overview"}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={refreshAccountData} disabled={accountLoading} className="w-full sm:w-auto">
              <RefreshCw className={`h-4 w-4 mr-2 ${accountLoading ? 'animate-spin' : ''}`} />
              {t("common.refresh") || "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {accountLoading ? (
            <div className="p-6 sm:p-8 text-center text-muted-foreground">{t("common.loading")}</div>
          ) : accountError ? (
            <ErrorDisplay
              error={accountError}
              onRetry={refreshAccountData}
              variant="full"
              showDismiss={false}
            />
          ) : accountData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-blue-600 truncate">{t("payment.currentBalance") || "Current Balance"}</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900 truncate">{accountData.formatted_balance}</p>
                  </div>
                  <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0 ml-2" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-green-600 truncate">{t("payment.totalRecharged") || "Total Recharged"}</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900 truncate">{accountData.total_recharged} FCFA</p>
                  </div>
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0 ml-2" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-purple-600 truncate">{t("payment.totalDeposited") || "Total Deposited"}</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900 truncate">{accountData.total_deposited} FCFA</p>
                  </div>
                  <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0 ml-2" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-orange-600 truncate">{t("payment.totalWithdrawn") || "Total Withdrawn"}</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-900 truncate">{accountData.total_withdrawn} FCFA</p>
                  </div>
                  <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0 ml-2" />
                </div>
              </div>
            </div>
          ) : null}

          {accountData && (
            <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-xs sm:text-sm font-medium">{t("payment.accountStatus") || "Account Status"}</span>
                <Badge variant={accountData.is_active ? "default" : "destructive"}>
                  {accountData.is_active ? (t("payment.active") || "Active") : (t("payment.inactive") || "Inactive")}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-xs sm:text-sm font-medium">{t("payment.accountFrozen") || "Account Frozen"}</span>
                <Badge variant={accountData.is_frozen ? "destructive" : "default"}>
                  {accountData.is_frozen ? (t("common.yes") || "Yes") : (t("common.no") || "No")}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg sm:col-span-2 lg:col-span-1">
                <span className="text-xs sm:text-sm font-medium">{t("payment.utilizationRate") || "Utilization Rate"}</span>
                <span className="font-semibold">{(accountData.utilization_rate * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Utilisateurs"
          value={totalUsers.toLocaleString()}
          icon={Users}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Total Transactions"
          value={totalTransactions.toLocaleString()}
          icon={CreditCard}
          trend={{ value: userStats?.period_days ? `${userStats.period_days} jours` : "30 jours", isPositive: true }}
        />
        <StatCard
          title="Total Demandes Recharge"
          value={rechargeStats?.total_requests?.toLocaleString() ?? "0"}
          icon={DollarSign}
          trend={{ 
            value: `${(rechargeStats?.month_stats?.approval_rate ?? 0).toFixed(2)}% approuvé`, 
            isPositive: rechargeStats?.month_stats?.approval_rate > 50 
          }}
        />
       
        <StatCard
          title="Total Rechargé"
          value={totalRecharged.toLocaleString() + " FCFA"}
          icon={TrendingUp}
          trend={{ value: `Solde: ${stats?.account?.formatted_balance}`, isPositive: parseFloat(stats?.account?.balance ?? "0") > 0 }}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Transaction Types with Completed Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Transactions par Type</CardTitle>
            <CardDescription className="text-sm sm:text-base">Dépôts vs Retraits avec statuts ({userStats?.period_days || 30} derniers jours)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={transactionComparisonData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="count" 
                  fill={chartConfig.deposits.color} 
                  name="Total transactions" 
                />
                <Bar 
                  dataKey="completed" 
                  fill={chartConfig.approved.color} 
                  name="Transactions terminées" 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction Status Distribution */}
        {transactionStatusData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Statut des Transactions</CardTitle>
              <CardDescription className="text-sm sm:text-base">Distribution par statut des transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                <PieChart>
                  <Pie
                    data={transactionStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={60}
                    className="sm:outerRadius={80}"
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {transactionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.key === 'completed' || entry.key === 'success' ? chartConfig.approved.color :
                        entry.key === 'failed' || entry.key === 'cancelled' ? chartConfig.rejected.color :
                        entry.key === 'pending' ? chartConfig.pending.color :
                        NETWORK_COLORS[index % NETWORK_COLORS.length]
                      } />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Network Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Répartition par Réseau</CardTitle>
            <CardDescription className="text-sm sm:text-base">Distribution des transactions par réseau</CardDescription>
          </CardHeader>
          <CardContent>
            {networkData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                <PieChart>
                  <Pie
                    data={networkData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name}: ${count}`}
                    outerRadius={60}
                    className="sm:outerRadius={80}"
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {networkData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] sm:h-[300px] text-muted-foreground text-sm sm:text-base">
                Aucune donnée réseau disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recharge Status Distribution */}
        {rechargeStatusData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Statut des Recharges</CardTitle>
              <CardDescription className="text-sm sm:text-base">Distribution par statut des demandes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                <PieChart>
                  <Pie
                    data={rechargeStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={60}
                    className="sm:outerRadius={80}"
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {rechargeStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.key === 'approved' ? chartConfig.approved.color :
                        entry.key === 'rejected' ? chartConfig.rejected.color :
                        chartConfig.pending.color
                      } />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Transaction Amounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Montants des Transactions</CardTitle>
            <CardDescription className="text-sm sm:text-base">Volumes financiers par type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <LineChart data={transactionComparisonData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={chartConfig.deposits.color}
                  strokeWidth={2}
                  dot={{ fill: chartConfig.deposits.color }}
                  name="Montant (FCFA)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Activité récente</CardTitle>
          <CardDescription className="text-sm sm:text-base">Dernières transactions sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-muted-foreground text-sm">Aucune activité récente</div>
            ) : (
              recentActivity.map((activity: {
                action: string;
                user: string;
                time: string;
                type: string;
                amount: string;
                status_display: string;
                network?: string;
              }, index: number) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        activity.type === "deposit"
                          ? "bg-green-500"
                          : activity.type === "withdrawal"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {activity.action} {activity.amount}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{activity.user}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 ml-4 sm:ml-0">
                    <div className="text-xs sm:text-sm text-muted-foreground">{activity.time}</div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      activity.status_display === "En attente" ? "bg-yellow-100 text-yellow-800" :
                      activity.status_display === "Terminée" ? "bg-green-100 text-green-800" :
                      activity.status_display === "Succès" ? "bg-blue-100 text-blue-800" :
                      activity.status_display === "Annulée" ? "bg-red-100 text-red-800" :
                      "bg-muted"
                    }`}>
                      {activity.status_display}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics - Enhanced with all API data */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Solde du Compte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.account?.formatted_balance}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Solde actuel | Limite quotidienne dépôt: {parseFloat(stats?.account?.daily_deposit_limit ?? "0").toLocaleString()} FCFA
            </p>
            <p className="text-xs text-muted-foreground">
              Limite retrait: {parseFloat(stats?.account?.daily_withdrawal_limit ?? "0").toLocaleString()} FCFA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Statistiques Mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{(rechargeStats?.month_stats?.approval_rate ?? 0) .toFixed(2)}%</div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Taux d'approbation des recharges
            </p>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">
              <div>Total demandes: {rechargeStats?.month_stats?.total_requests ?? 0}</div>
              <div>Approuvées: {rechargeStats?.month_stats?.approved_count ?? 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Flux Financiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold ${stats?.account?.net_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats?.account?.net_flow ?? 0} FCFA
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Flux net (dépôts - retraits)
            </p>
            <div className="text-xs text-muted-foreground mt-2">
              <div>Total déposé: {parseFloat(stats?.account?.total_deposited ?? "0").toLocaleString()} FCFA</div>
              <div>Total retiré: {parseFloat(stats?.account?.total_withdrawn ?? "0").toLocaleString()} FCFA</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Statut du Compte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`inline-flex px-2 py-1 rounded text-xs ${
                stats?.account?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {stats?.account?.is_active ? 'Actif' : 'Inactif'}
              </div>
              <div className={`inline-flex px-2 py-1 rounded text-xs ml-2 ${
                !stats?.account?.is_frozen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {stats?.account?.is_frozen ? 'Gelé' : 'Normal'}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Taux d'utilisation: {stats?.account?.utilization_rate ?? 0}%
            </p>
            <p className="text-xs text-muted-foreground">
              Dernière transaction: {stats?.account?.last_transaction_at ? 
                new Date(stats.account.last_transaction_at).toLocaleDateString('fr-FR') : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics from Month Stats */}
      {stats?.month_stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Statistiques Détaillées du Mois</CardTitle>
            <CardDescription className="text-sm sm:text-base">Analyse complète des transactions mensuelles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
              <div>
                <h4 className="font-semibold text-green-600 text-sm sm:text-base">Dépôts</h4>
                <p className="text-xl sm:text-2xl font-bold">{stats.month_stats.deposits_count}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Montant: {stats.month_stats.deposits_amount.toLocaleString()} FCFA
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-red-600 text-sm sm:text-base">Retraits</h4>
                <p className="text-xl sm:text-2xl font-bold">{stats.month_stats.withdrawals_count}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Montant: {stats.month_stats.withdrawals_amount.toLocaleString()} FCFA
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-600 text-sm sm:text-base">Total</h4>
                <p className="text-xl sm:text-2xl font-bold">{stats.month_stats.total_transactions}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Transactions ce mois
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recharge Statistics Details */}
      {rechargeStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Détails des Demandes de Recharge</CardTitle>
            <CardDescription className="text-sm sm:text-base">Vue d'ensemble complète des recharges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-600 text-sm sm:text-base">Total Demandes</h4>
                <p className="text-2xl sm:text-3xl font-bold text-blue-800">{rechargeStats.total_requests}</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-600 text-sm sm:text-base">En Révision</h4>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-800">{rechargeStats.pending_review}</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg sm:col-span-2 lg:col-span-1">
                <h4 className="font-semibold text-green-600 text-sm sm:text-base">Montant Approuvé</h4>
                <p className="text-xl sm:text-2xl font-bold text-green-800">
                  {rechargeStats.total_approved_amount.toLocaleString()} FCFA
                </p>
              </div>
            </div>
            
            {/* Detailed Status Breakdown */}
            <div className="mt-4 sm:mt-6">
              <h5 className="font-semibold mb-3 text-sm sm:text-base">Répartition détaillée par statut:</h5>
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(rechargeStats.by_status).map(([key, status]: [string, any]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-500 rounded">
                    <span className="text-xs sm:text-sm font-medium">{status.name}</span>
                    <span className="text-xs sm:text-sm font-bold">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}