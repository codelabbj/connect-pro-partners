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
import { Search, ArrowUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"


const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function NetworkListPage() {
  const [networks, setNetworks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [countryFilter, setCountryFilter] = useState("all")
  const [countries, setCountries] = useState<any[]>([])
  const [sortField, setSortField] = useState<"nom" | "code" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState(""); // NEW: for input control
  const [currentPage, setCurrentPage] = useState(1)
  

  useEffect(() => {
    const fetchNetworks = async () => {
      setLoading(true)
      setError("")
      try {
        let endpoint = "";
        if (searchTerm.trim() !== "" || statusFilter !== "all" || countryFilter !== "all" || sortField) {
          const params = new URLSearchParams({
            page: "1",
            page_size: "100",
          });
          if (searchTerm.trim() !== "") {
            params.append("search", searchTerm);
          }
          if (statusFilter !== "all") {
            params.append("is_active", statusFilter === "active" ? "true" : "false");
          }
          if (countryFilter !== "all") {
            params.append("country", countryFilter);
          }
          if (sortField) {
            params.append("order_by", `${sortField}:${sortDirection}`);
          }
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
        const errorMessage = extractErrorMessages(err) || t("network.failedToLoad")
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
  }, [searchTerm, statusFilter, countryFilter, sortField, sortDirection])

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
        const errorMessage = extractErrorMessages(err) || t("network.failedToLoadCountries")
        console.error('Countries fetch error:', err)
        setCountries([])
        toast({
          title: t("network.countriesFailedToLoad"),
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
    
    fetchCountries()
  }, [])

  // Remove client-side filtering since it's now handled by the API
  const filteredNetworks = networks

  const handleSort = (field: "nom" | "code") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Update searchTerm only when user submits
  const handleSearchSubmit = () => {
    setSearchTerm(searchInput.trim());
    setCurrentPage(1); // Reset to first page on new search
  };

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
              value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit();
                }}
                onBlur={handleSearchSubmit}
                className="pl-10"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={handleSearchSubmit}
              >
                {t("common.search")}
              </Button>
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
          <ErrorDisplay
            error={error}
            onRetry={() => {
              setError("")
              // This will trigger the useEffect to refetch
            }}
            variant="inline"
            className="mb-6"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("nom")} className="h-auto p-0 font-semibold">
                    {t("network.name")}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("code")} className="h-auto p-0 font-semibold">
                    {t("network.code")}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
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