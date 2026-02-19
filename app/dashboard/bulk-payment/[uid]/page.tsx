"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { ArrowLeft, RefreshCw, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useRouter, useParams } from "next/navigation"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function BulkPaymentDetailsPage() {
    const { t } = useLanguage()
    const apiFetch = useApi()
    const { toast } = useToast()
    const router = useRouter()
    const params = useParams()
    const uid = params.uid as string

    const [deposit, setDeposit] = useState<any>(null)
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchDetails = async () => {
        setLoading(true)
        setError("")
        try {
            const baseUrlClean = baseUrl.replace(/\/$/, "")
            const depositEndpoint = `${baseUrlClean}/api/payments/user/transactions/bulk-deposit/${uid}/`
            const transactionsEndpoint = `${baseUrlClean}/api/payments/user/transactions/bulk-deposit/${uid}/transactions/`

            const [depositData, transactionsData] = await Promise.all([
                apiFetch(depositEndpoint),
                apiFetch(transactionsEndpoint)
            ])

            setDeposit(depositData)
            setTransactions(transactionsData.results || transactionsData || [])
        } catch (err: any) {
            setError(extractErrorMessages(err))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (uid) fetchDetails()
    }, [uid])

    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
        pending: { label: t("transactions.pending"), color: "bg-yellow-100 text-yellow-800", icon: Clock },
        processing: { label: t("transactions.processing") || "Processing", color: "bg-blue-100 text-blue-800", icon: RefreshCw },
        completed: { label: t("transactions.completed"), color: "bg-green-100 text-green-800", icon: CheckCircle2 },
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
    )

    if (error) return (
        <div className="ml-6 mt-6">
            <ErrorDisplay error={error} onRetry={fetchDetails} variant="full" />
        </div>
    )

    if (!deposit) return null

    return (
        <div className="ml-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("common.back")}
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{t("bulkPayment.details")}</h1>
                    <p className="text-muted-foreground">{deposit.uid || deposit.bulk_deposit_uid}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>{t("common.summary") || "Summary"}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">{t("bulkPayment.status")}</p>
                            <div className="mt-1">{getStatusBadge(deposit.status)}</div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("bulkPayment.reference")}</p>
                            <p className="font-mono mt-1">{deposit.bulk_deposit_uid || deposit.uid || "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("bulkPayment.totalAmount")}</p>
                            <p className="text-lg font-bold mt-1 text-blue-600">{deposit.total_amount ? parseFloat(deposit.total_amount).toLocaleString() : "-"} FCFA</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("bulkPayment.totalCount")}</p>
                            <p className="text-lg font-bold mt-1">{deposit.total_count ?? "-"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{t("bulkPayment.createdAt")}</p>
                            <p className="mt-1">{deposit.created_at ? new Date(deposit.created_at).toLocaleString() : "-"}</p>
                        </div>
                        {deposit.completed_at && (
                            <div>
                                <p className="text-sm text-muted-foreground">{t("transactions.completedAt") || t("bulkPayment.completedAt")}</p>
                                <p className="mt-1">{new Date(deposit.completed_at).toLocaleString()}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("common.actions") || "Actions"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full" onClick={fetchDetails}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t("common.refresh")}
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => router.push(`/dashboard/bulk-payment/${uid}/transactions`)}>
                            <FileText className="h-4 w-4 mr-2" />
                            {t("bulkPayment.viewTransactions") || "View Transactions"}
                        </Button>
                        {deposit.tracking_url && (
                            <p className="text-xs text-muted-foreground break-all">
                                Tracking: {deposit.tracking_url}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {transactions && transactions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t("transactions.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("transactions.recipientPhone")}</TableHead>
                                        <TableHead>{t("transactions.amount")}</TableHead>
                                        <TableHead>{t("transactions.network")}</TableHead>
                                        <TableHead>{t("transactions.status")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((tx: any, idx: number) => (
                                        <TableRow key={tx.uid || idx}>
                                            <TableCell>{tx.recipient_phone}</TableCell>
                                            <TableCell>{parseFloat(tx.amount).toLocaleString()} FCFA</TableCell>
                                            <TableCell>{tx.network?.nom || tx.network_name || "-"}</TableCell>
                                            <TableCell>
                                                <Badge variant={tx.status === 'success' ? 'default' : 'secondary'}>
                                                    {tx.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
