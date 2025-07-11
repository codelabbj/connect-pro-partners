"use client"
import { useEffect, useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function NetworkListPage() {
  const [networks, setNetworks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [countryFilter, setCountryFilter] = useState("all")
  const [countries, setCountries] = useState<any[]>([])
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();

  useEffect(() => {
    const fetchNetworks = async () => {
      setLoading(true)
      setError("")
      try {
        let endpoint = "";
        if (searchTerm.trim() !== "") {
          const params = new URLSearchParams({
            page: "1",
            page_size: "100",
            search: searchTerm,
          });
          endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/networks/?${params.toString()}`;
        } else {
          const params = new URLSearchParams({
            page: "1",
            page_size: "100",
          });
          endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/networks/?${params.toString()}`;
        }
        const data = await apiFetch(endpoint)
        setNetworks(Array.isArray(data) ? data : data.results || [])
        toast({
          title: t("network.success"),
          description: t("network.loadedSuccessfully"),
        })
      } catch (err: any) {
        const errorMessage = typeof err === "object" && Object.keys(err).length > 0 
          ? JSON.stringify(err, null, 2)
          : err.message || t("network.failedToLoad")
        setError(errorMessage)
        setNetworks([])
        toast({
          title: t("network.failedToLoad"),
          description: errorMessage,
          variant: "destructive",
        })
        console.error('Networks fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchNetworks()
  }, [searchTerm])

  // Fetch countries for filter
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/countries/`)
        setCountries(Array.isArray(data) ? data : data.results || [])
        toast({
          title: t("network.countriesLoaded"),
          description: t("network.countriesLoadedSuccessfully"),
        })
      } catch (err: any) {
        console.error('Countries fetch error:', err)
        setCountries([])
        toast({
          title: t("network.countriesFailedToLoad"),
          description: err.message || t("network.failedToLoadCountries"),
          variant: "destructive",
        })
      }
    }
    
    fetchCountries()
  }, [])

  // Remove client-side search filtering for networks
  const filteredNetworks = useMemo(() => {
    return networks.filter((network) => {
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" && network.is_active) || (statusFilter === "inactive" && !network.is_active)
      const matchesCountry = countryFilter === "all" || network.country === countryFilter || network.country_name === countries.find(c => c.uid === countryFilter)?.nom
      return matchesStatus && matchesCountry
    })
  }, [networks, statusFilter, countryFilter, countries])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-lg font-semibold">{t("common.loading")}</span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("network.list")}</CardTitle>
        <Link href="/dashboard/network/create"><Button className="mt-2">{t("network.add")}</Button></Link>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t("common.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t("network.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="active">{t("network.active")}</SelectItem>
              <SelectItem value="inactive">{t("network.inactive")}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={countryFilter}
            onValueChange={setCountryFilter}
            disabled={loading || countries.length === 0}
          >
            <SelectTrigger className="w-full sm:w-48" aria-label={t("network.country")}> 
              <SelectValue placeholder={loading ? t("common.loading") : t("network.country")} />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>{t("common.loading")}</SelectItem>
              ) : countries.length === 0 ? (
                <SelectItem value="no-countries" disabled>{t("network.noCountries") || "No countries available"}</SelectItem>
              ) : (
                [<SelectItem value="all" key="all">{t("common.all")}</SelectItem>,
                  ...countries.map((country: any) => (
                    <SelectItem key={country.uid} value={country.uid}>
                      {country.nom}
                    </SelectItem>
                  ))
                ]
              )}
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {t("network.errorLoading")}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error.startsWith('{') ? (
                    <pre className="whitespace-pre-wrap bg-red-100 p-2 rounded border text-xs">
                      {error}
                    </pre>
                  ) : (
                    error
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("network.name")}</TableHead>
                <TableHead>{t("network.code")}</TableHead>
                <TableHead>{t("network.country")}</TableHead>
                <TableHead>{t("network.status")}</TableHead>
                <TableHead>{t("network.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNetworks.map((network: any) => (
                <TableRow key={network.uid}>
                  <TableCell>{network.nom}</TableCell>
                  <TableCell>{network.code}</TableCell>
                  <TableCell>{network.country_name || network.country}</TableCell>
                  <TableCell>{network.is_active ? t("network.active") : t("network.inactive")}</TableCell>
                  <TableCell>
                    <Link href={`/dashboard/network/edit/${network.uid}`}><Button size="sm">{t("network.editButton")}</Button></Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
} 