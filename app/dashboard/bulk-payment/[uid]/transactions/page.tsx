"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { ArrowLeft, RefreshCw, FileText, CheckCircle2, Clock, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useRouter, useParams } from "next/navigation"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function BulkPaymentTransactionsPage() {
    const { t } = useLanguage()
    const apiFetch = useApi()
    const router = useRouter()
    const params = useParams()
    const uid = params.uid as string

    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 20

    const fetchTransactions = async () => {
        setLoading(true)
        setError("")
        try {
            const paramsStr = new URLSearchParams({
                page: currentPage.toString(),
                page_size: itemsPerPage.toString(),
            }).toString()

            const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/transactions/bulk-deposit/${uid}/transactions/?${paramsStr}`
            const data = await apiFetch(endpoint)

            setTransactions(data.results || data || [])
            setTotalCount(data.count || (Array.isArray(data) ? data.length : 0))
        } catch (err: any) {
            setError(extractErrorMessages(err))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (uid) fetchTransactions()
    }, [uid, currentPage])

    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
        pending: { label: t("transactions.pending"), color: "bg-yellow-100 text-yellow-800", icon: Clock },
        processing: { label: t("transactions.processing") || "Processing", color: "bg-blue-100 text-blue-800", icon: RefreshCw },
        success: { label: t("transactions.completed") || "Success", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
        failed: { label: t("transactions.failed"), color: "bg-red-100 text-red-800", icon: AlertCircle },
    }

    const getStatusBadge = (status: string) => {
        const info = statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800", icon: FileText }
        const Icon = info.icon
        return (
            <Badge className={`${info.color} flex items-center gap-1`}>
                <Icon className={`h-3 w-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
                {info.label}
            </Badge>
        )
    }

    const totalPages = Math.ceil(totalCount / itemsPerPage)

    return (
        <div className="ml-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("common.back")}
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{t("bulkPayment.transactions") || "Bulk Transactions"}</h1>
                    <p className="text-muted-foreground">{uid}</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>{t("transactions.title")}</CardTitle>
                    <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {t("common.refresh")}
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading && transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                            <p className="text-muted-foreground">{t("common.loading")}</p>
                        </div>
                    ) : error ? (
                        <div className="py-12">
                            <ErrorDisplay error={error} onRetry={fetchTransactions} variant="inline" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t("bulkPayment.reference")}</TableHead>
                                            <TableHead>{t("bulkPayment.recipientPhone")}</TableHead>
                                            <TableHead>{t("bulkPayment.amount")}</TableHead>
                                            <TableHead>{t("bulkPayment.network")}</TableHead>
                                            <TableHead>{t("bulkPayment.status")}</TableHead>
                                            <TableHead>{t("bulkPayment.objet")}</TableHead>
                                            <TableHead>{t("bulkPayment.createdAt")}</TableHead>
                                            <TableHead>{t("bulkPayment.processedByName")}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                    {t("bulkPayment.noTransactions")}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            transactions.map((tx: any) => (
                                                <TableRow key={tx.uid}>
                                                    <TableCell className="font-mono text-xs">{tx.reference}</TableCell>
                                                    <TableCell>{tx.recipient_phone}</TableCell>
                                                    <TableCell className="font-semibold">{parseFloat(tx.amount).toLocaleString()} FCFA</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {tx.network?.image && (
                                                                <img src={tx.network.image} alt={tx.network.nom} className="h-4 w-4 rounded-full object-cover" />
                                                            )}
                                                            <span className="text-xs">{tx.network?.nom || tx.network_name || tx.network}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                                                    <TableCell className="text-xs max-w-[150px] truncate" title={tx.objet}>{tx.objet}</TableCell>
                                                    <TableCell className="text-xs whitespace-nowrap">
                                                        {new Date(tx.created_at).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-xs">{tx.processed_by_name || "-"}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between gap-4 mt-6">
                                    <div className="text-sm text-muted-foreground">
                                        {t("payment.showingResults")
                                            ?.replace("start", ((currentPage - 1) * itemsPerPage + 1).toString())
                                            .replace("end", Math.min(currentPage * itemsPerPage, totalCount).toString())
                                            .replace("total", totalCount.toString()) ||
                                            `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalCount)} of ${totalCount}`}
                                    </div>
                                    <div className="flex items-center space-x-2">
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
                                            {t("payment.pageOf")
                                                ?.replace("current", currentPage.toString())
                                                .replace("total", totalPages.toString()) ||
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
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
