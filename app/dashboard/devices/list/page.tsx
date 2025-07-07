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

export default function DevicesListPage() {
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/devices/sync`)
        setDevices(Array.isArray(data) ? data : data.results || [])
        toast({
          title: t("devices.success"),
          description: t("devices.loadedSuccessfully"),
        })
      } catch (err: any) {
        const errorMessage = typeof err === "object" && Object.keys(err).length > 0 
          ? JSON.stringify(err, null, 2)
          : err.message || t("devices.failedToLoad")
        setError(errorMessage)
        setDevices([])
        toast({
          title: t("devices.failedToLoad"),
          description: errorMessage,
          variant: "destructive",
        })
        console.error('Devices fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDevices()
  }, [])

  // Filter devices based on search term and status
  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesSearch = searchTerm === "" || 
        device.device_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.device_name?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && device.is_active) ||
        (statusFilter === "inactive" && !device.is_active)
      
      return matchesSearch && matchesStatus
    })
  }, [devices, searchTerm, statusFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-lg font-semibold">{t("devices.loading")}</span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("devices.list")}</CardTitle>
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
              <SelectValue placeholder={t("devices.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="active">{t("common.active")}</SelectItem>
              <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
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
                  {t("devices.errorLoading")}
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
                <TableHead>{t("devices.deviceId")}</TableHead>
                <TableHead>{t("devices.name")}</TableHead>
                <TableHead>{t("devices.status")}</TableHead>
                <TableHead>{t("devices.lastSync")}</TableHead>
                <TableHead>{t("devices.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((device: any) => (
                <TableRow key={device.uid || device.id}>
                  <TableCell>{device.device_id || device.uid}</TableCell>
                  <TableCell>{device.name || device.device_name || '-'}</TableCell>
                  <TableCell>{device.is_active ? t("common.active") : t("common.inactive")}</TableCell>
                  <TableCell>{device.last_sync ? new Date(device.last_sync).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    {/* TODO: Add device actions like edit, delete, etc. */}
                    <span className="text-gray-500">{t("devices.noActionsAvailable")}</span>
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