"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering to prevent build-time prerendering issues
export const dynamic = 'force-dynamic'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gamepad2, TrendingUp, TrendingDown, Users, DollarSign, Eye, Plus, RefreshCw, Search } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { BettingPlatform, PlatformWithStats, PlatformPermissionsResponse, PlatformStatsResponse } from "@/lib/types/betting"
import Link from "next/link"
import { StatCard } from "@/components/ui/stat-card"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function BettingPlatformsPage() {
  const { t } = useLanguage()
  const apiFetch = useApi()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [platforms, setPlatforms] = useState<BettingPlatform[]>([])
  const [platformStats, setPlatformStats] = useState<PlatformStatsResponse | null>(null)
  const [permissions, setPermissions] = useState<PlatformPermissionsResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")


  const fetchPlatformStats = async () => {
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/platforms/platforms_with_stats/`
      const data = await apiFetch(endpoint)
      setPlatformStats(data)
    } catch (err: any) {
      console.error("Failed to fetch platform stats:", err)
    }
  }

  const fetchPermissions = async () => {
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/user/platforms/platforms_with_permissions/`
      const data = await apiFetch(endpoint)
      setPermissions(data)
      setPlatforms(data.all_platforms || [])
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setError(errorMessage)
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
    }
  }

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setError("")
      try {
        await Promise.all([
          fetchPlatformStats(),
          fetchPermissions()
        ])
      } catch (err) {
        // Error handling is done in individual functions
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [apiFetch])

  const refreshData = async () => {
    await Promise.all([
      fetchPlatformStats(),
      fetchPermissions()
    ])
    toast({ title: "Données actualisées", description: "Les informations des plateformes ont été mises à jour" })
  }

  const filteredPlatforms = platforms.filter(platform =>
    platform.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (platform: BettingPlatform) => {
    if (!platform.is_active) {
      return <Badge variant="destructive">Inactif</Badge>
    }
    if (platform.permission_is_active) {
      return <Badge variant="default">Autorisé</Badge>
    }
    return <Badge variant="secondary">Non autorisé</Badge>
  }

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString() + " FCFA"
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plateformes de Paris</h1>
          <p className="text-muted-foreground">Gestion des plateformes de paris sportifs</p>
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
        <ErrorDisplay error={error} variant="full" onRetry={refreshData} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Plateformes de Paris</h1>
          <p className="text-muted-foreground">Gestion des plateformes de paris sportifs</p>
        </div>
        <Button onClick={refreshData} disabled={loading} className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      {platformStats && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Plateformes"
            value={platformStats.summary.total_platforms.toString()}
            icon={Gamepad2}
            trend={{ value: `${platformStats.summary.platforms_with_transactions} avec transactions`, isPositive: true }}
          />
          <StatCard
            title="Plateformes Autorisées"
            value={platformStats.summary.authorized_count.toString()}
            icon={Users}
            trend={{ value: `${platformStats.summary.unauthorized_count} non autorisées`, isPositive: platformStats.summary.authorized_count > platformStats.summary.unauthorized_count }}
          />
          <StatCard
            title="Avec Transactions"
            value={platformStats.summary.platforms_with_transactions.toString()}
            icon={TrendingUp}
            trend={{ value: "Plateformes actives", isPositive: true }}
          />
          <StatCard
            title="Commission Totale"
            value={platformStats.authorized_platforms.reduce((sum, p) => sum + p.my_stats.total_commission, 0).toLocaleString() + " FCFA"}
            icon={DollarSign}
            trend={{ value: `${platformStats.authorized_platforms.reduce((sum, p) => sum + p.my_stats.unpaid_commission, 0).toLocaleString()} non payée`, isPositive: false }}
          />
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher une plateforme..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platforms Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Toutes ({platforms.length})</TabsTrigger>
          <TabsTrigger value="authorized">Autorisées ({permissions?.authorized_count || 0})</TabsTrigger>
          <TabsTrigger value="unauthorized">Non autorisées ({permissions?.unauthorized_count || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlatforms.map((platform) => (
              <Card key={platform.uid} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {platform.logo ? (
                        <img 
                          src={platform.logo} 
                          alt={platform.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Gamepad2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <CardDescription className="text-sm">
                          ID: {platform.external_id.slice(0, 8)}...
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(platform)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Dépôt min</p>
                      <p className="font-semibold">{formatAmount(platform.min_deposit_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dépôt max</p>
                      <p className="font-semibold">{formatAmount(platform.max_deposit_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Retrait min</p>
                      <p className="font-semibold">{formatAmount(platform.min_withdrawal_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Retrait max</p>
                      <p className="font-semibold">{formatAmount(platform.max_withdrawal_amount)}</p>
                    </div>
                  </div>
                  
                  {platform.description && (
                    <p className="text-sm text-muted-foreground">{platform.description}</p>
                  )}

                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/dashboard/betting/platforms/${platform.uid}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </Link>
                    </Button>
                    {platform.permission_is_active && (
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/dashboard/betting/transactions/create?platform=${platform.uid}`}>
                          <Plus className="h-4 w-4 mr-2" />
                          Transaction
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="authorized" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {permissions?.authorized_platforms.map((platform) => (
              <Card key={platform.uid} className="hover:shadow-lg transition-shadow border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {platform.logo ? (
                        <img 
                          src={platform.logo} 
                          alt={platform.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <Gamepad2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <CardDescription className="text-sm">
                          Autorisé par {platform.granted_by_name}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="default">Autorisé</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Dépôt min</p>
                      <p className="font-semibold">{formatAmount(platform.min_deposit_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dépôt max</p>
                      <p className="font-semibold">{formatAmount(platform.max_deposit_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Retrait min</p>
                      <p className="font-semibold">{formatAmount(platform.min_withdrawal_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Retrait max</p>
                      <p className="font-semibold">{formatAmount(platform.max_withdrawal_amount)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className={`px-2 py-1 rounded text-xs ${platform.can_deposit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      Dépôts: {platform.can_deposit ? 'Oui' : 'Non'}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${platform.can_withdraw ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      Retraits: {platform.can_withdraw ? 'Oui' : 'Non'}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/dashboard/betting/platforms/${platform.uid}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/dashboard/betting/transactions/create?platform=${platform.uid}`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Transaction
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="unauthorized" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {permissions?.unauthorized_platforms.map((platform) => (
              <Card key={platform.uid} className="hover:shadow-lg transition-shadow border-red-200 dark:border-red-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {platform.logo ? (
                        <img 
                          src={platform.logo} 
                          alt={platform.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                          <Gamepad2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <CardDescription className="text-sm">
                          Non autorisé
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="destructive">Non autorisé</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Dépôt min</p>
                      <p className="font-semibold">{formatAmount(platform.min_deposit_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dépôt max</p>
                      <p className="font-semibold">{formatAmount(platform.max_deposit_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Retrait min</p>
                      <p className="font-semibold">{formatAmount(platform.min_withdrawal_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Retrait max</p>
                      <p className="font-semibold">{formatAmount(platform.max_withdrawal_amount)}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Cette plateforme n'est pas autorisée pour votre compte. Contactez l'administration pour obtenir l'autorisation.
                    </p>
                  </div>
                  
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/dashboard/betting/platforms/${platform.uid}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Voir détails
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredPlatforms.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune plateforme trouvée</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Aucune plateforme ne correspond à votre recherche." : "Aucune plateforme disponible."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
