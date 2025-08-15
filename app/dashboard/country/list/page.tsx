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

export default function CountryListPage() {
  const [countries, setCountries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<"nom" | "code" | null>(null)
  const [sortDirection, setSortDirection] = useState<"+" | "-">("-")
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true)
      setError("")
      try {
        let endpoint = "";
        if (searchTerm.trim() !== "" || statusFilter !== "all" || sortField) {
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
          if (sortField) {
            params.append("ordering", `${sortDirection === "+" ? "+" : "-"}${sortField}`);
          }
          // Keep '+' literal for ordering (avoid %2B)
          let query = params.toString().replace(/ordering=%2B/g, "ordering=+");
          endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/countries/?${query}`;
        } else {
          const params = new URLSearchParams({
            page: "1",
            page_size: "100",
          });
          endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/countries/?${params.toString()}`;
        }
        const data = await apiFetch(endpoint)
        setCountries(Array.isArray(data) ? data : data.results || [])
        toast({
          title: t("country.success"),
          description: t("country.loadedSuccessfully"),
        })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err) || t("country.failedToLoad")
        setError(errorMessage)
        setCountries([])
        toast({
          title: t("country.failedToLoad"),
          description: errorMessage,
          variant: "destructive",
        })
        console.error('Countries fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCountries()
  }, [searchTerm, statusFilter, sortField, sortDirection])

  // Remove client-side filtering since it's now handled by the API
  const filteredCountries = countries

  const handleSort = (field: "nom" | "code") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "+" ? "-" : "+"))
      setSortField(field)
    } else {
      setSortField(field)
      setSortDirection("-")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("country.list")}</CardTitle>
        <Link href="/dashboard/country/create"><Button className="mt-2">{t("country.add")}</Button></Link>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t("common.search")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t("country.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="active">{t("country.active")}</SelectItem>
              <SelectItem value="inactive">{t("country.inactive")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>
        ) : error ? (
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
                  <Button type="button" variant="ghost" onClick={() => handleSort("nom")} className="h-auto p-0 font-semibold">
                    {t("country.name")}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button type="button" variant="ghost" onClick={() => handleSort("code")} className="h-auto p-0 font-semibold">
                    {t("country.code")}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>{t("country.status")}</TableHead>
                <TableHead>{t("country.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCountries.map((country: any) => (
                <TableRow key={country.uid}>
                  <TableCell>{country.nom}</TableCell>
                  <TableCell>{country.code}</TableCell>
                  <TableCell>{country.is_active ? t("country.active") : t("country.inactive")}</TableCell>
                  <TableCell>
                    <Link href={`/dashboard/country/edit/${country.uid}`}><Button size="sm">{t("country.editButton")}</Button></Link>
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