"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { Plus, Trash2, ArrowLeft, Send, RefreshCw, AlertCircle, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

type BulkRow = {
    id: string
    amount: string
    recipient_phone: string
    objet: string
    network: string
}

export default function CreateBulkPaymentPage() {
    const { t } = useLanguage()
    const apiFetch = useApi()
    const { toast } = useToast()
    const router = useRouter()

    const [networks, setNetworks] = useState<any[]>([])
    const [loadingNetworks, setLoadingNetworks] = useState(true)
    const [rows, setRows] = useState<BulkRow[]>([
        { id: Math.random().toString(36).substr(2, 9), amount: "", recipient_phone: "", objet: "", network: "" }
    ])
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    // Fetch networks for the dropdown
    useEffect(() => {
        const fetchNetworks = async () => {
            setLoadingNetworks(true)
            try {
                const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/networks/`
                const data = await apiFetch(endpoint)
                setNetworks(data.results || [])

                // Auto-select first network for the initial row if available
                if (data.results && data.results.length > 0) {
                    setRows(prev => prev.map(r => ({ ...r, network: data.results[0].uid })))
                }
            } catch (err: any) {
                toast({ title: t("common.error"), description: t("payment.failedToLoadNetworks"), variant: "destructive" })
            } finally {
                setLoadingNetworks(false)
            }
        }
        fetchNetworks()
    }, [apiFetch, t, toast])

    const addRow = () => {
        const defaultNetwork = networks.length > 0 ? networks[0].uid : ""
        setRows([...rows, { id: Math.random().toString(36).substr(2, 9), amount: "", recipient_phone: "", objet: "", network: defaultNetwork }])
    }

    const removeRow = (id: string) => {
        if (rows.length > 1) {
            setRows(rows.filter(row => row.id !== id))
        }
    }

    const updateRow = (id: string, field: keyof BulkRow, value: string) => {
        setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row))
    }

    const validateRows = () => {
        for (const row of rows) {
            if (!row.amount || !row.recipient_phone || !row.network) return false
        }
        return true
    }

    const getTotalAmount = () => {
        return rows.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0)
    }

    const handleOpenConfirm = () => {
        if (!validateRows()) {
            toast({ title: t("common.error"), description: t("topup.fillAllFields"), variant: "destructive" })
            return
        }
        setIsConfirmOpen(true)
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        setError("")
        try {
            const payload = rows.map(row => ({
                amount: row.amount,
                recipient_phone: row.recipient_phone,
                objet: row.objet || "Bulk Deposit",
                network: row.network,
                external_id: null
            }))

            const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/transactions/bulk-deposit/`
            await apiFetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            router.push("/dashboard/bulk-payment")
        } catch (err: any) {
            setError(extractErrorMessages(err))
        } finally {
            setSubmitting(false)
            setIsConfirmOpen(false)
        }
    }

    return (
        <div className="ml-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("common.back")}
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{t("bulkPayment.create")}</h1>
                    <p className="text-muted-foreground">{t("bulkPayment.subtitle")}</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        {t("bulkPayment.create")}
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={addRow}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("bulkPayment.addRow")}
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[150px]">{t("bulkPayment.amount")}</TableHead>
                                    <TableHead className="w-[180px]">{t("bulkPayment.recipientPhone")}</TableHead>
                                    <TableHead className="w-[200px]">{t("bulkPayment.objet")}</TableHead>
                                    <TableHead className="w-[200px]">{t("bulkPayment.network")}</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={row.amount}
                                                onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                                                className="h-9"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                placeholder="05..."
                                                value={row.recipient_phone}
                                                onChange={(e) => updateRow(row.id, "recipient_phone", e.target.value)}
                                                className="h-9"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                placeholder="Dépôt..."
                                                value={row.objet}
                                                onChange={(e) => updateRow(row.id, "objet", e.target.value)}
                                                className="h-9"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <select
                                                value={row.network}
                                                onChange={(e) => updateRow(row.id, "network", e.target.value)}
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                disabled={loadingNetworks}
                                            >
                                                {networks.map((nw) => (
                                                    <option key={nw.uid} value={nw.uid}>{nw.nom}</option>
                                                ))}
                                            </select>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeRow(row.id)}
                                                disabled={rows.length === 1}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-8 flex flex-col items-end gap-4">
                        <div className="text-right">
                            <span className="text-sm text-muted-foreground mr-4">{t("bulkPayment.totalCount")}: {rows.length}</span>
                            <span className="text-lg font-bold">{t("bulkPayment.totalAmount")}: {getTotalAmount().toLocaleString()} FCFA</span>
                        </div>
                        <Button size="lg" className="w-full sm:w-auto" onClick={handleOpenConfirm}>
                            <Send className="h-4 w-4 mr-2" />
                            {t("bulkPayment.submit")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{t("bulkPayment.confirmTitle")}</DialogTitle>
                        <DialogDescription>
                            {t("bulkPayment.confirmDescription")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden my-4 border rounded-md p-4 bg-muted/30">
                        <div className="space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-semibold">{t("bulkPayment.totalCount")}</span>
                                <span>{rows.length}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-semibold">{t("bulkPayment.totalAmount")}</span>
                                <span className="text-blue-600 font-bold">{getTotalAmount().toLocaleString()} FCFA</span>
                            </div>

                            <div className="pt-4">
                                <Label className="mb-2 block">{t("common.details")}</Label>
                                <div className="text-xs space-y-1">
                                    {rows.slice(0, 5).map((row, i) => (
                                        <div key={row.id} className="flex justify-between opacity-80">
                                            <span>{row.recipient_phone}</span>
                                            <span>{parseFloat(row.amount).toLocaleString()} FCFA ({networks.find(n => n.uid === row.network)?.nom})</span>
                                        </div>
                                    ))}
                                    {rows.length > 5 && (
                                        <p className="text-center font-italic pt-2">... {rows.length - 5} {t("common.more") || "more items"}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg flex items-start gap-2 mb-4">
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            {t("payment.confirmationWarning")}
                        </p>
                    </div>

                    {error && <ErrorDisplay error={error} variant="inline" className="mb-4" />}

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={submitting}>
                            {t("common.cancel")}
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting} className="min-w-[120px]">
                            {submitting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    {t("common.processing")}
                                </>
                            ) : (
                                t("common.ok")
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
