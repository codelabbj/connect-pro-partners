"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Pencil, Trash } from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useWebSocket } from "@/components/providers/websocket-provider"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<"amount" | "date" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [transactions, setTransactions] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { t } = useLanguage()
  const itemsPerPage = 10
  const apiFetch = useApi()
  const { toast } = useToast()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState("")
  const [editTransaction, setEditTransaction] = useState<any | null>(null)
  const [deleteUid, setDeleteUid] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(""); // NEW: for input control

  // Edit form state
  const [editForm, setEditForm] = useState({
    status: "",
    external_transaction_id: "",
    balance_before: "",
    balance_after: "",
    fees: "",
    confirmation_message: "",
    raw_sms: "",
    completed_at: "",
    error_message: "",
  })

  // Fetch transactions from API
  const fetchTransactions = async () => {
    setLoading(true)
    setError("")
    try {
      let endpoint = "";
      if (searchTerm.trim() !== "" || statusFilter !== "all" || typeFilter !== "all" || sortField) {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: itemsPerPage.toString(),
        });
        if (searchTerm.trim() !== "") {
          params.append("search", searchTerm);
        }
        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }
        if (typeFilter !== "all") {
          params.append("trans_type", typeFilter);
        }
        if (sortField) {
          const orderBy = sortField === "date" ? "created_at" : "amount";
          params.append("order_by", `${orderBy}:${sortDirection}`);
        }
        endpoint = `${baseUrl}api/payments/transactions/?${params.toString()}`;
      } else {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: itemsPerPage.toString(),
        });
        endpoint = `${baseUrl}api/payments/transactions/?${params.toString()}`;
      }
      const data = await apiFetch(endpoint)
      setTransactions(data.results || [])
      setTotalCount(data.count || 0)
      toast({
        title: t("transactions.success"),
        description: t("transactions.loadedSuccessfully"),
      })
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("transactions.failedToLoad")
      setError(errorMessage)
      setTransactions([])
      setTotalCount(0)
      toast({
        title: t("transactions.failedToLoad"),
        description: errorMessage,
        variant: "destructive",
      })
      console.error('Transactions fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, itemsPerPage, baseUrl, searchTerm, statusFilter, typeFilter, sortField, sortDirection])

  // Remove client-side filtering and sorting since it's now handled by the API
  const filteredAndSortedTransactions = transactions
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredAndSortedTransactions

  const handleSort = (field: "amount" | "date") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  
    const statusMap: Record<string, { label: string; color: string }> = {
      pending:      { label: "En attente", color: "#ffc107" },      // jaune
      sent_to_user: { label: "Envoyé", color: "#17a2b8" },          // bleu clair
      processing:   { label: "En cours", color: "#fd7e14" },        // orange
      completed:    { label: "Terminé", color: "#28a745" },         // vert foncé
      success:      { label: "Succès", color: "#20c997" },          // turquoise
      failed:       { label: "Échec", color: "#dc3545" },           // rouge
      cancelled:    { label: "Annulé", color: "#6c757d" },          // gris
      timeout:      { label: "Expiré", color: "#6f42c1" },          // violet
    };

    const getStatusBadge = (status: string) => {
      const info = statusMap[status] || { label: status, color: "#adb5bd" };
      return (
        <span
          style={{
            backgroundColor: info.color,
            color: "#fff",
            borderRadius: "0.375rem",
            padding: "0.25em 0.75em",
            fontWeight: 500,
            fontSize: "0.875rem",
            display: "inline-block",
          }}
        >
          {info.label}
        </span>
      );
    };
   

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      deposit: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      withdrawal: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      transfer: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    }
    return <Badge className={colors[type] || ""}>{t(`transactions.${type}`) || type}</Badge>
  }

  // Open edit modal and populate form
  const handleOpenEdit = (transaction: any) => {
    setEditTransaction(transaction)
    setEditForm({
      status: transaction.status || "",
      external_transaction_id: transaction.external_transaction_id || "",
      balance_before: transaction.balance_before || "",
      balance_after: transaction.balance_after || "",
      fees: transaction.fees || "",
      confirmation_message: transaction.confirmation_message || "",
      raw_sms: transaction.raw_sms || "",
      completed_at: transaction.completed_at || "",
      error_message: transaction.error_message || "",
    })
    setEditModalOpen(true)
    setEditError("")
  }
  // Handle edit form change
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }
  // Submit edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTransaction) return
    setEditLoading(true)
    setEditError("")
    try {
      const endpoint = `${baseUrl}api/payments/transactions/${editTransaction.uid}/`
      const payload = {
        ...editForm,
      }
      const data = await apiFetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      toast({
        title: t("transactions.editSuccess"),
        description: t("transactions.transactionUpdatedSuccessfully"),
      })
      setEditModalOpen(false)
      setEditTransaction(null)
      setEditForm({
        status: "",
        external_transaction_id: "",
        balance_before: "",
        balance_after: "",
        fees: "",
        confirmation_message: "",
        raw_sms: "",
        completed_at: "",
        error_message: "",
      })
      // Refetch transactions
      setCurrentPage(1)
    } catch (err: any) {
      const backendError = err?.message || t("transactions.failedToEdit")
      setEditError(backendError)
      toast({
        title: t("transactions.failedToEdit"),
        description: backendError,
        variant: "destructive",
      })
    } finally {
      setEditLoading(false)
    }
  }
  // Delete transaction
  const handleDelete = async () => {
    if (!deleteUid) return
    setLoading(true)
    setError("")
    try {
      const endpoint = `${baseUrl}api/payments/transactions/${deleteUid}/`
      await apiFetch(endpoint, { method: "DELETE" })
      toast({
        title: t("transactions.deleteSuccess"),
        description: t("transactions.transactionDeletedSuccessfully"),
      })
      setDeleteUid(null)
      // Refetch transactions
      setCurrentPage(1)
    } catch (err: any) {
      const backendError = err?.message || t("transactions.failedToDelete")
      setError(backendError)
      toast({
        title: t("transactions.failedToDelete"),
        description: backendError,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update searchTerm only when user submits
  const handleSearchSubmit = () => {
    setSearchTerm(searchInput.trim());
    setCurrentPage(1); // Reset to first page on new search
  };

  // Listen for transaction_update WebSocket messages
  const { lastMessage } = useWebSocket();
  useEffect(() => {
    if (!lastMessage) return;
    try {
      const data = typeof lastMessage.data === "string" ? JSON.parse(lastMessage.data) : lastMessage.data;
      if (data.type === "transaction_update" && data.transaction_uid) {
        setTransactions((prev) =>
          prev.map((tx) =>
            tx.uid === data.transaction_uid
              ? { ...tx, status: data.status, ...data.data }
              : tx
          )
        );
        toast({
          title: t("transactions.liveUpdate"),
          description: `${t("transactions.transaction")} ${data.transaction_uid} ${t("transactions.statusUpdated")}: ${data.status}`,
        });
      }
    } catch (err) {
      // Optionally log or handle parse errors
    }
  }, [lastMessage, t, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-lg font-semibold">{t("common.loading")}</span>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={fetchTransactions}
        variant="full"
        showDismiss={false}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("transactions.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
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
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder={t("transactions.allStatuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("transactions.allStatuses")}</SelectItem>
                <SelectItem value="completed">{t("transactions.completed")}</SelectItem>
                <SelectItem value="pending">{t("transactions.pending")}</SelectItem>
                <SelectItem value="failed">{t("transactions.failed")}</SelectItem>
                <SelectItem value="sent_to_user">{t("transactions.sentToUser")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder={t("transactions.allTypes")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("transactions.allTypes")}</SelectItem>
                <SelectItem value="deposit">{t("transactions.deposit")}</SelectItem>
                <SelectItem value="withdrawal">{t("transactions.withdrawal")}</SelectItem>
                <SelectItem value="transfer">{t("transactions.transfer")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border min-h-[200px]">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("transactions.reference")}</TableHead> {/* NEW COLUMN */}
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("amount")} className="h-auto p-0 font-semibold">
                        {t("transactions.amount")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>{t("transactions.recipientName")}</TableHead> {/* NEW COLUMN */}
                    <TableHead>{t("transactions.recipientPhone")}</TableHead> {/* NEW COLUMN */}
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("date")} className="h-auto p-0 font-semibold">
                        {t("transactions.date")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>{t("transactions.type")}</TableHead>
                    {/* <TableHead>{t("transactions.reference")}</TableHead> */}
                    <TableHead>{t("transactions.network")}</TableHead>
                    <TableHead>{t("transactions.status")}</TableHead>
                    <TableHead>{t("transactions.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">{t("transactions.noTransactionsFound")}</TableCell>
                    </TableRow>
                  ) : (
                    paginatedTransactions.map((transaction) => (
                      <TableRow key={transaction.uid}>
                        <TableCell>{transaction.reference || "-"}</TableCell> {/* NEW COLUMN */}
                        <TableCell className="font-medium">${parseFloat(transaction.amount).toLocaleString()}</TableCell>
                        <TableCell>{transaction.display_recipient_name || "-"}</TableCell> {/* NEW CELL */}
                        <TableCell>{transaction.recipient_phone || "-"}</TableCell> {/* NEW CELL */}
                        <TableCell>{transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                        <TableCell>{transaction.network_name || "-"}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title={t("transactions.edit")}
                          >
                            <a href={`/dashboard/transactions/${transaction.uid}/edit`}>
                              <Pencil className="w-4 h-4" />
                            </a>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title={t("transactions.delete")} onClick={() => setDeleteUid(transaction.uid)}>
                                <Trash className="w-4 h-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                                              <AlertDialogTitle>{t("transactions.deleteTransaction")}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("transactions.deleteConfirmation")}
                              </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteUid(null)}>{t("transactions.cancel")}</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>{t("transactions.delete")}</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              {`${t("transactions.showingResults")}: ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalCount)} / ${totalCount}`}
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
              <div className="text-sm">
                {`${t("transactions.pageOf")}: ${currentPage}/${totalPages}`}
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

      {/* Edit Transaction Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("transactions.editTransaction")}</DialogTitle>
            <DialogDescription>{t("transactions.updateTransactionDetails")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <label>{t("transactions.status")}
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="completed">{t("transactions.completed")}</option>
                  <option value="pending">{t("transactions.pending")}</option>
                  <option value="failed">{t("transactions.failed")}</option>
                  <option value="sent_to_user">{t("transactions.sentToUser")}</option>
                </select>
              </label>
              <label>{t("transactions.externalTransactionId")}
                <Input name="external_transaction_id" value={editForm.external_transaction_id} onChange={handleEditChange} />
              </label>
              <label>{t("transactions.balanceBefore")}
                <Input name="balance_before" value={editForm.balance_before} onChange={handleEditChange} />
              </label>
              <label>{t("transactions.balanceAfter")}
                <Input name="balance_after" value={editForm.balance_after} onChange={handleEditChange} />
              </label>
              <label>{t("transactions.fees")}
                <Input name="fees" value={editForm.fees} onChange={handleEditChange} />
              </label>
              <label>{t("transactions.confirmationMessage")}
                <Input name="confirmation_message" value={editForm.confirmation_message} onChange={handleEditChange} />
              </label>
              <label>{t("transactions.rawSms")}
                <Input name="raw_sms" value={editForm.raw_sms} onChange={handleEditChange} />
              </label>
              <label>{t("transactions.completedAt")}
                <Input name="completed_at" value={editForm.completed_at} onChange={handleEditChange} type="datetime-local" />
              </label>
              <label>{t("transactions.errorMessage")}
                <Input name="error_message" value={editForm.error_message} onChange={handleEditChange} />
              </label>
            </div>
            {editError && (
              <ErrorDisplay
                error={editError}
                variant="inline"
                showRetry={false}
                className="mb-4"
              />
            )}
            <DialogFooter>
              <Button type="submit" disabled={editLoading}>{editLoading ? t("transactions.saving") : t("transactions.saveChanges")}</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">{t("transactions.cancel")}</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
