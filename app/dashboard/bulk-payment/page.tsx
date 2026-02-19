"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { Search, ChevronLeft, ChevronRight, Plus, Download, Eye, RefreshCw, Filter, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useRouter } from "next/navigation"
import { DateFilter } from "@/components/ui/date-filter"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function BulkPaymentListPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [networkFilter, setNetworkFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [bulkDeposits, setBulkDeposits] = useState<any[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [networks, setNetworks] = useState<any[]>([])

    const { t } = useLanguage()
    const itemsPerPage = 10
    const apiFetch = useApi()
    const { toast } = useToast()
    const router = useRouter()

    // Fetch networks for filter
    useEffect(() => {
        const fetchNetworks = async () => {
            try {
                const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/networks/`
                const data = await apiFetch(endpoint)
                setNetworks(data.results || [])
            } catch (err: any) {
                console.error("Failed to load networks", err)
            }
        }
        fetchNetworks()
    }, [apiFetch])

    // Fetch bulk deposits from API
    const fetchBulkDeposits = async () => {
        setLoading(true)
        setError("")
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                page_size: itemsPerPage.toString(),
            })

            if (searchTerm.trim() !== "") params.append("search", searchTerm)
            if (statusFilter !== "all") params.append("status", statusFilter)
            if (networkFilter !== "all") params.append("network", networkFilter)
            if (startDate) params.append("date_from", startDate)
            if (endDate) params.append("date_to", endDate)

            const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/transactions/bulk-deposit/list/?${params.toString()}`
            const data = await apiFetch(endpoint)

            setBulkDeposits(data.results || [])
            setTotalCount(data.count || 0)
        } catch (err: any) {
            const errorMessage = extractErrorMessages(err) || t("bulkPayment.failedToLoad") || "Failed to load bulk payments"
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBulkDeposits()
    }, [currentPage, searchTerm, statusFilter, networkFilter, startDate, endDate])

    const totalPages = Math.ceil(totalCount / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage

    const statusMap: Record<string, { label: string; color: string }> = {
        pending: { label: t("transactions.pending"), color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" },
        processing: { label: t("transactions.processing") || "Processing", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" },
        completed: { label: t("transactions.completed"), color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
        failed: { label: t("transactions.failed"), color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
    }

    const getStatusBadge = (status: string) => {
        const info = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" }
        return <Badge className={info.color}>{info.label}</Badge>
    }

    const handleClearDates = () => {
        setStartDate("")
        setEndDate("")
        setCurrentPage(1)
    }

    const templateLink = "https://docs.google.com/spreadsheets/d/1hBrbWLD_qTtiLBq6JBWc_IOoSTdzX__hZ-yLgxM59v4/edit?usp=sharing"

    return (
        <div className="ml-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{t("bulkPayment.title")}</h1>
                    <p className="text-muted-foreground">{t("bulkPayment.subtitle")}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <a href={templateLink} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            {t("bulkPayment.downloadTemplate")}
                        </a>
                    </Button>
                    <Button onClick={() => router.push("/dashboard/bulk-payment/create")}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("bulkPayment.create")}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        {t("common.filter")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder={t("common.searchPlaceholder")}
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(value) => {
                            setStatusFilter(value)
                            setCurrentPage(1)
                        }}>
                            <SelectTrigger className="w-full lg:w-48">
                                <SelectValue placeholder={t("transactions.allStatuses")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("transactions.allStatuses")}</SelectItem>
                                <SelectItem value="pending">{t("transactions.pending")}</SelectItem>
                                <SelectItem value="processing">{t("transactions.processing") || "Processing"}</SelectItem>
                                <SelectItem value="completed">{t("transactions.completed")}</SelectItem>
                                <SelectItem value="failed">{t("transactions.failed")}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={networkFilter} onValueChange={(value) => {
                            setNetworkFilter(value)
                            setCurrentPage(1)
                        }}>
                            <SelectTrigger className="w-full lg:w-48">
                                <SelectValue placeholder={t("transactions.network")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("transactions.allTypes") || "All Networks"}</SelectItem>
                                {networks.map((network) => (
                                    <SelectItem key={network.uid} value={network.uid}>{network.nom}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <DateFilter
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={(date) => {
                                setStartDate(date)
                                setCurrentPage(1)
                            }}
                            onEndDateChange={(date) => {
                                setEndDate(date)
                                setCurrentPage(1)
                            }}
                            onClearDates={handleClearDates}
                            className="w-full lg:w-auto"
                        />
                    </div>

                    <div className="rounded-md border min-h-[400px]">
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                {t("common.loading")}
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center">
                                <ErrorDisplay error={error} onRetry={fetchBulkDeposits} variant="inline" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("bulkPayment.reference")}</TableHead>
                                        <TableHead>{t("bulkPayment.amount")}</TableHead>
                                        <TableHead>{t("bulkPayment.recipientPhone")}</TableHead>
                                        <TableHead>{t("bulkPayment.network")}</TableHead>
                                        <TableHead>{t("bulkPayment.createdAt")}</TableHead>
                                        <TableHead>{t("bulkPayment.status")}</TableHead>
                                        <TableHead className="text-right">{t("bulkPayment.actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bulkDeposits.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                                {t("bulkPayment.noTransactions")}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        bulkDeposits.map((deposit) => (
                                            <TableRow key={deposit.uid} className="hover:bg-muted/50">
                                                <TableCell className="font-mono text-sm">{deposit.reference || deposit.uid?.slice(0, 8)}</TableCell>
                                                <TableCell className="font-semibold">{parseFloat(deposit.amount).toLocaleString()} FCFA</TableCell>
                                                <TableCell>{deposit.recipient_phone}</TableCell>
                                                <TableCell>{deposit.network?.nom || "-"}</TableCell>
                                                <TableCell>{deposit.created_at ? new Date(deposit.created_at).toLocaleString() : "-"}</TableCell>
                                                <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/dashboard/bulk-payment/${deposit.uid}`)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        {t("bulkPayment.viewDetails")}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <a
                                                            href={`${baseUrl.replace(/\/$/, "")}/api/payments/user/transactions/bulk-deposit/${deposit.bulk_deposit_uid || deposit.uid}/transactions/`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            {t("bulkPayment.transactions") || "Transactions"}
                                                        </a>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                        <div className="text-sm text-muted-foreground text-center sm:text-left">
                            {t("payment.showingResults")?.replace("start", (startIndex + 1).toString()).replace("end", Math.min(startIndex + itemsPerPage, totalCount).toString()).replace("total", totalCount.toString()) ||
                                `Showing ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalCount)} of ${totalCount}`}
                        </div>
                        <div className="flex items-center justify-center sm:justify-end space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1 || loading}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                {t("common.previous")}
                            </Button>
                            <div className="text-sm font-medium px-2">
                                {t("payment.pageOf")?.replace("current", currentPage.toString()).replace("total", totalPages.toString()) ||
                                    `Page ${currentPage} of ${totalPages}`}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || loading}
                            >
                                {t("common.next")}
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
