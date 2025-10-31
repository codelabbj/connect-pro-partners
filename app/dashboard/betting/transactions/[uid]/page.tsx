"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering to prevent build-time prerendering issues
export const dynamic = 'force-dynamic'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, RefreshCw, Calendar, DollarSign, CreditCard, User, ExternalLink, AlertCircle, CheckCircle, XCircle, Clock, X } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { BettingTransaction, RequestCancellationRequest, RequestCancellationResponse } from "@/lib/types/betting"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function TransactionDetailPage() {
  const { t } = useLanguage()
  const apiFetch = useApi()
  const { toast } = useToast()
  const params = useParams()
  const transactionUid = params.uid as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [transaction, setTransaction] = useState<BettingTransaction | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelling, setCancelling] = useState(false)

  const fetchTransactionDetail = async () => {
    setLoading(true)
    setError("")
    try {
      // Since there's no specific endpoint for single transaction, we'll fetch from the list
      // In a real implementation, you'd have a specific endpoint like /api/payments/betting/user/transactions/{uid}/
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/transactions/my_transactions/?page=1`
      const data = await apiFetch(endpoint)
      
      const foundTransaction = data.results?.find((t: BettingTransaction) => t.uid === transactionUid)
      if (foundTransaction) {
        setTransaction(foundTransaction)
      } else {
        setError("Transaction non trouvée")
      }
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setError(errorMessage)
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactionDetail()
  }, [transactionUid])

  const refreshData = async () => {
    await fetchTransactionDetail()
    toast({ title: "Données actualisées", description: "Les informations de la transaction ont été mises à jour" })
  }

  const handleRequestCancellation = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez fournir une raison pour l'annulation",
        variant: "destructive"
      })
      return
    }

    if (!transaction) return

    setCancelling(true)
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/transactions/${transaction.uid}/request_cancellation/`
      const payload: RequestCancellationRequest = {
        reason: cancelReason.trim()
      }

      const data: RequestCancellationResponse = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      toast({
        title: "Succès",
        description: data.message || "Demande d'annulation envoyée avec succès",
        variant: "default"
      })

      setShowCancelDialog(false)
      setCancelReason("")
      await fetchTransactionDetail()
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setCancelling(false)
    }
  }

  const isTransactionCancellable = () => {
    if (!transaction) return false
    // Transaction must not be already cancelled or failed
    if (transaction.status === 'cancelled' || transaction.status === 'failed') return false
    // Cancellation must not have been requested before
    if (transaction.cancellation_requested_at) return false
    // Check if transaction is within 25 minutes of creation
    const createdTime = new Date(transaction.created_at).getTime()
    const now = Date.now()
    const twentyFiveMinutes = 25 * 60 * 1000
    const isWithinTimeWindow = (now - createdTime) < twentyFiveMinutes
    // Check flags if available
    const isCancellable = transaction.is_cancellable !== false && transaction.can_request_cancellation !== false
    
    return isWithinTimeWindow && isCancellable
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
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
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

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Dépôt</Badge>
      case 'withdrawal':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">Retrait</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
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
            <Link href="/dashboard/betting/transactions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64"></div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
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
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/betting/transactions">
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
            <Link href="/dashboard/betting/transactions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Transaction non trouvée</h3>
            <p className="text-muted-foreground">Cette transaction n'existe pas ou vous n'y avez pas accès.</p>
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
            <Link href="/dashboard/betting/transactions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Détails de la Transaction</h1>
            <p className="text-muted-foreground">Référence: {transaction.reference}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isTransactionCancellable() && (
            <Button 
              variant="destructive" 
              onClick={() => setShowCancelDialog(true)}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Demander l'annulation
            </Button>
          )}
          <Button onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Transaction Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(transaction.status)}
            Résumé de la Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Statut</span>
                {getStatusBadge(transaction.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type</span>
                {getTransactionTypeBadge(transaction.transaction_type)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Montant</span>
                <span className="font-semibold text-lg">{formatAmount(transaction.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Commission</span>
                <span className="font-semibold">{formatAmount(transaction.commission_amount)}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plateforme</span>
                <span className="font-semibold">{transaction.platform_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">ID Utilisateur</span>
                <span className="font-mono text-sm">{transaction.betting_user_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taux Commission</span>
                <span className="font-semibold">{transaction.commission_rate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Commission Payée</span>
                <Badge variant={transaction.commission_paid ? "default" : "secondary"}>
                  {transaction.commission_paid ? "Oui" : "Non"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Informations Générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Référence</p>
              <p className="font-mono text-sm">{transaction.reference}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Partenaire</p>
              <p className="font-semibold">{transaction.partner_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plateforme</p>
              <p className="font-semibold">{transaction.platform_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID Transaction Externe</p>
              <p className="font-mono text-sm">{transaction.external_transaction_id || "N/A"}</p>
            </div>
            {transaction.withdrawal_code && (
              <div>
                <p className="text-sm text-muted-foreground">Code de Retrait</p>
                <p className="font-mono text-sm font-semibold">{transaction.withdrawal_code}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Informations Financières
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Montant</p>
              <p className="font-semibold text-lg">{formatAmount(transaction.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Commission</p>
              <p className="font-semibold">{formatAmount(transaction.commission_amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taux Commission</p>
              <p className="font-semibold">{transaction.commission_rate}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Solde Avant</p>
              <p className="font-semibold">{formatAmount(transaction.partner_balance_before)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Solde Après</p>
              <p className="font-semibold">{formatAmount(transaction.partner_balance_after)}</p>
            </div>
            {transaction.commission_paid_at && (
              <div>
                <p className="text-sm text-muted-foreground">Commission Payée le</p>
                <p className="font-semibold">{formatDate(transaction.commission_paid_at)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {transaction.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{transaction.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Chronologie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-semibold">Transaction créée</p>
                <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
              </div>
            </div>
            
            {transaction.cancellation_requested_at && (
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="font-semibold">Annulation demandée</p>
                  <p className="text-sm text-muted-foreground">{formatDate(transaction.cancellation_requested_at)}</p>
                </div>
              </div>
            )}
            
            {transaction.cancelled_at && (
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div>
                  <p className="font-semibold">Transaction annulée</p>
                  <p className="text-sm text-muted-foreground">{formatDate(transaction.cancelled_at)}</p>
                </div>
              </div>
            )}
            
            {transaction.commission_paid_at && (
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-semibold">Commission payée</p>
                  <p className="text-sm text-muted-foreground">{formatDate(transaction.commission_paid_at)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* External Response */}
      {transaction.external_response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Réponse Externe
            </CardTitle>
            <CardDescription>Détails de la réponse de la plateforme externe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(transaction.external_response, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Supplémentaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Remboursé au Partenaire</p>
              <Badge variant={transaction.partner_refunded ? "default" : "secondary"}>
                {transaction.partner_refunded ? "Oui" : "Non"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Annulé par</p>
              <p className="font-semibold">{transaction.cancelled_by_uid || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demander l'annulation</DialogTitle>
            <DialogDescription>
              Veuillez fournir une raison pour l'annulation de cette transaction. 
              La demande d'annulation doit être effectuée dans les 25 minutes suivant la création de la transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Raison de l'annulation *</Label>
              <Textarea
                id="cancelReason"
                placeholder="Décrivez la raison de l'annulation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCancelDialog(false)
              setCancelReason("")
            }}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRequestCancellation}
              disabled={cancelling || !cancelReason.trim()}
            >
              {cancelling ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Demander l'annulation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
