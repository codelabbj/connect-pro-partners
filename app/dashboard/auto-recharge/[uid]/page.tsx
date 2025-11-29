"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering to prevent build-time prerendering issues
export const dynamic = 'force-dynamic'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, Calendar, DollarSign, Phone, User, AlertCircle, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { AutoRechargeTransaction, TransactionStatusResponse } from "@/lib/types/auto-recharge"
import Link from "next/link"
import { useParams } from "next/navigation"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function AutoRechargeTransactionDetailPage() {
  const { t } = useLanguage()
  const apiFetch = useApi()
  const { toast } = useToast()
  const params = useParams()
  const transactionUid = params.uid as string

  const [loading, setLoading] = useState(true)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [error, setError] = useState("")
  const [transaction, setTransaction] = useState<AutoRechargeTransaction | null>(null)

  const fetchTransactionDetail = async () => {
    setLoading(true)
    setError("")
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auto-recharge/transactions/${transactionUid}/`
      const data: AutoRechargeTransaction = await apiFetch(endpoint)
      setTransaction(data)
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setError(errorMessage)
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const checkTransactionStatus = async () => {
    if (!transactionUid) return
    
    setCheckingStatus(true)
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auto-recharge/transactions/${transactionUid}/status/`
      const data: TransactionStatusResponse = await apiFetch(endpoint)
      
      // Update transaction with new status
      if (transaction) {
        setTransaction({
          ...transaction,
          status: data.status,
          updated_at: data.updated_at || transaction.updated_at
        })
      }
      
      toast({
        title: "Statut vérifié",
        description: data.message || "Le statut de la transaction a été mis à jour",
        variant: "default"
      })
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
    } finally {
      setCheckingStatus(false)
    }
  }

  useEffect(() => {
    if (transactionUid) {
      fetchTransactionDetail()
    }
  }, [transactionUid])

  const refreshData = async () => {
    await fetchTransactionDetail()
    toast({ title: "Données actualisées", description: "Les informations de la transaction ont été mises à jour" })
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString() + " FCFA"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/auto-recharge">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64"></div>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !transaction) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/auto-recharge">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
        </div>
        <ErrorDisplay error={error} variant="full" onRetry={fetchTransactionDetail} />
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/auto-recharge">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Transaction non trouvée</h3>
            <p className="text-muted-foreground mb-4">La transaction demandée n'existe pas ou a été supprimée.</p>
            <Button asChild>
              <Link href="/dashboard/auto-recharge">Retour à la liste</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/auto-recharge">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Détails de la Transaction</h1>
            <p className="text-muted-foreground">Informations complètes sur la transaction d'auto-recharge</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={checkTransactionStatus} disabled={checkingStatus} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${checkingStatus ? 'animate-spin' : ''}`} />
            Vérifier le statut
          </Button>
          <Button onClick={refreshData} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(transaction.status)}
            Statut de la Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Statut actuel</p>
              <div className="flex items-center gap-2">
                {getStatusBadge(transaction.status)}
              </div>
            </div>
            {transaction.failed_reason && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Raison de l'échec</p>
                <p className="text-sm text-red-600 font-medium">{transaction.failed_reason}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Informations de Transaction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Référence</p>
              <p className="font-mono font-semibold">{transaction.reference}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Montant</p>
              <p className="text-2xl font-bold">{formatAmount(transaction.amount)}</p>
            </div>
            {transaction.fees && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Frais</p>
                <p className="font-semibold">{formatAmount(transaction.fees)}</p>
              </div>
            )}
            {transaction.total_amount && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Montant Total</p>
                <p className="font-semibold">{formatAmount(transaction.total_amount)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Informations de Recharge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Réseau</p>
              <p className="font-semibold">{transaction.network_name || transaction.network_code || transaction.network || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Numéro de téléphone</p>
              <p className="font-mono font-semibold">{transaction.phone_number}</p>
            </div>
            {transaction.aggregator_name && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Agrégateur</p>
                <p className="font-semibold">{transaction.aggregator_name}</p>
              </div>
            )}
            {transaction.external_transaction_id && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">ID Transaction Externe</p>
                <p className="font-mono text-sm">{transaction.external_transaction_id}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Horodatage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Date de création</p>
            <p className="font-semibold">{formatDate(transaction.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Dernière mise à jour</p>
            <p className="font-semibold">{formatDate(transaction.updated_at)}</p>
          </div>
          {transaction.completed_at && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Date de complétion</p>
              <p className="font-semibold">{formatDate(transaction.completed_at)}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


