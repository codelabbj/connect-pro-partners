"use client"
import { useEffect, useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import Link from "next/link"
import { Search } from "lucide-react"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function NetworkConfigListPage() {
  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [networkFilter, setNetworkFilter] = useState("all")
  const [networks, setNetworks] = useState<any[]>([])
  const apiFetch = useApi()
  const { t } = useLanguage()

  useEffect(() => {
    const fetchNetworkConfigs = async () => {
      setLoading(true)
      setError("")
      try {
        const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/payments/network-configs/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          // Show the raw API response if available, otherwise show a formatted error
          const errorMessage = Object.keys(errorData).length > 0 
            ? JSON.stringify(errorData, null, 2)
            : `HTTP ${response.status}: ${response.statusText}`
          throw new Error(errorMessage)
        }
        
        const data = await response.json()
        setConfigs(Array.isArray(data) ? data : data.results || [])
      } catch (err: any) {
        const errorMessage = err.message || t("networkConfig.failedToLoad")
        setError(errorMessage)
        setConfigs([])
        console.error('Network config fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchNetworkConfigs()
  }, [t])

  // Fetch networks for filter
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/payments/networks/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          // Log the raw API response for debugging
          const errorMessage = Object.keys(errorData).length > 0 
            ? JSON.stringify(errorData, null, 2)
            : `HTTP ${response.status}: ${response.statusText}`
          console.error('Networks fetch error:', errorMessage)
          setNetworks([])
          return
        }
        
        const data = await response.json()
        setNetworks(Array.isArray(data) ? data : data.results || [])
      } catch (err: any) {
        console.error('Networks fetch error:', err)
        setNetworks([])
      }
    }
    
    fetchNetworks()
  }, [])

  // Filter network configs based on search term, status, and network
  const filteredConfigs = useMemo(() => {
    return configs.filter((config) => {
      const matchesSearch = searchTerm === "" || 
        config.network_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatUssdCommands(config.ussd_commands)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatSmsKeywords(config.sms_keywords)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatErrorKeywords(config.error_keywords)?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && config.is_active) ||
        (statusFilter === "inactive" && !config.is_active)
      
      const matchesNetwork = networkFilter === "all" || 
        config.network === networkFilter ||
        config.network_name === networks.find(n => n.uid === networkFilter)?.nom
      
      return matchesSearch && matchesStatus && matchesNetwork
    })
  }, [configs, searchTerm, statusFilter, networkFilter, networks])

  const formatUssdCommands = (commands: any) => {
    if (!commands) return '-'
    return Object.entries(commands)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')
  }

  const formatSmsKeywords = (keywords: any) => {
    if (!keywords) return '-'
    return Object.entries(keywords)
      .map(([key, values]) => `${key}: ${Array.isArray(values) ? values.join(', ') : values}`)
      .join('; ')
  }

  const formatErrorKeywords = (keywords: string[]) => {
    if (!keywords || !Array.isArray(keywords)) return '-'
    return keywords.join(', ')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("networkConfig.list")}</CardTitle>
        <Link href="/dashboard/network-config/create">
          <Button className="mt-2">{t("networkConfig.add")}</Button>
        </Link>
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
              <SelectValue placeholder={t("networkConfig.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="active">{t("networkConfig.active")}</SelectItem>
              <SelectItem value="inactive">{t("networkConfig.inactive")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={networkFilter} onValueChange={setNetworkFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t("networkConfig.network")} />
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

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">{t("common.loading")}</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {t("networkConfig.errorLoading")}
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
                <TableHead>{t("networkConfig.networkName")}</TableHead>
                <TableHead>{t("networkConfig.status")}</TableHead>
                <TableHead>{t("networkConfig.ussdCommands")}</TableHead>
                <TableHead>{t("networkConfig.smsKeywords")}</TableHead>
                <TableHead>{t("networkConfig.errorKeywords")}</TableHead>
                <TableHead>{t("networkConfig.settings")}</TableHead>
                <TableHead>{t("networkConfig.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConfigs.map((config: any) => (
                <TableRow key={config.uid}>
                  <TableCell className="font-medium">{config.network_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={config.is_active ? "default" : "secondary"}>
                      {config.is_active ? t("networkConfig.active") : t("networkConfig.inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-xs text-gray-600 truncate" title={formatUssdCommands(config.ussd_commands)}>
                      {formatUssdCommands(config.ussd_commands)}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-xs text-gray-600 truncate" title={formatSmsKeywords(config.sms_keywords)}>
                      {formatSmsKeywords(config.sms_keywords)}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-xs text-gray-600 truncate" title={formatErrorKeywords(config.error_keywords)}>
                      {formatErrorKeywords(config.error_keywords)}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-xs text-gray-600">
                      {config.custom_settings ? (
                        <div>
                          <div>{t("networkConfig.maxRetriesLabel")} {config.custom_settings.max_retries || '-'}</div>
                          <div>{t("networkConfig.timeoutLabel")} {config.custom_settings.timeout_seconds || '-'}s</div>
                          <div>{t("networkConfig.autoConfirmLabel")} {config.custom_settings.auto_confirm ? t("common.yes") : t("common.no")}</div>
                        </div>
                      ) : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/network-config/edit/${config.uid}`}>
                      <Button size="sm" variant="outline">{t("networkConfig.editButton")}</Button>
                    </Link>
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