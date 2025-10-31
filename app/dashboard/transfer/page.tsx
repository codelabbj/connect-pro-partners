"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Send, Search, User, CheckCircle, AlertCircle, CreditCard } from "lucide-react"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

type Partner = {
  uid: string
  email: string | null
  phone: string | null
  first_name: string
  last_name: string
  is_active: boolean
  is_staff: boolean
  email_verified: boolean
  phone_verified: boolean
  display_name: string
  contact_method: string
  created_at: string
  last_login_at: string | null
  is_partner: boolean
  pending_codes_count: number
  total_reset_attempts: number
  total_transactions: number
  completed_transactions: number
  total_transaction_amount: string | null
  total_commissions_received: string | null
  pending_recharges: number
  account_balance: number
  account_is_active: boolean
  account_is_frozen: boolean
  last_commission_date: string | null
  last_transaction_date: string | null
}

type Transfer = {
  uid: string
  reference: string
  sender: number
  sender_name: string
  sender_email: string
  receiver: number
  receiver_name: string
  receiver_email: string
  amount: string
  fees: string
  status: string
  description: string
  sender_balance_before: string
  sender_balance_after: string
  receiver_balance_before: string
  receiver_balance_after: string
  completed_at: string
  failed_reason: string
  created_at: string
  updated_at: string
}

