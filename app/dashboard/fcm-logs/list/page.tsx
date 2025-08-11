"use client"
import { useEffect, useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Search, ArrowUpDown } from "lucide-react"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function FcmLogsListPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deviceFilter, setDeviceFilter] = useState("all")
  const [sortField, setSortField] = useState<"created_at" | "device_id" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState(""); // NEW: for input control
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchFcmLogs = async () => {
      setLoading(true)
      setError("")
      try {
        let endpoint = "";
        if (searchTerm.trim() !== "" || deviceFilter !== "all" || sortField) {
          const params = new URLSearchParams({
            page: "1",
            page_size: "100",
          });
          if (searchTerm.trim() !== "") {
            params.append("search", searchTerm);
          }
          if (deviceFilter !== "all") {
            params.append("device_id", deviceFilter);
          }
          if (sortField) {
            params.append("order_by", `${sortField}:${sortDirection}`);
          }
          endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/fcm-logs/?${params.toString()}`;
        } else {
          const params = new URLSearchParams({
            page: "1",
            page_size: "100",
          });
          endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/fcm-logs/?${params.toString()}`;
        }
        const data = await apiFetch(endpoint)
        setLogs(Array.isArray(data.results) ? data.results : [])
        toast({
          title: t("fcmLogs.success"),
          description: t("fcmLogs.loadedSuccessfully"),
        })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err) || t("fcmLogs.failedToLoad")
        setError(errorMessage)
        setLogs([])
        toast({
          title: t("fcmLogs.failedToLoad"),
          description: errorMessage,
          variant: "destructive",
        })
        console.error('FCM logs fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFcmLogs()
  }, [searchTerm, deviceFilter, sortField, sortDirection])

  // Remove client-side filtering since it's now handled by the API
  const filteredLogs = logs

  const handleSort = (field: "created_at" | "device_id") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleCopy = (body: string, uid: string) => {
    navigator.clipboard.writeText(body)
    setCopied(uid)
    setTimeout(() => setCopied(null), 1500)
  }

  // Update searchTerm only when user submits
  const handleSearchSubmit = () => {
    setSearchTerm(searchInput.trim());
    setCurrentPage(1); // Reset to first page on new search
  }

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
        <CardTitle>{t("fcmLogs.list")}</CardTitle>
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
          <Select value={deviceFilter} onValueChange={setDeviceFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t("fcmLogs.deviceId")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {Array.from(new Set(logs.map(log => log.device_id))).map((deviceId) => (
                <SelectItem key={deviceId} value={deviceId}>
                  {deviceId}
                </SelectItem>
              ))}
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
                <TableHead>{t("fcmLogs.messageTitle")}</TableHead>
                <TableHead>{t("fcmLogs.body")}</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("device_id")} className="h-auto p-0 font-semibold">
                    {t("fcmLogs.deviceId")}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("created_at")} className="h-auto p-0 font-semibold">
                    {t("fcmLogs.createdAt")}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>{t("fcmLogs.copy")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log: any) => (
                <TableRow key={log.uid}>
                  <TableCell>{log.title}</TableCell>
                  <TableCell>{log.body}</TableCell>
                  <TableCell>{log.device_id}</TableCell>
                  <TableCell>{log.created_at ? log.created_at.split("T")[0] : '-'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(log.body, log.uid)}>
                      <Copy className="h-4 w-4" />
                      {copied === log.uid && <span className="ml-2 text-xs">{t("fcmLogs.copied")}</span>}
                    </Button>
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