// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
// import { Users, CreditCard, DollarSign, TrendingUp } from "lucide-react"
// import { useLanguage } from "@/components/providers/language-provider"
// import { useApi } from "@/lib/useApi"
// import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, LineChart, Line } from "recharts"
// import { StatCard } from "@/components/ui/stat-card" // You need to create this component
// import { ErrorDisplay } from "@/components/ui/error-display"

// const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

// const chartConfig = {
//   users: { color: "#2563eb", label: "Utilisateurs" },
//   transactions: { color: "#16a34a", label: "Transactions" },
//   revenue: { color: "#a21caf", label: "Revenus" },
// }

// const mockWeeklyData = [
//   { name: "Lun", users: 10, transactions: 5 },
//   { name: "Mar", users: 15, transactions: 8 },
//   { name: "Mer", users: 20, transactions: 12 },
//   { name: "Jeu", users: 25, transactions: 15 },
//   { name: "Ven", users: 30, transactions: 18 },
//   { name: "Sam", users: 28, transactions: 16 },
//   { name: "Dim", users: 35, transactions: 20 },
// ]

// const mockMonthlyData = [
//   { name: "Mars", revenue: 12000, transactions: 50 },
//   { name: "Avr", revenue: 15000, transactions: 60 },
//   { name: "Mai", revenue: 18000, transactions: 70 },
//   { name: "Juin", revenue: 20000, transactions: 80 },
//   { name: "Juil", revenue: 22000, transactions: 90 },
//   { name: "Août", revenue: 25000, transactions: 100 },
// ]

// function ChartTooltipContent({ active, payload, label }: any) {
//   if (!active || !payload) return null
//   return (
//     <div className="bg-white dark:bg-gray-900 p-2 rounded shadow text-xs">
//       <div className="font-semibold">{label}</div>
//       {payload.map((entry: any, idx: number) => (
//         <div key={idx} style={{ color: entry.color || entry.fill }}>
//           {entry.name}: <span className="font-bold">{entry.value}</span>
//         </div>
//       ))}
//     </div>
//   )
// }

// export default function DashboardPage() {
//   const { t } = useLanguage()
//   const apiFetch = useApi()

//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState("")
//   const [stats, setStats] = useState<any>(null)
//   const [userStats, setUserStats] = useState<any>(null)
//   const [rechargeStats, setRechargeStats] = useState<any>(null)

//   useEffect(() => {
//     async function fetchAll() {
//       setLoading(true)
//       setError("")
//       try {
//         const [dashboard, userStatsRes, rechargeStatsRes] = await Promise.all([
//           apiFetch(`${baseUrl}api/payments/user/dashboard/`),
//           apiFetch(`${baseUrl}api/payments/user/stats/`),
//           apiFetch(`${baseUrl}api/payments/recharge-requests/stats/`),
//         ])
//         setStats(dashboard)
//         setUserStats(userStatsRes)
//         setRechargeStats(rechargeStatsRes)
//       } catch (err: any) {
//         setError("Impossible de charger les données du tableau de bord.")
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchAll()
//   }, [apiFetch, baseUrl])

