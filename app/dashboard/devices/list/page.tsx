"use client"
import { useEffect, useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { Search, ArrowUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function DevicesListPage() {
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<"name" | "last_sync" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState(""); // NEW: for input control
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchDevices = async () => {
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
            params.append("order_by", `${sortField}:${sortDirection}`);
          }
          endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/devices/sync?${params.toString()}`;
        } else {
          const params = new URLSearchParams({
            page: "1",
            page_size: "100",
          });
          endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/devices/sync?${params.toString()}`;
        }
        // Test error handling - uncomment to test
        // throw new Error('{"detail":"Method \"GET\" not allowed."}')
        
        const data = await apiFetch(endpoint)
        console.log('Devices API response:', data)
        setDevices(Array.isArray(data) ? data : data.results || [])
        toast({
          title: t("devices.success"),
          description: t("devices.loadedSuccessfully"),
        })
      } catch (err: any) {
        console.log('Devices fetch error caught:', err)
        const errorMessage = extractErrorMessages(err) || t("devices.failedToLoad")
        console.log('Extracted error message:', errorMessage)
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
  }, [searchTerm, statusFilter, sortField, sortDirection])

  // Remove client-side filtering since it's now handled by the API
  const filteredDevices = devices

  const handleSort = (field: "name" | "last_sync") => {
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
        <CardTitle>{t("devices.list")}</CardTitle>
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
                <TableHead>{t("devices.deviceId")}</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("name")} className="h-auto p-0 font-semibold">
                    {t("devices.name")}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>{t("devices.status")}</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("last_sync")} className="h-auto p-0 font-semibold">
                    {t("devices.lastSync")}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
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