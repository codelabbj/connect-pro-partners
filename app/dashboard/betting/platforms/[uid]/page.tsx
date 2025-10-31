"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering to prevent build-time prerendering issues
export const dynamic = 'force-dynamic'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gamepad2, ArrowLeft, TrendingUp, TrendingDown, DollarSign, Users, Calendar, RefreshCw, Plus, Eye } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { BettingPlatform, PlatformWithStats, ExternalPlatformData } from "@/lib/types/betting"
import Link from "next/link"
import { useParams } from "next/navigation"
import { StatCard } from "@/components/ui/stat-card"
import { getExternalPlatformData } from "@/lib/utils/externalPlatform"
import { MapPin, ExternalLink, BookOpen } from "lucide-react"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function PlatformDetailPage() {
  const { t } = useLanguage()
  const apiFetch = useApi()
  const { toast } = useToast()
  const params = useParams()
  const platformUid = params.uid as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [platform, setPlatform] = useState<BettingPlatform | null>(null)
  const [platformStats, setPlatformStats] = useState<PlatformWithStats | null>(null)
  const [externalData, setExternalData] = useState<ExternalPlatformData | null>(null)

  const fetchPlatformDetail = async () => {
    setLoading(true)
    setError("")
    try {
      // First try to get platform from permissions API
      const permissionsEndpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/platforms/platforms_with_permissions/`
      const permissionsData = await apiFetch(permissionsEndpoint)
      
      // Find the platform by uid in all_platforms
      const foundPlatform = permissionsData.all_platforms?.find((p: BettingPlatform) => p.uid === platformUid)
      
      if (foundPlatform) {
        setPlatform(foundPlatform)
      } else {
        setError("Plateforme non trouvée")
      }
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setError(errorMessage)
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchPlatformStats = async () => {
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/platforms/platforms_with_stats/`
      const data = await apiFetch(endpoint)
      const platformWithStats = data.authorized_platforms.find((p: PlatformWithStats) => p.uid === platformUid)
      if (platformWithStats) {
        setPlatformStats(platformWithStats)
      }
    } catch (err: any) {
      console.error("Failed to fetch platform stats:", err)
    }
  }

  const fetchExternalData = async (externalId: string) => {
    try {
      const data = await getExternalPlatformData(externalId)
      if (data) {
        setExternalData(data)
      }
    } catch (err: any) {
      console.error("Failed to fetch external platform data:", err)
    }
  }

  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([
        fetchPlatformDetail(),
        fetchPlatformStats()
      ])
    }
    fetchAll()
  }, [platformUid, apiFetch])

  useEffect(() => {
    if (platform?.external_id) {
      fetchExternalData(platform.external_id)
    }
  }, [platform?.external_id])

  const refreshData = async () => {
    await Promise.all([
      fetchPlatformDetail(),
      fetchPlatformStats()
    ])
    toast({ title: "Données actualisées", description: "Les informations de la plateforme ont été mises à jour" })
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
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/betting/platforms">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64"></div>
          </div>
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
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/betting/platforms">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
        </div>
        <ErrorDisplay error={error} variant="full" onRetry={fetchPlatformDetail} />
      </div>
    )
  }

  if (!platform) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/betting/platforms">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Plateforme non trouvée</h3>
            <p className="text-muted-foreground">Cette plateforme n'existe pas ou vous n'y avez pas accès.</p>
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
            <Link href="/dashboard/betting/platforms">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            {(externalData?.image || platform.logo) ? (
              <img 
                src={externalData?.image || platform.logo || ""} 
                alt={platform.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{externalData?.public_name || platform.name}</h1>
              <p className="text-muted-foreground">Détails de la plateforme</p>
            </div>
          </div>
        </div>
        <Button onClick={refreshData} disabled={loading} className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Platform Stats */}
      {platformStats && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Transactions"
            value={platformStats.my_stats.total_transactions.toString()}
            icon={TrendingUp}
            trend={{ value: `${platformStats.my_stats.successful_transactions} réussies`, isPositive: true }}
          />
          <StatCard
            title="Transactions Réussies"
            value={platformStats.my_stats.successful_transactions.toString()}
            icon={Users}
            trend={{ value: `${((platformStats.my_stats.successful_transactions / platformStats.my_stats.total_transactions) * 100).toFixed(1)}% de réussite`, isPositive: true }}
          />
          <StatCard
            title="Montant Total"
            value={platformStats.my_stats.total_amount.toLocaleString() + " FCFA"}
            icon={DollarSign}
            trend={{ value: "Volume traité", isPositive: true }}
          />
          <StatCard
            title="Commission Totale"
            value={platformStats.my_stats.total_commission.toLocaleString() + " FCFA"}
            icon={TrendingDown}
            trend={{ value: `${platformStats.my_stats.unpaid_commission.toLocaleString()} non payée`, isPositive: false }}
          />
        </div>
      )}

      {/* Platform Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Informations Générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom</p>
                <p className="font-semibold">{platform.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID Externe</p>
                <p className="font-semibold font-mono text-xs">{platform.external_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <Badge variant={platform.is_active ? "default" : "destructive"}>
                  {platform.is_active ? "Actif" : "Inactif"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Autorisation</p>
                <Badge variant={platform.permission_is_active ? "default" : "secondary"}>
                  {platform.permission_is_active ? "Autorisé" : "Non autorisé"}
                </Badge>
              </div>
            </div>

            {platform.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{platform.description}</p>
              </div>
            )}

            {platform.granted_by_name && (
              <div>
                <p className="text-sm text-muted-foreground">Autorisé par</p>
                <p className="font-semibold">{platform.granted_by_name}</p>
              </div>
            )}

            {platform.permission_granted_at && (
              <div>
                <p className="text-sm text-muted-foreground">Date d'autorisation</p>
                <p className="font-semibold">{formatDate(platform.permission_granted_at)}</p>
              </div>
            )}

            {/* External Platform Location Data */}
            {(externalData?.city || externalData?.street) && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Localisation
                </p>
                <p className="font-semibold">
                  {externalData.city}{externalData.street ? `, ${externalData.street}` : ''}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Limites de Transaction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Dépôts</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Montant minimum</p>
                    <p className="font-semibold">{formatAmount(platform.min_deposit_amount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Montant maximum</p>
                    <p className="font-semibold">{formatAmount(platform.max_deposit_amount)}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant={platform.can_deposit ? "default" : "destructive"}>
                    {platform.can_deposit ? "Dépôts autorisés" : "Dépôts non autorisés"}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-red-600 mb-2">Retraits</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Montant minimum</p>
                    <p className="font-semibold">{formatAmount(platform.min_withdrawal_amount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Montant maximum</p>
                    <p className="font-semibold">{formatAmount(platform.max_withdrawal_amount)}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <Badge variant={platform.can_withdraw ? "default" : "destructive"}>
                    {platform.can_withdraw ? "Retraits autorisés" : "Retraits non autorisés"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* External Platform Information */}
      {externalData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Informations Externes
            </CardTitle>
            <CardDescription>Données complémentaires de la plateforme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {externalData.city && (
                <div>
                  <p className="text-sm text-muted-foreground">Ville</p>
                  <p className="font-semibold">{externalData.city}</p>
                </div>
              )}
              {externalData.street && (
                <div>
                  <p className="text-sm text-muted-foreground">Rue</p>
                  <p className="font-semibold">{externalData.street}</p>
                </div>
              )}
              {externalData.minimun_deposit && (
                <div>
                  <p className="text-sm text-muted-foreground">Dépôt minimum (externe)</p>
                  <p className="font-semibold">{externalData.minimun_deposit.toLocaleString()} FCFA</p>
                </div>
              )}
              {externalData.max_deposit && (
                <div>
                  <p className="text-sm text-muted-foreground">Dépôt maximum (externe)</p>
                  <p className="font-semibold">{externalData.max_deposit.toLocaleString()} FCFA</p>
                </div>
              )}
            </div>

            {/* Tutorial Content */}
            {externalData.deposit_tuto_content && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Guide de Dépôt
                </h4>
                <div 
                  className="text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: externalData.deposit_tuto_content }}
                />
                {externalData.deposit_link && (
                  <Button asChild variant="outline" size="sm" className="mt-2">
                    <a href={externalData.deposit_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Lien de dépôt
                    </a>
                  </Button>
                )}
              </div>
            )}

            {externalData.withdrawal_tuto_content && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Guide de Retrait
                </h4>
                <div 
                  className="text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: externalData.withdrawal_tuto_content }}
                />
                {externalData.withdrawal_link && (
                  <Button asChild variant="outline" size="sm" className="mt-2">
                    <a href={externalData.withdrawal_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Lien de retrait
                    </a>
                  </Button>
                )}
              </div>
            )}

            {externalData.why_withdrawal_fail && (
              <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h4 className="font-semibold mb-2">Pourquoi les retraits échouent</h4>
                <p className="text-sm text-muted-foreground">{externalData.why_withdrawal_fail}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Gérer les transactions pour cette plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href={`/dashboard/betting/transactions?platform=${platform.uid}`}>
                <Eye className="h-4 w-4 mr-2" />
                Voir les Transactions
              </Link>
            </Button>
            {platform.permission_is_active && (
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/dashboard/betting/transactions/create?platform=${platform.uid}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Transaction
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/dashboard/betting/commissions?platform=${platform.uid}`}>
                <DollarSign className="h-4 w-4 mr-2" />
                Voir les Commissions
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