export default function TransferPage() {
  const apiFetch = useApi()
  const { toast } = useToast()

  // Transfer form state
  const [receiverUid, setReceiverUid] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  // Partner search state
  const [searchQuery, setSearchQuery] = useState("")
  const [partners, setPartners] = useState<Partner[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [showPartnerDialog, setShowPartnerDialog] = useState(false)

  // Transfer history and stats state
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [transferStats, setTransferStats] = useState<any>(null)
  const [transfersLoading, setTransfersLoading] = useState(true)
  const [error, setError] = useState("")

  // Search for partners
  const searchPartners = async (query: string) => {
    if (!query.trim()) {
      setPartners([])
      return
    }

    setSearchLoading(true)
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auth/users/search/`
      const params = new URLSearchParams({
        search: query.trim()
      })
      
      const data = await apiFetch(`${endpoint}?${params}`)
      // Convert user search results to partner format for compatibility
      const userResults = data.results || []
      const partnerResults = userResults.map((user: any) => ({
        uid: user.uid,
        display_name: user.display_name,
        email: null,
        phone: null,
        first_name: user.display_name.split(' ')[0] || '',
        last_name: user.display_name.split(' ').slice(1).join(' ') || '',
        is_active: true,
        is_staff: false,
        email_verified: false,
        phone_verified: false,
        contact_method: '',
        created_at: '',
        last_login_at: null,
        is_partner: true,
        pending_codes_count: 0,
        total_reset_attempts: 0,
        total_transactions: 0,
        completed_transactions: 0,
        total_transaction_amount: null,
        total_commissions_received: null,
        pending_recharges: 0,
        account_balance: 0,
        account_is_active: true,
        account_is_frozen: false,
        last_commission_date: null,
        last_transaction_date: null
      }))
      setPartners(partnerResults)
    } catch (err: any) {
      toast({
        title: "Erreur de recherche",
        description: "Impossible de rechercher les utilisateurs. Veuillez saisir un nom existant.",
        variant: "destructive"
      })
    } finally {
      setSearchLoading(false)
    }
  }

  // Handle partner selection
  const selectPartner = (partner: Partner) => {
    setSelectedPartner(partner)
    setReceiverUid(partner.uid)
    setReceiverName(`${partner.first_name} ${partner.last_name}`)
    setShowPartnerDialog(false)
    setSearchQuery(partner.display_name)
    setPartners([])
  }

  // Add receiver name state (using partner's display name)
  const [receiverName, setReceiverName] = useState("")

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== (selectedPartner?.display_name || "")) {
        searchPartners(searchQuery)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch transfer history and stats
  const fetchTransfersAndStats = async () => {
    setTransfersLoading(true)
    setError("")
    try {
      const [transfersRes, statsRes] = await Promise.all([
        apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/transfers/?type=sent&status=completed&ordering=-created_at&date_from=2025-01-01&date_to=${new Date().toISOString().split('T')[0]}`),
        apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/transfers/my_transfers`)
      ])
      
      setTransfers(transfersRes.transfers || [])
      setTransferStats(statsRes)
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setError(errorMessage)
    } finally {
      setTransfersLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchTransfersAndStats()
  }, [])

  // Handle transfer submission
  const handleTransfer = async () => {
    if (!receiverUid || !amount || !description) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/transfers/`
      const payload = {
        receiver_uid: receiverUid,
        amount: amount,
        description: description
      }

      const data = await apiFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      toast({
        title: "Transfert réussi",
        description: data.message || "Le transfert a été effectué avec succès.",
        variant: "default"
      })

      // Reset form
      setReceiverUid("")
      setSearchQuery("")
      setSelectedPartner(null)
      setReceiverName("")
      setAmount("")
      setDescription("")

      // Refresh data
      fetchTransfersAndStats()
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      toast({
        title: "Erreur de transfert",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setSelectedPartner(null)
    setReceiverUid("")
    setReceiverName("")
    setPartners([])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transferts UV</h1>
        <p className="text-muted-foreground">
          Envoyez de l'argent rapidement et facilement à d'autres partenaires
        </p>
      </div>

      {/* Transfer Stats Cards */}
      {transferStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total envoyé</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transferStats.summary?.amount_sent?.toLocaleString()} FCFA</div>
              <p className="text-xs text-muted-foreground">
                {transferStats.summary?.total_sent} transferts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total reçu</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transferStats.summary?.amount_received?.toLocaleString()} FCFA</div>
              <p className="text-xs text-muted-foreground">
                {transferStats.summary?.total_received} transferts
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transfer Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Envoyer de l'argent
          </CardTitle>
          <CardDescription>
            Saisissez les informations nécessaires pour effectuer un transfert
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Partner Search */}
          <div className="space-y-2">
            <Label htmlFor="receiver">Destinataire</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="receiver"
                placeholder="Rechercher un partenaire..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {selectedPartner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1 h-8"
                >
                  ✕
                </Button>
              )}
            </div>

            {/* Partner Results */}
            {searchLoading && (
              <div className="text-sm text-muted-foreground">Recherche en cours...</div>
            )}
            
            {partners.length > 0 && !searchLoading && (
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                {partners.map((partner) => (
                  <div
                    key={partner.uid}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => selectPartner(partner)}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium text-sm">{partner.display_name}</div>
                        <div className="text-xs text-gray-500">
                          {partner.email || partner.phone} • Solde: {partner.account_balance?.toLocaleString()} FCFA
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={partner.is_active ? "default" : "destructive"} className="text-xs">
                            {partner.is_active ? "Actif" : "Inactif"}
                          </Badge>
                          {partner.account_is_active && (
                            <Badge variant="secondary" className="text-xs">
                              Compte actif
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedPartner?.uid === partner.uid && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {searchQuery && partners.length === 0 && !searchLoading && (
              <div className="text-sm text-red-500">
                Veuillez saisir un nom existant. Aucun partenaire trouvé.
              </div>
            )}

            {selectedPartner && (
              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium text-green-900">{selectedPartner.display_name}</div>
                  <div className="text-xs text-green-600">
                    {selectedPartner.email || selectedPartner.phone}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Montant (FCFA)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Remboursement dîner..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleTransfer} 
            disabled={loading || !receiverUid || !amount || !description}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Envoyer l'argent
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Transfer History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des transferts</CardTitle>
          <CardDescription>
            Vue d'ensemble de vos transferts envoyés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transfersLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement de l'historique...
            </div>
          ) : error ? (
            <ErrorDisplay error={error} onRetry={fetchTransfersAndStats} />
          ) : transfers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun transfert trouvé
            </div>
          ) : (
            <div className="space-y-4">
              {transfers.slice(0, 10).map((transfer) => (
                <div key={transfer.uid} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{transfer.receiver_name}</div>
                    <div className="text-sm text-muted-foreground">{transfer.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(transfer.created_at).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{parseFloat(transfer.amount).toLocaleString()} FCFA</div>
                    <Badge variant={transfer.status === 'completed' ? 'default' : 'destructive'}>
                      {
                        transfer.status === 'completed' ? 'Terminé' : 
                        transfer.status === 'pending' ? 'En attente' : 'Échoué'
                      }
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      Ref: {transfer.reference}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
