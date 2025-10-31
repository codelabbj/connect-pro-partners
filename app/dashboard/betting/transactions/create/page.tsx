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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, RefreshCw, Plus, CheckCircle, AlertCircle, Loader2, Gamepad2, DollarSign, User, CreditCard } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { BettingPlatform, CreateDepositRequest, CreateWithdrawalRequest, CreateTransactionResponse, VerifyUserIdResponse, ExternalPlatformData } from "@/lib/types/betting"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { getExternalPlatformData, fetchExternalPlatforms, matchExternalPlatform } from "@/lib/utils/externalPlatform"
import { MapPin } from "lucide-react"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

function CreateTransactionContent() {
  const { t } = useLanguage()
  const apiFetch = useApi()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const selectedPlatformUid = searchParams.get('platform')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [platforms, setPlatforms] = useState<BettingPlatform[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState<BettingPlatform | null>(null)
  const [externalData, setExternalData] = useState<ExternalPlatformData | null>(null)
  const [externalPlatforms, setExternalPlatforms] = useState<ExternalPlatformData[]>([])
  const [activeTab, setActiveTab] = useState("deposit")

  // Form states
  const [bettingUserId, setBettingUserId] = useState("")
  const [amount, setAmount] = useState("")
  const [withdrawalCode, setWithdrawalCode] = useState("")
  const [userIdValidation, setUserIdValidation] = useState<{
    loading: boolean;
    valid: boolean | null;
    userInfo: VerifyUserIdResponse | null;
    error: string;
  }>({
    loading: false,
    valid: null,
    userInfo: null,
    error: ""
  })
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  const fetchPlatforms = async () => {
    setLoading(true)
    setError("")
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/platforms/platforms_with_permissions/`
      const data = await apiFetch(endpoint)
      setPlatforms(data.authorized_platforms || [])
      
      // Set selected platform if provided in URL
      if (selectedPlatformUid) {
        const platform = data.authorized_platforms?.find((p: BettingPlatform) => p.uid === selectedPlatformUid)
        if (platform) {
          setSelectedPlatform(platform)
        }
      }
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setError(errorMessage)
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchExternalPlatformsData = async () => {
    try {
      const data = await fetchExternalPlatforms()
      setExternalPlatforms(data)
    } catch (err: any) {
      console.error("Failed to fetch external platforms:", err)
    }
  }

  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([
        fetchPlatforms(),
        fetchExternalPlatformsData()
      ])
    }
    fetchAll()
  }, [])

  const getExternalData = (platform: BettingPlatform): ExternalPlatformData | null => {
    return matchExternalPlatform(platform.external_id, externalPlatforms)
  }

  useEffect(() => {
    const fetchExternalData = async () => {
      if (selectedPlatform?.external_id) {
        try {
          const data = await getExternalPlatformData(selectedPlatform.external_id)
          setExternalData(data)
        } catch (err: any) {
          console.error("Failed to fetch external platform data:", err)
          setExternalData(null)
        }
      } else {
        setExternalData(null)
      }
    }
    fetchExternalData()
  }, [selectedPlatform?.external_id])

  const verifyUserId = async (platformUid: string, userId: string) => {
    if (!userId || !platformUid) return

    setUserIdValidation({ loading: true, valid: null, userInfo: null, error: "" })
    
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/transactions/verify_user_id/`
      const payload = {
        platform_uid: platformUid,
        betting_user_id: parseInt(userId)
      }
      
      const data: VerifyUserIdResponse = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (data.UserId === 0) {
        setUserIdValidation({
          loading: false,
          valid: false,
          userInfo: null,
          error: "ID de parieur invalide"
        })
      } else {
        setUserIdValidation({
          loading: false,
          valid: true,
          userInfo: data,
          error: ""
        })
      }
    } catch (err: any) {
      setUserIdValidation({
        loading: false,
        valid: false,
        userInfo: null,
        error: extractErrorMessages(err)
      })
    }
  }

  const handleUserIdChange = (value: string) => {
    setBettingUserId(value)
    if (selectedPlatform && value) {
      // Debounce the verification
      const timeoutId = setTimeout(() => {
        verifyUserId(selectedPlatform.uid, value)
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlatform || !bettingUserId || !amount) return

    setSubmitting(true)
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/transactions/create_deposit/`
      const payload: CreateDepositRequest = {
        platform_uid: selectedPlatform.uid,
        betting_user_id: bettingUserId,
        amount: amount
      }

      const data: CreateTransactionResponse = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      toast({ 
        title: "Succès", 
        description: data.message || "Dépôt créé avec succès",
        variant: "default"
      })

      // Reset form
      setAmount("")
      setBettingUserId("")
      setUserIdValidation({ loading: false, valid: null, userInfo: null, error: "" })
      setFormErrors({})

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

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlatform || !bettingUserId || !withdrawalCode) return

    setSubmitting(true)
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/transactions/create_withdrawal/`
      const payload: CreateWithdrawalRequest = {
        platform_uid: selectedPlatform.uid,
        betting_user_id: bettingUserId,
        withdrawal_code: withdrawalCode
      }

      const data: CreateTransactionResponse = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      toast({ 
        title: "Succès", 
        description: data.message || "Retrait créé avec succès",
        variant: "default"
      })

      // Reset form
      setWithdrawalCode("")
      setBettingUserId("")
      setUserIdValidation({ loading: false, valid: null, userInfo: null, error: "" })
      setFormErrors({})

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

  const isFormValid = () => {
    return selectedPlatform && 
           bettingUserId && 
           userIdValidation.valid && 
           ((activeTab === "deposit" && amount) || (activeTab === "withdrawal" && withdrawalCode))
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
          {[...Array(2)].map((_, i) => (
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
        <ErrorDisplay error={error} variant="full" onRetry={fetchPlatforms} />
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nouvelle Transaction</h1>
            <p className="text-muted-foreground">Créer une nouvelle transaction de paris</p>
          </div>
        </div>
        <Button onClick={fetchPlatforms} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Platform Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Sélectionner la Plateforme
            </CardTitle>
            <CardDescription>Choisissez la plateforme de paris</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedPlatform?.uid || ""} onValueChange={(value) => {
              const platform = platforms.find(p => p.uid === value)
              setSelectedPlatform(platform || null)
              setBettingUserId("")
              setUserIdValidation({ loading: false, valid: null, userInfo: null, error: "" })
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une plateforme" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => {
                  const extData = getExternalData(platform)
                  const displayImage = extData?.image || platform.logo
                  const displayName = extData?.public_name || platform.name
                  
                  return (
                    <SelectItem key={platform.uid} value={platform.uid}>
                      <div className="flex items-center gap-2">
                        {displayImage ? (
                          <img 
                            src={displayImage} 
                            alt={displayName}
                            className="h-6 w-6 rounded object-cover"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                            <Gamepad2 className="h-3 w-3" />
                          </div>
                        )}
                        <span>{displayName}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            {selectedPlatform && (
              <div className="mt-4 space-y-3">
                {/* Platform Logo */}
                <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                  {(externalData?.image || selectedPlatform.logo) ? (
                    <img 
                      src={externalData?.image || selectedPlatform.logo || ""} 
                      alt={selectedPlatform.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                      <Gamepad2 className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Platform Name */}
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{externalData?.public_name || selectedPlatform.name}</h3>
                </div>

                {/* Location Information */}
                {(externalData?.city || externalData?.street) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>
                      {externalData.city}{externalData.street ? `, ${externalData.street}` : ''}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Badge variant={selectedPlatform.is_active ? "default" : "destructive"}>
                    {selectedPlatform.is_active ? "Actif" : "Inactif"}
                  </Badge>
                  <Badge variant="default">Autorisé</Badge>
                </div>

                <div className="text-sm space-y-2">
                  <div>
                    <p className="text-muted-foreground">Dépôt min/max</p>
                    <p className="font-semibold">
                      {formatAmount(selectedPlatform.min_deposit_amount)} - {formatAmount(selectedPlatform.max_deposit_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Retrait min/max</p>
                    <p className="font-semibold">
                      {formatAmount(selectedPlatform.min_withdrawal_amount)} - {formatAmount(selectedPlatform.max_withdrawal_amount)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className={`px-2 py-1 rounded text-xs ${selectedPlatform.can_deposit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    Dépôts: {selectedPlatform.can_deposit ? 'Oui' : 'Non'}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${selectedPlatform.can_withdraw ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    Retraits: {selectedPlatform.can_withdraw ? 'Oui' : 'Non'}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Forms */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Créer une Transaction
            </CardTitle>
            <CardDescription>Remplissez les détails de la transaction</CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedPlatform ? (
              <div className="text-center py-8">
                <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sélectionnez une plateforme</h3>
                <p className="text-muted-foreground">Veuillez d'abord sélectionner une plateforme pour continuer.</p>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="deposit" disabled={!selectedPlatform.can_deposit}>
                    Dépôt
                  </TabsTrigger>
                  <TabsTrigger value="withdrawal" disabled={!selectedPlatform.can_withdraw}>
                    Retrait
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="deposit" className="space-y-4">
                  <form onSubmit={handleDepositSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="bettingUserId">ID du Parieur</Label>
                      <div className="relative">
                        <Input
                          id="bettingUserId"
                          type="number"
                          placeholder="Entrez l'ID du parieur"
                          value={bettingUserId}
                          onChange={(e) => {
                            handleUserIdChange(e.target.value)
                            // Clear betting_user_id error when user types
                            if (formErrors.betting_user_id) {
                              setFormErrors(prev => ({ ...prev, betting_user_id: "" }))
                            }
                          }}
                          className={userIdValidation.valid === false ? "border-red-500" : userIdValidation.valid === true ? "border-green-500" : formErrors.betting_user_id ? "border-red-500" : ""}
                        />
                        {userIdValidation.loading && (
                          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                        )}
                        {userIdValidation.valid === true && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                        )}
                        {userIdValidation.valid === false && (
                          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                        )}
                      </div>
                      {userIdValidation.error && (
                        <p className="text-sm text-red-500 mt-1">{userIdValidation.error}</p>
                      )}
                      {formErrors.betting_user_id && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.betting_user_id}</p>
                      )}
                      {userIdValidation.userInfo && (
                        <Alert className="mt-2">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Utilisateur vérifié: <strong>{userIdValidation.userInfo.Name}</strong>
                          </AlertDescription>
                        </Alert>
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
                          // Clear amount error when user types
                          if (formErrors.amount) {
                            setFormErrors(prev => ({ ...prev, amount: "" }))
                          }
                        }}
                        min={selectedPlatform.min_deposit_amount}
                        max={selectedPlatform.max_deposit_amount}
                        step="0.01"
                        className={formErrors.amount ? "border-red-500" : ""}
                      />
                      {formErrors.amount && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.amount}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Limite: {formatAmount(selectedPlatform.min_deposit_amount)} - {formatAmount(selectedPlatform.max_deposit_amount)}
                      </p>
                    </div>

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
                          Créer le Dépôt
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="withdrawal" className="space-y-4">
                  <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="bettingUserIdWithdrawal">ID du Parieur</Label>
                      <div className="relative">
                        <Input
                          id="bettingUserIdWithdrawal"
                          type="number"
                          placeholder="Entrez l'ID du parieur"
                          value={bettingUserId}
                          onChange={(e) => {
                            handleUserIdChange(e.target.value)
                            // Clear betting_user_id error when user types
                            if (formErrors.betting_user_id) {
                              setFormErrors(prev => ({ ...prev, betting_user_id: "" }))
                            }
                          }}
                          className={userIdValidation.valid === false ? "border-red-500" : userIdValidation.valid === true ? "border-green-500" : formErrors.betting_user_id ? "border-red-500" : ""}
                        />
                        {userIdValidation.loading && (
                          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                        )}
                        {userIdValidation.valid === true && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                        )}
                        {userIdValidation.valid === false && (
                          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                        )}
                      </div>
                      {userIdValidation.error && (
                        <p className="text-sm text-red-500 mt-1">{userIdValidation.error}</p>
                      )}
                      {formErrors.betting_user_id && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.betting_user_id}</p>
                      )}
                      {userIdValidation.userInfo && (
                        <Alert className="mt-2">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            Utilisateur vérifié: <strong>{userIdValidation.userInfo.Name}</strong>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="withdrawalCode">Code de Retrait</Label>
                      <Input
                        id="withdrawalCode"
                        type="text"
                        placeholder="Entrez le code de retrait"
                        value={withdrawalCode}
                        onChange={(e) => {
                          setWithdrawalCode(e.target.value)
                          // Clear withdrawal_code error when user types
                          if (formErrors.withdrawal_code) {
                            setFormErrors(prev => ({ ...prev, withdrawal_code: "" }))
                          }
                        }}
                        className={formErrors.withdrawal_code ? "border-red-500" : ""}
                      />
                      {formErrors.withdrawal_code && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.withdrawal_code}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        Le code de retrait doit être fourni par le parieur depuis sa plateforme.
                      </p>
                    </div>

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
                          Créer le Retrait
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CreateTransactionPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="h-4 bg-muted rounded w-96 mb-6"></div>
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
      <CreateTransactionContent />
    </Suspense>
  )
}
