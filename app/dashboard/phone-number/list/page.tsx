"use client"
import { useEffect, useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function PhoneNumberListPage() {
  const [numbers, setNumbers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [networkFilter, setNetworkFilter] = useState("all")
  const [networks, setNetworks] = useState<any[]>([])
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();

  useEffect(() => {
    const fetchPhoneNumbers = async () => {
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
          endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/numeros/?${params.toString()}`;
        } else {
          const params = new URLSearchParams({
            page: "1",
            page_size: "100",
          });
          endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/numeros/?${params.toString()}`;
        }
        const data = await apiFetch(endpoint)
        setNumbers(Array.isArray(data) ? data : data.results || [])
        toast({
          title: t("phoneNumbers.success"),
          description: t("phoneNumbers.loadedSuccessfully"),
        })
      } catch (err: any) {
        const errorMessage = typeof err === "object" && Object.keys(err).length > 0 
          ? JSON.stringify(err, null, 2)
          : err.message || t("phoneNumbers.failedToLoad")
        setError(errorMessage)
        setNumbers([])
        toast({
          title: t("phoneNumbers.failedToLoad"),
          description: errorMessage,
          variant: "destructive",
        })
        console.error('Phone numbers fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPhoneNumbers()
  }, [searchTerm])

  // Fetch networks for filter
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/networks/`)
        setNetworks(Array.isArray(data) ? data : data.results || [])
        toast({
          title: t("phoneNumbers.networksLoaded"),
          description: t("phoneNumbers.networksLoadedSuccessfully"),
        })
      } catch (err: any) {
        console.error('Networks fetch error:', err)
        setNetworks([])
        toast({
          title: t("phoneNumbers.networksFailedToLoad"),
          description: err.message || t("phoneNumbers.failedToLoadNetworks"),
          variant: "destructive",
        })
      }
    }
    
    fetchNetworks()
  }, [])

  // Remove client-side search filtering for numbers
  const filteredNumbers = useMemo(() => {
    return numbers.filter((number) => {
      const matchesNetwork = networkFilter === "all" || number.network === networkFilter || number.network === networks.find(n => n.uid === networkFilter)?.nom
      return matchesNetwork
    })
  }, [numbers, networkFilter, networks])

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
        <CardTitle>{t("phoneNumbers.list")}</CardTitle>
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
          <Select value={networkFilter} onValueChange={setNetworkFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t("phoneNumbers.network")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {networks.map((network: any) => (
                <SelectItem key={network.uid} value={network.uid}>
                  {network.nom}
                </SelectItem>
              ))}
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
                  {t("phoneNumbers.errorLoading")}
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
                <TableHead>{t("phoneNumbers.phoneNumber")}</TableHead>
                <TableHead>{t("phoneNumbers.network")}</TableHead>
                <TableHead>{t("phoneNumbers.fullName")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNumbers.map((num: any) => (
                <TableRow key={num.uid}>
                  <TableCell>{num.phone_number}</TableCell>
                  <TableCell>{num.network}</TableCell>
                  <TableCell>{num.full_name || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
} 