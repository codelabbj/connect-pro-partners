"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { Plus, Trash2, ArrowLeft, Send, RefreshCw, AlertCircle, FileSpreadsheet, Upload, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useRouter } from "next/navigation"
import * as XLSX from "xlsx"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

type BulkRow = {
    id: string
    amount: string
    recipient_phone: string
    objet: string
    network: string
    errors?: Record<string, string>
}

export default function CreateBulkPaymentPage() {
    const { t } = useLanguage()
    const apiFetch = useApi()
    const { toast } = useToast()
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [networks, setNetworks] = useState<any[]>([])
    const [loadingNetworks, setLoadingNetworks] = useState(true)
    const [rows, setRows] = useState<BulkRow[]>([
        { id: Math.random().toString(36).substr(2, 9), amount: "", recipient_phone: "", objet: "", network: "" }
    ])
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 10

    // Fetch networks for the dropdown
    useEffect(() => {
        const fetchNetworks = async () => {
            setLoadingNetworks(true)
            try {
                const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/networks/`
                const data = await apiFetch(endpoint)
                const networkResults = data.results || []
                setNetworks(networkResults)

                // Auto-select first network for the initial row if available and not set
                if (networkResults.length > 0) {
                    setRows(prev => prev.map(r => r.network === "" ? { ...r, network: networkResults[0].uid } : r))
                }
            } catch (err: any) {
                toast({ title: t("common.error"), description: t("payment.failedToLoadNetworks"), variant: "destructive" })
            } finally {
                setLoadingNetworks(false)
            }
        }
        fetchNetworks()
    }, [apiFetch, t, toast])

    const validateRow = (row: BulkRow, updatedNetworks: any[] = networks) => {
        const errors: Record<string, string> = {}

        // Phone validation: numeric and max 11 digits
        if (!row.recipient_phone) {
            errors.recipient_phone = t("common.required") || "Required"
        } else if (!/^\d+$/.test(row.recipient_phone) || row.recipient_phone.length > 10) {
            errors.recipient_phone = t("bulkPayment.invalidPhone")
        }

        // Amount validation: numeric and within min/max if network selected
        const amount = parseFloat(row.amount)
        if (!row.amount) {
            errors.amount = t("common.required") || "Required"
        } else if (isNaN(amount)) {
            errors.amount = t("common.invalidAmount") || "Invalid amount"
        } else if (row.network) {
            const network = updatedNetworks.find(n => n.uid === row.network)
            if (network) {
                const min = parseFloat(network.min_montant)
                const max = parseFloat(network.max_montant)
                if (!isNaN(min) && amount < min) errors.amount = `${t("bulkPayment.invalidAmount")} (Min: ${min})`
                if (!isNaN(max) && amount > max) errors.amount = `${t("bulkPayment.invalidAmount")} (Max: ${max})`
            }
        }

        // Network validation
        if (!row.network) {
            errors.network = t("bulkPayment.invalidNetwork")
        }

        return Object.keys(errors).length > 0 ? errors : undefined
    }

    const addRow = () => {
        const defaultNetwork = networks.length > 0 ? networks[0].uid : ""
        setRows([...rows, { id: Math.random().toString(36).substr(2, 9), amount: "", recipient_phone: "", objet: "", network: defaultNetwork }])
        // Move to last page when adding row
        const newTotalPages = Math.ceil((rows.length + 1) / rowsPerPage)
        setCurrentPage(newTotalPages)
    }

    const removeRow = (id: string) => {
        if (rows.length > 1) {
            const newRows = rows.filter(row => row.id !== id)
            setRows(newRows)

            // Adjust current page if necessary
            const newTotalPages = Math.ceil(newRows.length / rowsPerPage)
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages)
            }
        }
    }

    const updateRow = (id: string, field: keyof BulkRow, value: string) => {
        setRows(prevRows => prevRows.map(row => {
            if (row.id === id) {
                const updatedRow = { ...row, [field]: value }
                return { ...updatedRow, errors: validateRow(updatedRow) }
            }
            return row
        }))
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const bstr = event.target?.result
                const wb = XLSX.read(bstr, { type: "binary" })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data = XLSX.utils.sheet_to_json(ws) as any[]

                if (data.length === 0) {
                    toast({ title: t("common.error"), description: t("bulkPayment.noTransactions"), variant: "destructive" })
                    return
                }

                const newRows: BulkRow[] = data.map((item) => {
                    const id = Math.random().toString(36).substr(2, 9)

                    // Helper to find value in row by searching keys case-insensitively
                    const getCellValue = (potentialKeys: string[]) => {
                        const itemKeys = Object.keys(item)
                        // Try exact match first
                        let foundKey = itemKeys.find(k =>
                            potentialKeys.some(pk => k.toLowerCase().trim() === pk.toLowerCase())
                        )
                        // Fallback to partial match (e.g., "Code réseau" matches "réseau")
                        if (!foundKey) {
                            foundKey = itemKeys.find(k =>
                                potentialKeys.some(pk => k.toLowerCase().trim().includes(pk.toLowerCase()))
                            )
                        }
                        return foundKey ? String(item[foundKey]).trim() : ""
                    }

                    const phone = getCellValue(["phone", "number", "numero", "numéro", "recipient", "telephone", "téléphone"]).replace(/\D/g, "")
                    const amount = getCellValue(["amount", "montant", "value", "valeur"])
                    const objet = getCellValue(["object", "objet", "reference", "référence", "description"])
                    const networkInput = getCellValue(["network", "reseau", "réseau", "operator", "opérateur", "carrier", "fournisseur"]).toLowerCase()

                    // Try to map network
                    let networkUid = ""
                    if (networkInput && networks.length > 0) {
                        const normalizedInput = networkInput.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "")

                        const foundNetwork = networks.find(n => {
                            const nom = (n.nom || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "")
                            const code = (n.code || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "")
                            const name = (n.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "")
                            const uid = (n.uid || "").toLowerCase()

                            return (nom && nom === normalizedInput) ||
                                (code && code === normalizedInput) ||
                                (name && name === normalizedInput) ||
                                (uid && uid === networkInput) ||
                                (nom && nom.includes(normalizedInput)) ||
                                (normalizedInput && normalizedInput.includes(nom)) ||
                                (code && code.includes(normalizedInput)) ||
                                (normalizedInput && normalizedInput.includes(code))
                        })
                        if (foundNetwork) networkUid = foundNetwork.uid
                    }

                    const row: BulkRow = {
                        id,
                        amount,
                        recipient_phone: phone,
                        objet,
                        network: networkUid,
                    }
                    return { ...row, errors: validateRow(row) }
                })

                setRows(newRows)
                setCurrentPage(1)
                toast({ title: t("common.success"), description: `${newRows.length} ${t("bulkPayment.transactions")} imported` })
            } catch (err) {
                toast({ title: t("common.error"), description: "Failed to parse Excel file", variant: "destructive" })
            }
        }
        reader.readAsBinaryString(file)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const validateAllRows = () => {
        let hasError = false
        const updatedRows = rows.map(row => {
            const errors = validateRow(row)
            if (errors) hasError = true
            return { ...row, errors }
        })

        if (hasError) {
            setRows(updatedRows)
            return false
        }
        return true
    }

    const getTotalAmount = () => {
        return rows.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0)
    }

    const handleOpenConfirm = () => {
        if (!validateAllRows()) {
            toast({ title: t("common.error"), description: t("bulkPayment.errors"), variant: "destructive" })
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

    // Pagination logic
    const totalPages = Math.ceil(rows.length / rowsPerPage)
    const startIndex = (currentPage - 1) * rowsPerPage
    const paginatedRows = rows.slice(startIndex, startIndex + rowsPerPage)

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
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        {t("bulkPayment.list")}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="border-green-600 text-green-600 hover:bg-green-50">
                            <Upload className="h-4 w-4 mr-2" />
                            {t("bulkPayment.uploadExcel")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={addRow}>
                            <Plus className="h-4 w-4 mr-2" />
                            {t("bulkPayment.addRow")}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto min-h-[300px]">
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
                                {paginatedRows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={row.amount}
                                                    onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                                                    className={cn("h-9", row.errors?.amount && "border-red-500 ring-red-500")}
                                                />
                                                {row.errors?.amount && <p className="text-[10px] text-red-500 leading-none">{row.errors.amount}</p>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <Input
                                                    placeholder="05..."
                                                    value={row.recipient_phone}
                                                    onChange={(e) => updateRow(row.id, "recipient_phone", e.target.value)}
                                                    className={cn("h-9", row.errors?.recipient_phone && "border-red-500 ring-red-500")}
                                                />
                                                {row.errors?.recipient_phone && <p className="text-[10px] text-red-500 leading-none">{row.errors.recipient_phone}</p>}
                                            </div>
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
                                            <div className="space-y-1">
                                                <select
                                                    value={row.network}
                                                    onChange={(e) => updateRow(row.id, "network", e.target.value)}
                                                    className={cn(
                                                        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                                        row.errors?.network && "border-red-500 ring-red-500"
                                                    )}
                                                    disabled={loadingNetworks}
                                                >
                                                    <option value="">-- {t("bulkPayment.network")} --</option>
                                                    {networks.map((nw) => (
                                                        <option key={nw.uid} value={nw.uid}>{nw.nom}</option>
                                                    ))}
                                                </select>
                                                {row.errors?.network && <p className="text-[10px] text-red-500 leading-none">{row.errors.network}</p>}
                                            </div>
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

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between border rounded-lg p-2 bg-muted/20">
                            <span className="text-xs text-muted-foreground pl-2">
                                {t("payment.showingResults")
                                    ?.replace("start", (startIndex + 1).toString())
                                    .replace("end", Math.min(startIndex + rowsPerPage, rows.length).toString())
                                    .replace("total", rows.length.toString()) ||
                                    `Showing ${startIndex + 1}-${Math.min(startIndex + rowsPerPage, rows.length)} of ${rows.length}`}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-xs font-medium px-2">
                                    {t("bulkPayment.page")} {currentPage} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

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
                                        <p className="text-center italic pt-2">... {rows.length - 5} {t("common.more") || "more items"}</p>
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
