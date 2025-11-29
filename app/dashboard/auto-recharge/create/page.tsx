"use client"

import { useState, useEffect, Suspense } from "react"

// Force dynamic rendering to prevent build-time prerendering issues
export const dynamic = 'force-dynamic'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, RefreshCw, Plus, CheckCircle, AlertCircle, Loader2, Phone, DollarSign, Wifi } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { AvailableNetwork, AvailableNetworksResponse, InitiateAutoRechargeRequest, InitiateAutoRechargeResponse } from "@/lib/types/auto-recharge"
import Link from "next/link"
import { useRouter } from "next/navigation"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

function CreateAutoRechargeContent() {
  const { t } = useLanguage()
  const apiFetch = useApi()
  const { toast } = useToast()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [networks, setNetworks] = useState<AvailableNetwork[]>([])
  const [selectedNetwork, setSelectedNetwork] = useState<AvailableNetwork | null>(null)
  
  // Form states
  const [phoneNumber, setPhoneNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  const fetchNetworks = async () => {
    setLoading(true)
    setError("")
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auto-recharge/available-networks/`
      const data: AvailableNetworksResponse = await apiFetch(endpoint)
      setNetworks(data.networks || [])
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setError(errorMessage)
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNetworks()
  }, [])

  useEffect(() => {
    if (selectedNetwork) {
      // Validate amount against min/max when network is selected
      const amountNum = parseFloat(amount)
      if (amount && (amountNum < parseFloat(selectedNetwork.min_amount) || amountNum > parseFloat(selectedNetwork.max_amount))) {
        setFormErrors(prev => ({
          ...prev,
          amount: `Le montant doit être entre ${parseFloat(selectedNetwork.min_amount).toLocaleString()} et ${parseFloat(selectedNetwork.max_amount).toLocaleString()} FCFA`
        }))
      } else if (formErrors.amount) {
        setFormErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.amount
          return newErrors
        })
      }
    }
  }, [selectedNetwork, amount])

  const handleNetworkChange = (networkUid: string) => {
    const network = networks.find(n => n.network.uid === networkUid)
    setSelectedNetwork(network || null)
    setAmount("") // Reset amount when network changes
    setFormErrors({})
  }

  const calculateFees = () => {
    if (!selectedNetwork || !amount) return { fixed: 0, percentage: 0, total: 0 }
    const amountNum = parseFloat(amount)
    const fixedFee = parseFloat(selectedNetwork.fixed_fee)
    const percentageFee = (amountNum * parseFloat(selectedNetwork.percentage_fee)) / 100
    const totalFees = fixedFee + percentageFee
    return { fixed: fixedFee, percentage: percentageFee, total: totalFees }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedNetwork || !phoneNumber || !amount) return

    setSubmitting(true)
    setFormErrors({})
    
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auto-recharge/initiate/`
      const payload: InitiateAutoRechargeRequest = {
        network: selectedNetwork.network.uid,
        amount: parseFloat(amount),
        phone_number: phoneNumber
      }

      const data: InitiateAutoRechargeResponse = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log("Auto-recharge response:", data)

      // Check if transaction actually failed despite API success
      const transactionStatus = data.transaction?.status
      const hasError = transactionStatus === 'failed'

      if (hasError && data.transaction?.failed_reason) {
        // Transaction failed - show error
        console.log("Showing transaction error:", data.transaction.failed_reason)
        toast({ 
          title: "Échec", 
          description: data.transaction.failed_reason,
          variant: "destructive"
        })
      } else if (data.success) {
        // Transaction succeeded
        console.log("Showing success message")
        toast({ 
          title: "Succès", 
          description: data.message || "Recharge initiée avec succès",
          variant: "default"
        })
        
        // Redirect to transaction detail page
        if (data.transaction?.uid) {
          router.push(`/dashboard/auto-recharge/${data.transaction.uid}`)
        } else {
          // Reset form if no redirect
          setPhoneNumber("")
          setAmount("")
          setSelectedNetwork(null)
        }
      } else {
        // API returned failure
        console.log("Showing API error")
        toast({ 
          title: "Erreur", 
          description: data.message || "Échec de l'initiation de la recharge",
          variant: "destructive"
        })
      }
    } catch (err: any) {
      setFormErrors({})
      if (err && typeof err === 'object') {
        // Handle field-specific validation errors
        const fieldErrors: {[key: string]: string} = {}
        Object.keys(err).forEach(key => {
          if (Array.isArray(err[key])) {
            fieldErrors[key] = err[key][0] // Take first error message
          } else if (typeof err[key] === 'string') {
            fieldErrors[key] = err[key]
          }
        })
        
        if (Object.keys(fieldErrors).length > 0) {
          setFormErrors(fieldErrors)
        } else {
          const errorMessage = extractErrorMessages(err)
          toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
        }
      } else {
        const errorMessage = extractErrorMessages(err)
        toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString() + " FCFA"
  }

  const fees = calculateFees()
  const totalAmount = amount ? (parseFloat(amount) + fees.total).toFixed(2) : "0"

  const isFormValid = () => {
    if (!selectedNetwork || !phoneNumber || !amount) return false
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum)) return false
    if (amountNum < parseFloat(selectedNetwork.min_amount) || amountNum > parseFloat(selectedNetwork.max_amount)) return false
    return true
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
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
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
        <ErrorDisplay error={error} variant="full" onRetry={fetchNetworks} />
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nouvelle Auto-Recharge</h1>
            <p className="text-muted-foreground">Initier une nouvelle transaction d'auto-recharge</p>
          </div>
        </div>
        <Button onClick={fetchNetworks} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Network Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Sélectionner le Réseau
            </CardTitle>
            <CardDescription>Choisissez le réseau mobile</CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedNetwork?.network.uid || ""} 
              onValueChange={handleNetworkChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un réseau" />
              </SelectTrigger>
              <SelectContent>
                {networks.map((network) => (
                  <SelectItem key={network.network.uid} value={network.network.uid}>
                    <div className="flex items-center gap-2">
                      {network.network.image ? (
                        <img 
                          src={network.network.image} 
                          alt={network.network.nom}
                          className="h-6 w-6 rounded object-cover"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                          <Wifi className="h-3 w-3" />
                        </div>
                      )}
                      <span>{network.network.nom}</span>
                      <span className="text-xs text-muted-foreground">({network.network.country_name})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedNetwork && (
              <div className="mt-4 space-y-3">
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{selectedNetwork.network.nom}</h3>
                  <p className="text-sm text-muted-foreground">{selectedNetwork.network.country_name}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={selectedNetwork.network.is_active ? "default" : "destructive"}>
                    {selectedNetwork.network.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </div>

                <div className="text-sm space-y-2">
                  <div>
                    <p className="text-muted-foreground">Montant min/max</p>
                    <p className="font-semibold">
                      {formatAmount(selectedNetwork.min_amount)} - {formatAmount(selectedNetwork.max_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Frais</p>
                    <p className="font-semibold">
                      {selectedNetwork.fixed_fee} FCFA + {selectedNetwork.percentage_fee}%
                    </p>
                  </div>
                  {selectedNetwork.network.ussd_base_code && (
                    <div>
                      <p className="text-muted-foreground">Code USSD</p>
                      <p className="font-mono font-semibold">{selectedNetwork.network.ussd_base_code}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recharge Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Créer une Auto-Recharge
            </CardTitle>
            <CardDescription>Remplissez les détails de la recharge</CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedNetwork ? (
              <div className="text-center py-8">
                <Wifi className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sélectionnez un réseau</h3>
                <p className="text-muted-foreground">Veuillez d'abord sélectionner un réseau pour continuer.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Ex: 0708958408"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value)
                      if (formErrors.phone_number) {
                        setFormErrors(prev => ({ ...prev, phone_number: "" }))
                      }
                    }}
                    className={formErrors.phone_number ? "border-red-500" : ""}
                  />
                  {formErrors.phone_number && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.phone_number}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="amount">Montant (FCFA)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Entrez le montant"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      if (formErrors.amount) {
                        setFormErrors(prev => ({ ...prev, amount: "" }))
                      }
                    }}
                    min={selectedNetwork.min_amount}
                    max={selectedNetwork.max_amount}
                    step="0.01"
                    className={formErrors.amount ? "border-red-500" : ""}
                  />
                  {formErrors.amount && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.amount}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Limite: {formatAmount(selectedNetwork.min_amount)} - {formatAmount(selectedNetwork.max_amount)}
                  </p>
                </div>

                {/* Fees Calculation */}
                {amount && parseFloat(amount) > 0 && (
                  <Alert>
                    <DollarSign className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Montant:</span>
                          <span className="font-semibold">{formatAmount(amount)}</span>
                        </div>
                        {fees.fixed > 0 && (
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Frais fixes:</span>
                            <span>{formatAmount(fees.fixed.toFixed(2))}</span>
                          </div>
                        )}
                        {fees.percentage > 0 && (
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Frais ({selectedNetwork.percentage_fee}%):</span>
                            <span>{formatAmount(fees.percentage.toFixed(2))}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t">
                          <span className="font-semibold">Total:</span>
                          <span className="font-bold text-lg">{formatAmount(totalAmount)}</span>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  disabled={!isFormValid() || submitting}
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer la Recharge
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CreateAutoRechargePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64"></div>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <CreateAutoRechargeContent />
    </Suspense>
  )
}


