"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering to prevent build-time prerendering issues
export const dynamic = 'force-dynamic'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, RefreshCw, TrendingUp, TrendingDown, Calendar, Eye, AlertCircle, CheckCircle } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { CommissionStats, UnpaidCommissionsResponse, CommissionRates, PaymentHistoryResponse, CommissionFilters, PaymentHistoryFilters } from "@/lib/types/betting"
import Link from "next/link"
import { StatCard } from "@/components/ui/stat-card"
import { Pagination } from "@/components/ui/pagination"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function CommissionsPage() {
  const { t } = useLanguage()
  const apiFetch = useApi()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // Commission Stats
  const [commissionStats, setCommissionStats] = useState<CommissionStats | null>(null)
  
  // Unpaid Commissions
  const [unpaidCommissions, setUnpaidCommissions] = useState<UnpaidCommissionsResponse | null>(null)
  
  // Commission Rates
  const [commissionRates, setCommissionRates] = useState<CommissionRates | null>(null)
  
  // Payment History
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryResponse | null>(null)

  // Filters
  const [commissionFilters, setCommissionFilters] = useState<CommissionFilters>({
    date_from: '',
    date_to: ''
  })

  const fetchCommissionStats = async (filters?: CommissionFilters) => {
    try {
      const params = new URLSearchParams()
      if (filters?.date_from) params.append('date_from', filters.date_from)
      if (filters?.date_to) params.append('date_to', filters.date_to)
      
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/commissions/my_stats/?${params.toString()}`
      const data: CommissionStats = await apiFetch(endpoint)
      setCommissionStats(data)
    } catch (err: any) {
      console.error("Failed to fetch commission stats:", err)
    }
  }

  const fetchUnpaidCommissions = async () => {
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/commissions/unpaid_commissions/`
      const data: UnpaidCommissionsResponse = await apiFetch(endpoint)
      setUnpaidCommissions(data)
    } catch (err: any) {
      console.error("Failed to fetch unpaid commissions:", err)
    }
  }

  const fetchCommissionRates = async () => {
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/commissions/current_rates/`
      const data: CommissionRates = await apiFetch(endpoint)
      setCommissionRates(data)
    } catch (err: any) {
      console.error("Failed to fetch commission rates:", err)
    }
  }

  const fetchPaymentHistory = async (filters?: PaymentHistoryFilters) => {
    try {
      const params = new URLSearchParams()
      if (filters?.limit) params.append('limit', filters.limit.toString())
      
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/commissions/payment_history/?${params.toString()}`
      const data: PaymentHistoryResponse = await apiFetch(endpoint)
      setPaymentHistory(data)
    } catch (err: any) {
      console.error("Failed to fetch payment history:", err)
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    setError("")
    try {
      await Promise.all([
        fetchCommissionStats(commissionFilters),
        fetchUnpaidCommissions(),
        fetchCommissionRates(),
        fetchPaymentHistory({ limit: 50 })
      ])
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setError(errorMessage)
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  const refreshData = async () => {
    await fetchAllData()
    toast({ title: "Données actualisées", description: "Les informations des commissions ont été mises à jour" })
  }

  const handleDateFilterChange = (key: keyof CommissionFilters, value: string) => {
    const newFilters = { ...commissionFilters, [key]: value }
    setCommissionFilters(newFilters)
    fetchCommissionStats(newFilters)
  }

  const formatAmount = (amount: string | number) => {
    return parseFloat(amount.toString()).toLocaleString() + " FCFA"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commissions</h1>
          <p className="text-muted-foreground">Gestion des commissions de paris</p>
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
        <ErrorDisplay error={error} variant="full" onRetry={fetchAllData} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Commissions</h1>
          <p className="text-muted-foreground">Gestion des commissions de paris sportifs</p>
        </div>
        <Button onClick={refreshData} disabled={loading} className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Commission Stats Cards */}
      {commissionStats && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Transactions"
            value={commissionStats.total_transactions.toString()}
            icon={TrendingUp}
            trend={{ value: "Transactions avec commission", isPositive: true }}
          />
          <StatCard
            title="Commission Totale"
            value={formatAmount(commissionStats.total_commission)}
            icon={DollarSign}
            trend={{ value: "Montant généré", isPositive: true }}
          />
          <StatCard
            title="Commission Payée"
            value={formatAmount(commissionStats.paid_commission)}
            icon={CheckCircle}
            trend={{ value: "Montant reçu", isPositive: true }}
          />
          <StatCard
            title="Commission Non Payée"
            value={formatAmount(commissionStats.unpaid_commission)}
            icon={AlertCircle}
            trend={{ value: "En attente de paiement", isPositive: false }}
          />
        </div>
      )}

      {/* Commission Rates */}
      {commissionRates && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Taux de Commission Actuels
            </CardTitle>
            <CardDescription>Configuration actuelle des taux de commission</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">Taux de Dépôt</h4>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{commissionRates.deposit_rate}%</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-green-600 dark:text-green-400">Taux de Retrait</h4>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">{commissionRates.withdrawal_rate}%</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{commissionRates.message}</p>
              {commissionRates.last_updated && (
                <p className="text-xs text-muted-foreground mt-1">
                  Dernière mise à jour: {formatDate(commissionRates.last_updated)} par {commissionRates.updated_by}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="unpaid">Non payées</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Date Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtres par Date</CardTitle>
              <CardDescription>Filtrer les statistiques par période</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date de début</label>
                  <Input
                    type="date"
                    value={commissionFilters.date_from}
                    onChange={(e) => handleDateFilterChange('date_from', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date de fin</label>
                  <Input
                    type="date"
                    value={commissionFilters.date_to}
                    onChange={(e) => handleDateFilterChange('date_to', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commission by Platform */}
          {commissionStats && commissionStats.by_platform.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Commissions par Plateforme</CardTitle>
                <CardDescription>Répartition des commissions par plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plateforme</TableHead>
                        <TableHead>Transactions</TableHead>
                        <TableHead>Commission Totale</TableHead>
                        <TableHead>Commission Non Payée</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissionStats.by_platform.map((platform, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-semibold">{platform.platform__name}</TableCell>
                          <TableCell>{platform.count}</TableCell>
                          <TableCell className="font-semibold">{formatAmount(platform.total_commission)}</TableCell>
                          <TableCell className="font-semibold text-orange-600">{formatAmount(platform.unpaid_commission)}</TableCell>
                          <TableCell>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/dashboard/betting/transactions?platform=${platform.platform__name}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unpaid" className="space-y-4">
          {unpaidCommissions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Commissions Non Payées
                </CardTitle>
                <CardDescription>
                  Total: {formatAmount(unpaidCommissions.total_unpaid_amount)} ({unpaidCommissions.transaction_count} transactions)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {unpaidCommissions.transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune commission en attente</h3>
                    <p className="text-muted-foreground">Toutes vos commissions ont été payées.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Référence</TableHead>
                          <TableHead>Plateforme</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Commission</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unpaidCommissions.transactions.map((transaction) => (
                          <TableRow key={transaction.uid}>
                            <TableCell className="font-mono text-sm">{transaction.reference}</TableCell>
                            <TableCell>{transaction.platform_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {transaction.transaction_type === 'deposit' ? 'Dépôt' : 'Retrait'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">{formatAmount(transaction.amount)}</TableCell>
                            <TableCell className="font-semibold text-orange-600">{formatAmount(transaction.commission_amount)}</TableCell>
                            <TableCell className="text-sm">{formatDate(transaction.created_at)}</TableCell>
                            <TableCell>
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/dashboard/betting/transactions/${transaction.uid}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {paymentHistory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Historique des Paiements
                </CardTitle>
                <CardDescription>
                  Total payé: {formatAmount(paymentHistory.total_paid_amount)} ({paymentHistory.payment_count} paiements)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentHistory.payments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun paiement reçu</h3>
                    <p className="text-muted-foreground">Vous n'avez pas encore reçu de paiement de commission.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Période</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Transactions</TableHead>
                          <TableHead>Payé par</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentHistory.payments.map((payment) => (
                          <TableRow key={payment.uid}>
                            <TableCell>
                              <div>
                                <p className="font-semibold">{formatDate(payment.period_start)}</p>
                                <p className="text-sm text-muted-foreground">à {formatDate(payment.period_end)}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-green-600">{formatAmount(payment.total_amount)}</TableCell>
                            <TableCell>{payment.transaction_count}</TableCell>
                            <TableCell>{payment.paid_by_name}</TableCell>
                            <TableCell className="text-sm">{formatDate(payment.created_at)}</TableCell>
                            <TableCell className="text-sm">{payment.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
