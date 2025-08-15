"use client"
import { useEffect, useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy } from "lucide-react"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ArrowUpDown } from "lucide-react"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function SmsLogsListPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortField, setSortField] = useState<"received_at" | "sender" | null>(null)
  const [sortDirection, setSortDirection] = useState<"+" | "-">("-")
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchSmsLogs = async () => {
      setLoading(true)
      setError("")
      try {
        let endpoint = "";
        if (searchTerm.trim() !== "" || typeFilter !== "all" || sortField) {
          const params = new URLSearchParams({
            page: "1",
            page_size: "100",
          });
          if (searchTerm.trim() !== "") {
            params.append("search", searchTerm);
          }
          if (typeFilter !== "all") {
            params.append("sms_type", typeFilter);
          }
          if (sortField) {
            params.append("ordering", `${sortDirection}${sortField}`);
          }
          const query = params.toString().replace(/ordering=%2B/g, "ordering=+");
          endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/sms-logs/?${query}`;
        } else {
          const params = new URLSearchParams({
            page: "1",
            page_size: "100",
          });
          endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/sms-logs/?${params.toString()}`;
        }
        const data = await apiFetch(endpoint)
        setLogs(Array.isArray(data) ? data : data.results || [])
        toast({
          title: t("smsLogs.success"),
          description: t("smsLogs.loadedSuccessfully"),
        })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err) || t("smsLogs.failedToLoad")
        setError(errorMessage)
        setLogs([])
        toast({
          title: t("smsLogs.failedToLoad"),
          description: errorMessage,
          variant: "destructive",
        })
        console.error('SMS logs fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSmsLogs()
  }, [searchTerm, typeFilter, sortField, sortDirection])

  // Remove client-side filtering since it's now handled by the API
  const filteredLogs = logs

  const handleSort = (field: "received_at" | "sender") => {
    if (sortField === field) {
      setSortDirection(prev => prev === "+" ? "-" : "+")
      setSortField(field)
    } else {
      setSortField(field)
      setSortDirection("-")
    }
  }

  const handleCopy = (content: string, uid: string) => {
    navigator.clipboard.writeText(content)
    setCopied(uid)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("smsLogs.list")}</CardTitle>
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t("smsLogs.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="balance">Balance</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
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
                  <Button type="button" variant="ghost" onClick={() => handleSort("sender")} className="h-auto p-0 font-semibold">
                    {t("smsLogs.sender")}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>{t("smsLogs.content")}</TableHead>
                <TableHead>
                  <Button type="button" variant="ghost" onClick={() => handleSort("received_at")} className="h-auto p-0 font-semibold">
                    {t("smsLogs.receivedAt")}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>{t("smsLogs.type")}</TableHead>
                <TableHead>{t("smsLogs.copy")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log: any) => (
                <TableRow key={log.uid || log.id || log.content}>
                  <TableCell>{log.sender}</TableCell>
                  <TableCell>{log.content}</TableCell>
                  <TableCell>{log.received_at ? log.received_at.split("T")[0] : '-'}</TableCell>
                  <TableCell>{log.sms_type}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(log.content, log.uid || log.id || log.content)}>
                      <Copy className="h-4 w-4" />
                      {copied === (log.uid || log.id || log.content) && <span className="ml-2 text-xs">{t("smsLogs.copied")}</span>}
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