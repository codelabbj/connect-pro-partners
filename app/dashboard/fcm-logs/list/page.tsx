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

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function FcmLogsListPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deviceFilter, setDeviceFilter] = useState("all")
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();

  useEffect(() => {
    const fetchFcmLogs = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/fcm-logs/`)
        setLogs(Array.isArray(data.results) ? data.results : [])
        toast({
          title: t("fcmLogs.success"),
          description: t("fcmLogs.loadedSuccessfully"),
        })
      } catch (err: any) {
        const errorMessage = typeof err === "object" && Object.keys(err).length > 0 
          ? JSON.stringify(err, null, 2)
          : err.message || t("fcmLogs.failedToLoad")
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
  }, [])

  // Filter FCM logs based on search term and device
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = searchTerm === "" || 
        log.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.device_id?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesDevice = deviceFilter === "all" || 
        log.device_id === deviceFilter
      
      return matchesSearch && matchesDevice
    })
  }, [logs, searchTerm, deviceFilter])

  const handleCopy = (body: string, uid: string) => {
    navigator.clipboard.writeText(body)
    setCopied(uid)
    setTimeout(() => setCopied(null), 1500)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-lg font-semibold">{t("fcmLogs.loading")}</span>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {t("fcmLogs.errorLoading")}
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
                <TableHead>{t("fcmLogs.messageTitle")}</TableHead>
                <TableHead>{t("fcmLogs.body")}</TableHead>
                <TableHead>{t("fcmLogs.deviceId")}</TableHead>
                <TableHead>{t("fcmLogs.createdAt")}</TableHead>
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