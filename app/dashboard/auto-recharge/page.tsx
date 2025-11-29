"use client"

import { useState, useEffect, Suspense } from "react"

// Force dynamic rendering to prevent build-time prerendering issues
export const dynamic = 'force-dynamic'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Phone, ArrowLeft, RefreshCw, Search, Filter, Eye, Plus, Calendar, DollarSign, TrendingUp } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { AutoRechargeTransaction, AutoRechargeTransactionsResponse } from "@/lib/types/auto-recharge"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { StatCard } from "@/components/ui/stat-card"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

function AutoRechargeTransactionsContent() {
  const { t } = useLanguage()
  const apiFetch = useApi()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [transactions, setTransactions] = useState<AutoRechargeTransaction[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [nextPage, setNextPage] = useState<string | null>(null)
  const [previousPage, setPreviousPage] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')

  const fetchTransactions = async (page: number = 1, status: string = statusFilter, search: string = searchTerm) => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      
      if (status && status !== 'all') {
        params.append('status', status)
      }
      
      if (search && search.trim() !== '') {
        params.append('search', search.trim())
      }

      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auto-recharge/transactions/?${params.toString()}`
      const data: AutoRechargeTransactionsResponse = await apiFetch(endpoint)
      
      setTransactions(data.results || [])
      setTotalCount(data.count || 0)
      setNextPage(data.next)
      setPreviousPage(data.previous)
      setCurrentPage(page)
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setError(errorMessage)
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus)
    fetchTransactions(1, newStatus, searchTerm)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    fetchTransactions(1, statusFilter, value)
  }

  const handlePageChange = (page: number) => {
    fetchTransactions(page, statusFilter, searchTerm)
  }

  const refreshData = async () => {
    await fetchTransactions(currentPage, statusFilter, searchTerm)
    toast({ title: "Données actualisées", description: "Les transactions ont été mises à jour" })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Succès</Badge>
      case 'failed':
        return <Badge variant="destructive">Échec</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En attente</Badge>
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">En traitement</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Annulé</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString() + " FCFA"
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

  // Calculate stats
  const totalTransactions = transactions.length
  const successfulTransactions = transactions.filter(t => t.status === 'success').length
  const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)

  if (loading && transactions.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64"></div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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

  if (error && transactions.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
        </div>
        <ErrorDisplay error={error} variant="full" onRetry={() => fetchTransactions()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Auto-Recharge</h1>
            <p className="text-muted-foreground">Historique des transactions d'auto-recharge</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button asChild>
            <Link href="/dashboard/auto-recharge/create">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Recharge
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Transactions"
          value={totalCount.toString()}
          icon={Phone}
          trend={{ value: `${successfulTransactions} réussies`, isPositive: true }}
        />
        <StatCard
          title="Taux de Réussite"
          value={totalTransactions > 0 ? `${((successfulTransactions / totalTransactions) * 100).toFixed(1)}%` : "0%"}
          icon={TrendingUp}
          trend={{ value: "Transactions réussies", isPositive: true }}
        />
        <StatCard
          title="Montant Total"
          value={totalAmount.toLocaleString() + " FCFA"}
          icon={DollarSign}
          trend={{ value: "Volume traité", isPositive: true }}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par référence, téléphone..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Statut</label>
              <Select value={statusFilter} onValueChange={handleFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="success">Succès</SelectItem>
                  <SelectItem value="failed">Échec</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En traitement</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({totalCount})</CardTitle>
          <CardDescription>Liste des transactions d'auto-recharge</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune transaction trouvée</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter !== 'all' || searchTerm.trim() !== ''
                  ? "Aucune transaction ne correspond à vos filtres." 
                  : "Vous n'avez pas encore effectué de transactions d'auto-recharge."}
              </p>
              <Button asChild>
                <Link href="/dashboard/auto-recharge/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une transaction
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Réseau</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.uid}>
                        <TableCell className="font-mono text-sm">
                          {transaction.reference}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.network_name || transaction.network_code || 'N/A'}</p>
                            {transaction.aggregator_name && (
                              <p className="text-sm text-muted-foreground">{transaction.aggregator_name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {transaction.phone_number}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatAmount(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(transaction.created_at)}
                        </TableCell>
                        <TableCell>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/auto-recharge/${transaction.uid}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalCount > 0 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (previousPage) handlePageChange(currentPage - 1)
                          }}
                          className={!previousPage ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, Math.ceil(totalCount / 20)) }, (_, i) => {
                        const page = i + 1
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                handlePageChange(page)
                              }}
                              isActive={page === currentPage}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (nextPage) handlePageChange(currentPage + 1)
                          }}
                          className={!nextPage ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AutoRechargeTransactionsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64"></div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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
    }>
      <AutoRechargeTransactionsContent />
    </Suspense>
  )
}