//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
//           <p className="text-muted-foreground">Vue d'ensemble de votre plateforme</p>
//         </div>
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           {[...Array(4)].map((_, i) => (
//             <Card key={i}>
//               <CardContent className="p-6">
//                 <div className="animate-pulse">
//                   <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
//                   <div className="h-8 bg-muted rounded w-1/2"></div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return <ErrorDisplay error={error} variant="full" />
//   }

//   // Prepare stat values
//   const totalUsers = stats?.account?.user_name ? 1 : 0
//   const totalTransactions = userStats?.total_transactions ?? 0
//   const totalPayments = rechargeStats?.month_stats?.approved_amount ?? 0
//   const totalTopUps = stats?.account?.total_recharged ?? 0

//   // Trends (mocked for now, you can calculate based on API data)
//   const usersTrend = 0
//   const transactionsTrend = 0
//   const paymentsTrend = 0
//   const topUpsTrend = 0

//   // Recent activity from recent_transactions
//   type RecentTransaction = {
//     type: string;
//     created_at: string;
//     formatted_amount: string;
//     status_display: string;
//     network?: { nom?: string };
//   };

//   const recentActivity = stats?.recent_transactions?.slice(0, 4).map((txn: RecentTransaction) => ({
//     action:
//       txn.type === "deposit"
//         ? "Dépôt effectué"
//         : txn.type === "withdrawal"
//         ? "Retrait effectué"
//         : "Transaction",
//     user: stats.account.user_name,
//     time: new Date(txn.created_at).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
//     type: txn.type,
//     amount: txn.formatted_amount,
//     status: txn.status_display,
//     network: txn.network?.nom,
//   })) ?? []

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
//         <p className="text-muted-foreground">Vue d'ensemble de votre plateforme</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <StatCard
//           title={t("totalUsers")}
//           value={totalUsers.toLocaleString()}
//           icon={Users}
//           trend={{ value: usersTrend, isPositive: usersTrend > 0 }}
//         />
//         <StatCard
//           title={t("totalTransactions")}
//           value={totalTransactions.toLocaleString()}
//           icon={CreditCard}
//           trend={{ value: transactionsTrend, isPositive: transactionsTrend > 0 }}
//         />
//         <StatCard
//           title={t("totalPayments")}
//           value={totalPayments.toLocaleString() + " FCFA"}
//           icon={DollarSign}
//           trend={{ value: paymentsTrend, isPositive: paymentsTrend > 0 }}
//         />
//         <StatCard
//           title={t("totalTopUps")}
//           value={parseFloat(totalTopUps).toLocaleString() + " FCFA"}
//           icon={TrendingUp}
//           trend={{ value: topUpsTrend, isPositive: topUpsTrend > 0 }}
//         />
//       </div>

//       {/* Charts */}
//       <div className="grid gap-4 md:grid-cols-2">
//         <Card>
//           <CardHeader>
//             <CardTitle>Activité hebdomadaire</CardTitle>
//             <CardDescription>Évolution des métriques sur les 7 derniers jours</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={mockWeeklyData}>
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <ChartTooltip content={<ChartTooltipContent />} />
//                 <Bar dataKey="users" fill={chartConfig.users.color} name={chartConfig.users.label} />
//                 <Bar dataKey="transactions" fill={chartConfig.transactions.color} name={chartConfig.transactions.label} />
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader>
//             <CardTitle>Tendance mensuelle</CardTitle>
//             <CardDescription>Revenus et transactions sur 6 mois</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={mockMonthlyData}>
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <ChartTooltip content={<ChartTooltipContent />} />
//                 <Line
//                   type="monotone"
//                   dataKey="revenue"
//                   stroke={chartConfig.revenue.color}
//                   strokeWidth={2}
//                   dot={{ fill: chartConfig.revenue.color }}
//                   name="Revenus"
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="transactions"
//                   stroke={chartConfig.transactions.color}
//                   strokeWidth={2}
//                   dot={{ fill: chartConfig.transactions.color }}
//                   name="Transactions"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Recent Activity */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Activité récente</CardTitle>
//           <CardDescription>Dernières actions sur la plateforme</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {recentActivity.length === 0 ? (
//               <div className="text-muted-foreground text-sm">Aucune activité récente</div>
//             ) : (
//               recentActivity.map((activity: {
//                 action: string;
//                 user: string;
//                 time: string;
//                 type: string;
//                 amount: string;
//                 status: string;
//                 network?: string;
//               }, index: number) => (
//                 <div key={index} className="flex items-center space-x-4">
//                   <div
//                     className={`w-2 h-2 rounded-full ${
//                       activity.type === "deposit"
//                         ? "bg-green-500"
//                         : activity.type === "withdrawal"
//                         ? "bg-orange-500"
//                         : "bg-blue-500"
//                     }`}
//                   />
//                   <div className="flex-1 space-y-1">
//                     <p className="text-sm font-medium leading-none">
//                       {activity.action} {activity.amount} {activity.network && `(${activity.network})`}
//                     </p>
//                     <p className="text-sm text-muted-foreground">{activity.user}</p>
//                   </div>
//                   <div className="text-sm text-muted-foreground">{activity.time}</div>
//                   <div className="text-xs px-2 py-1 rounded bg-muted">{activity.status}</div>
//                 </div>
//               ))
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }




// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
// import { Users, CreditCard, DollarSign, TrendingUp } from "lucide-react"
// import { useLanguage } from "@/components/providers/language-provider"
// import { useApi } from "@/lib/useApi"
// import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, LineChart, Line, PieChart, Pie, Cell } from "recharts"
// import { StatCard } from "@/components/ui/stat-card"
// import { ErrorDisplay } from "@/components/ui/error-display"

// const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

// const chartConfig = {
//   deposits: { color: "#16a34a", label: "Dépôts" },
//   withdrawals: { color: "#dc2626", label: "Retraits" },
//   approved: { color: "#2563eb", label: "Approuvé" },
//   rejected: { color: "#dc2626", label: "Rejeté" },
//   pending: { color: "#f59e0b", label: "En attente" },
// }

// const NETWORK_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#8b5cf6"]

// function ChartTooltipContent({ active, payload, label }: any) {
//   if (!active || !payload) return null
//   return (
//     <div className="bg-white dark:bg-gray-900 p-2 rounded shadow text-xs border">
//       <div className="font-semibold">{label}</div>
//       {payload.map((entry: any, idx: number) => (
//         <div key={idx} style={{ color: entry.color || entry.fill }}>
//           {entry.name}: <span className="font-bold">{entry.value}</span>
//         </div>
//       ))}
//     </div>
//   )
// }

// export default function DashboardPage() {
//   const { t } = useLanguage()
//   const apiFetch = useApi()

//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState("")
//   const [stats, setStats] = useState<any>(null)
//   const [userStats, setUserStats] = useState<any>(null)
//   const [rechargeStats, setRechargeStats] = useState<any>(null)

//   useEffect(() => {
//     async function fetchAll() {
//       setLoading(true)
//       setError("")
//       try {
//         const [dashboard, userStatsRes, rechargeStatsRes] = await Promise.all([
//           apiFetch(`${baseUrl}api/payments/user/dashboard/`),
//           apiFetch(`${baseUrl}api/payments/user/stats/`),
//           apiFetch(`${baseUrl}api/payments/recharge-requests/stats/`),
//         ])
//         setStats(dashboard)
//         setUserStats(userStatsRes)
//         setRechargeStats(rechargeStatsRes)
//       } catch (err: any) {
//         setError("Impossible de charger les données du tableau de bord.")
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchAll()
//   }, [apiFetch, baseUrl])

//   if (loading) {
//     return (
//       <div className="ml-6 space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
//           <p className="text-muted-foreground">Vue d'ensemble de votre plateforme</p>
//         </div>
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           {[...Array(4)].map((_, i) => (
//             <Card key={i}>
//               <CardContent className="p-6">
//                 <div className="animate-pulse">
//                   <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
//                   <div className="h-8 bg-muted rounded w-1/2"></div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="ml-6">
//         <ErrorDisplay error={error} variant="full" />
//       </div>
//     )
//   }

//   // Prepare stat values from real API data
//   const totalUsers = stats?.account?.user_name ? 1 : 0
//   const totalTransactions = userStats?.total_transactions ?? 0
//   const totalApprovedRecharges = rechargeStats?.total_approved_amount ?? 0
//   const totalRecharged = parseFloat(stats?.account?.total_recharged ?? "0")

//   // Create charts data from API responses
  
//   // Transaction comparison chart data
//   const transactionComparisonData = [
//     {
//       name: "Dépôts",
//       count: userStats?.deposits?.count ?? 0,
//       amount: userStats?.deposits?.total_amount ?? 0,
//     },
//     {
//       name: "Retraits", 
//       count: userStats?.withdrawals?.count ?? 0,
//       amount: userStats?.withdrawals?.total_amount ?? 0,
//     }
//   ]

//   // Recharge status distribution for pie chart
//   const rechargeStatusData = rechargeStats?.by_status ? Object.entries(rechargeStats.by_status).map(([key, value]: [string, any]) => ({
//     name: value.name,
//     value: value.count,
//     key: key
//   })).filter((item: any) => item.value > 0) : []

//   // Network distribution data
//   const networkData = userStats?.by_network ? Object.entries(userStats.by_network).map(([network, data]: [string, any], index) => ({
//     name: network,
//     count: data.count,
//     amount: data.amount,
//     color: NETWORK_COLORS[index % NETWORK_COLORS.length]
//   })) : []

//   // Monthly trend data (using available data)
//   const monthlyTrendData = [
//     {
//       name: "Ce mois",
//       deposits: userStats?.deposits?.total_amount ?? 0,
//       withdrawals: userStats?.withdrawals?.total_amount ?? 0,
//       recharges: rechargeStats?.month_stats?.approved_amount ?? 0,
//     }
//   ]

//   // Recent activity from recent_transactions
//   type RecentTransaction = {
//     type: string;
//     created_at: string;
//     formatted_amount: string;
//     status_display: string;
//     network?: { nom?: string };
//   };

//   const recentActivity = stats?.recent_transactions?.slice(0, 6).map((txn: RecentTransaction) => ({
//     action:
//       txn.type === "deposit"
//         ? "Dépôt effectué"
//         : txn.type === "withdrawal"
//         ? "Retrait effectué"
//         : "Transaction",
//     user: stats.account.user_name,
//     time: new Date(txn.created_at).toLocaleString("fr-FR", { 
//       day: "2-digit",
//       month: "2-digit",
//       hour: "2-digit", 
//       minute: "2-digit" 
//     }),
//     type: txn.type,
//     amount: txn.formatted_amount,
//     status: txn.status_display,
//     network: txn.network?.nom,
//   })) ?? []

//   return (
//     <div className="ml-6 space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
//         <p className="text-muted-foreground">Vue d'ensemble de votre plateforme</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <StatCard
//           title="Total Utilisateurs"
//           value={totalUsers.toLocaleString()}
//           icon={Users}
//           trend={{ value: 0, isPositive: true }}
//         />
//         <StatCard
//           title="Total Transactions"
//           value={totalTransactions.toLocaleString()}
//           icon={CreditCard}
//           trend={{ value: 0, isPositive: true }}
//         />
//         <StatCard
//           title="Recharges Approuvées"
//           value={totalApprovedRecharges.toLocaleString() + " FCFA"}
//           icon={DollarSign}
//           trend={{ value: rechargeStats?.month_stats?.approval_rate ?? 0, isPositive: true }}
//         />
//         <StatCard
//           title="Total Rechargé"
//           value={totalRecharged.toLocaleString() + " FCFA"}
//           icon={TrendingUp}
//           trend={{ value: 0, isPositive: true }}
//         />
//       </div>

//       {/* Charts */}
//       <div className="grid gap-4 md:grid-cols-2">
//         {/* Transaction Types Comparison */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Comparaison Transactions</CardTitle>
//             <CardDescription>Dépôts vs Retraits (Derniers 30 jours)</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={transactionComparisonData}>
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <ChartTooltip content={<ChartTooltipContent />} />
//                 <Bar 
//                   dataKey="count" 
//                   fill={chartConfig.deposits.color} 
//                   name="Nombre de transactions" 
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Network Distribution */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Répartition par Réseau</CardTitle>
//             <CardDescription>Distribution des transactions par réseau</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {networkData.length > 0 ? (
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={networkData}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     label={({ name, count }) => `${name}: ${count}`}
//                     outerRadius={80}
//                     fill="#8884d8"
//                     dataKey="count"
//                   >
//                     {networkData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <ChartTooltip content={<ChartTooltipContent />} />
//                 </PieChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="flex items-center justify-center h-[300px] text-muted-foreground">
//                 Aucune donnée réseau disponible
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Recharge Status Distribution */}
//         {rechargeStatusData.length > 0 && (
//           <Card>
//             <CardHeader>
//               <CardTitle>Statut des Recharges</CardTitle>
//               <CardDescription>Distribution par statut des demandes</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={rechargeStatusData}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     label={({ name, value }) => `${name}: ${value}`}
//                     outerRadius={80}
//                     fill="#8884d8"
//                     dataKey="value"
//                   >
//                     {rechargeStatusData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={
//                         entry.key === 'approved' ? chartConfig.approved.color :
//                         entry.key === 'rejected' ? chartConfig.rejected.color :
//                         chartConfig.pending.color
//                       } />
//                     ))}
//                   </Pie>
//                   <ChartTooltip content={<ChartTooltipContent />} />
//                 </PieChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         )}

//         {/* Transaction Amounts */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Montants des Transactions</CardTitle>
//             <CardDescription>Volumes financiers par type</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={transactionComparisonData}>
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <ChartTooltip content={<ChartTooltipContent />} />
//                 <Line
//                   type="monotone"
//                   dataKey="amount"
//                   stroke={chartConfig.deposits.color}
//                   strokeWidth={2}
//                   dot={{ fill: chartConfig.deposits.color }}
//                   name="Montant (FCFA)"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Recent Activity */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Activité récente</CardTitle>
//           <CardDescription>Dernières transactions sur la plateforme</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {recentActivity.length === 0 ? (
//               <div className="text-muted-foreground text-sm">Aucune activité récente</div>
//             ) : (
//               recentActivity.map((activity: {
//                 action: string;
//                 user: string;
//                 time: string;
//                 type: string;
//                 amount: string;
//                 status: string;
//                 network?: string;
//               }, index: number) => (
//                 <div key={index} className="flex items-center space-x-4">
//                   <div
//                     className={`w-2 h-2 rounded-full ${
//                       activity.type === "deposit"
//                         ? "bg-green-500"
//                         : activity.type === "withdrawal"
//                         ? "bg-orange-500"
//                         : "bg-blue-500"
//                     }`}
//                   />
//                   <div className="flex-1 space-y-1">
//                     <p className="text-sm font-medium leading-none">
//                       {activity.action} {activity.amount} {activity.network && `(${activity.network})`}
//                     </p>
//                     <p className="text-sm text-muted-foreground">{activity.user}</p>
//                   </div>
//                   <div className="text-sm text-muted-foreground">{activity.time}</div>
//                   <div className={`text-xs px-2 py-1 rounded ${
//                     activity.status === "En attente" ? "bg-yellow-100 text-yellow-800" :
//                     activity.status === "Terminée" ? "bg-green-100 text-green-800" :
//                     activity.status === "Annulée" ? "bg-red-100 text-red-800" :
//                     "bg-muted"
//                   }`}>
//                     {activity.status}
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Summary Statistics */}
//       <div className="grid gap-4 md:grid-cols-3">
//         <Card>
//           <CardHeader>
//             <CardTitle>Balance du Compte</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats?.account?.formatted_balance}</div>
//             <p className="text-sm text-muted-foreground">
//               Solde actuel du compte
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Taux d'Approbation</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{rechargeStats?.month_stats?.approval_rate ?? 0}%</div>
//             <p className="text-sm text-muted-foreground">
//               Recharges approuvées ce mois
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Flux Net</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className={`text-2xl font-bold ${stats?.account?.net_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//               {stats?.account?.net_flow ?? 0} FCFA
//             </div>
//             <p className="text-sm text-muted-foreground">
//               Différence dépôts/retraits
//             </p>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }



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
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre plateforme</p>
      </div>

      {/* Account Overview Section - From UserPaymentPage */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              {t("payment.accountOverview") || "Account Overview"}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={refreshAccountData} disabled={accountLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${accountLoading ? 'animate-spin' : ''}`} />
              {t("common.refresh") || "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {accountLoading ? (
            <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>
          ) : accountError ? (
            <ErrorDisplay
              error={accountError}
              onRetry={refreshAccountData}
              variant="full"
              showDismiss={false}
            />
          ) : accountData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">{t("payment.currentBalance") || "Current Balance"}</p>
                    <p className="text-2xl font-bold text-blue-900">{accountData.formatted_balance}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">{t("payment.totalRecharged") || "Total Recharged"}</p>
                    <p className="text-2xl font-bold text-green-900">{accountData.total_recharged} FCFA</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">{t("payment.totalDeposited") || "Total Deposited"}</p>
                    <p className="text-2xl font-bold text-purple-900">{accountData.total_deposited} FCFA</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">{t("payment.totalWithdrawn") || "Total Withdrawn"}</p>
                    <p className="text-2xl font-bold text-orange-900">{accountData.total_withdrawn} FCFA</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>
          ) : null}

          {accountData && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">{t("payment.accountStatus") || "Account Status"}</span>
                <Badge variant={accountData.is_active ? "default" : "destructive"}>
                  {accountData.is_active ? (t("payment.active") || "Active") : (t("payment.inactive") || "Inactive")}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">{t("payment.accountFrozen") || "Account Frozen"}</span>
                <Badge variant={accountData.is_frozen ? "destructive" : "default"}>
                  {accountData.is_frozen ? (t("common.yes") || "Yes") : (t("common.no") || "No")}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">{t("payment.utilizationRate") || "Utilization Rate"}</span>
                <span className="font-semibold">{(accountData.utilization_rate * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      <div className="grid gap-4 md:grid-cols-2">
        {/* Transaction Types with Completed Status */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions par Type</CardTitle>
            <CardDescription>Dépôts vs Retraits avec statuts ({userStats?.period_days || 30} derniers jours)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
              <CardTitle>Statut des Transactions</CardTitle>
              <CardDescription>Distribution par statut des transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={transactionStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
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
            <CardTitle>Répartition par Réseau</CardTitle>
            <CardDescription>Distribution des transactions par réseau</CardDescription>
          </CardHeader>
          <CardContent>
            {networkData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={networkData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name}: ${count}`}
                    outerRadius={80}
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
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Aucune donnée réseau disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recharge Status Distribution */}
        {rechargeStatusData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Statut des Recharges</CardTitle>
              <CardDescription>Distribution par statut des demandes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={rechargeStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
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
            <CardTitle>Montants des Transactions</CardTitle>
            <CardDescription>Volumes financiers par type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>Dernières transactions sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-muted-foreground text-sm">Aucune activité récente</div>
            ) : (
              recentActivity.map((activity: {
                action: string;
                user: string;
                time: string;
                type: string;
                amount: string;
                status: string;
                network?: string;
              }, index: number) => (
                <div key={index} className="flex items-center space-x-4">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "deposit"
                        ? "bg-green-500"
                        : activity.type === "withdrawal"
                        ? "bg-orange-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.action} {activity.amount} {activity.network && `(${activity.network})`}
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.user}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{activity.time}</div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    activity.status === "En attente" ? "bg-yellow-100 text-yellow-800" :
                    activity.status === "Terminée" ? "bg-green-100 text-green-800" :
                    activity.status === "Annulée" ? "bg-red-100 text-red-800" :
                    "bg-muted"
                  }`}>
                    {activity.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics - Enhanced with all API data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Balance du Compte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.account?.formatted_balance}</div>
            <p className="text-sm text-muted-foreground">
              Solde actuel | Limite quotidienne dépôt: {parseFloat(stats?.account?.daily_deposit_limit ?? "0").toLocaleString()} FCFA
            </p>
            <p className="text-xs text-muted-foreground">
              Limite retrait: {parseFloat(stats?.account?.daily_withdrawal_limit ?? "0").toLocaleString()} FCFA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques Mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(rechargeStats?.month_stats?.approval_rate ?? 0) .toFixed(2)}%</div>
            <p className="text-sm text-muted-foreground">
              Taux d'approbation des recharges
            </p>
            <div className="text-sm text-muted-foreground mt-2">
              <div>Total demandes: {rechargeStats?.month_stats?.total_requests ?? 0}</div>
              <div>Approuvées: {rechargeStats?.month_stats?.approved_count ?? 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flux Financiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats?.account?.net_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats?.account?.net_flow ?? 0} FCFA
            </div>
            <p className="text-sm text-muted-foreground">
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
            <CardTitle>Statut du Compte</CardTitle>
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
            <p className="text-sm text-muted-foreground mt-2">
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
            <CardTitle>Statistiques Détaillées du Mois</CardTitle>
            <CardDescription>Analyse complète des transactions mensuelles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="font-semibold text-green-600">Dépôts</h4>
                <p className="text-2xl font-bold">{stats.month_stats.deposits_count}</p>
                <p className="text-sm text-muted-foreground">
                  Montant: {stats.month_stats.deposits_amount.toLocaleString()} FCFA
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-red-600">Retraits</h4>
                <p className="text-2xl font-bold">{stats.month_stats.withdrawals_count}</p>
                <p className="text-sm text-muted-foreground">
                  Montant: {stats.month_stats.withdrawals_amount.toLocaleString()} FCFA
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-600">Total</h4>
                <p className="text-2xl font-bold">{stats.month_stats.total_transactions}</p>
                <p className="text-sm text-muted-foreground">
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
            <CardTitle>Détails des Demandes de Recharge</CardTitle>
            <CardDescription>Vue d'ensemble complète des recharges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-600">Total Demandes</h4>
                <p className="text-3xl font-bold text-blue-800">{rechargeStats.total_requests}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-600">En Révision</h4>
                <p className="text-3xl font-bold text-yellow-800">{rechargeStats.pending_review}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-600">Montant Approuvé</h4>
                <p className="text-2xl font-bold text-green-800">
                  {rechargeStats.total_approved_amount.toLocaleString()} FCFA
                </p>
              </div>
            </div>
            
            {/* Detailed Status Breakdown */}
            <div className="mt-6">
              <h5 className="font-semibold mb-3">Répartition détaillée par statut:</h5>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(rechargeStats.by_status).map(([key, status]: [string, any]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-500 rounded">
                    <span className="text-sm font-medium">{status.name}</span>
                    <span className="text-sm font-bold">{status.count}</span>
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