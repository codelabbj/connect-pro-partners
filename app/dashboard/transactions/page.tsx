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
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      setError("")
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: itemsPerPage.toString(),
        })
        // Optionally add filters if API supports them
        // if (searchTerm) params.append("search", searchTerm)
        // if (statusFilter !== "all") params.append("status", statusFilter)
        // if (typeFilter !== "all") params.append("type", typeFilter)
        const endpoint = `${baseUrl}api/payments/transactions/?${params.toString()}`
        const data = await apiFetch(endpoint)
        setTransactions(data.results || [])
        setTotalCount(data.count || 0)
      } catch (err: any) {
        const errorMessage = typeof err === "object" && Object.keys(err).length > 0 
          ? JSON.stringify(err, null, 2)
          : t("transactions.failedToLoad")
        setError(errorMessage)
        setTransactions([])
        setTotalCount(0)
        console.error('Transactions fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [currentPage, itemsPerPage, baseUrl])

  // Client-side filter and sort (API does not support search/filter/sort yet)
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter((transaction) => {
      const user = transaction.display_recipient_name || transaction.recipient_phone || "-"
      const matchesSearch = user.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
      const matchesType = typeFilter === "all" || transaction.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortField === "amount" ? "amount" : "created_at"]
        let bValue = b[sortField === "amount" ? "amount" : "created_at"]
        if (sortField === "date") {
          aValue = new Date(aValue as string).getTime()
          bValue = new Date(bValue as string).getTime()
        } else {
          aValue = parseFloat(aValue)
          bValue = parseFloat(bValue)
        }
        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }
    return filtered
  }, [transactions, searchTerm, statusFilter, typeFilter, sortField, sortDirection])

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredAndSortedTransactions.slice(0, itemsPerPage)

  const handleSort = (field: "amount" | "date") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: "default",
      pending: "outline",
      failed: "destructive",
      sent_to_user: "secondary",
    }
    return <Badge variant={variants[status] || "outline"}>{t(`transactions.${status}`) || status}</Badge>
  }

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
      toast({ title: t("transactions.transactionUpdated"), description: t("transactions.transactionUpdatedSuccess") })
      setEditModalOpen(false)
      // Refresh transactions
      setTransactions((prev) => prev.map((t) => (t.uid === data.uid ? { ...t, ...data } : t)))
    } catch (err: any) {
      const errorMessage = typeof err === "object" && Object.keys(err).length > 0 
        ? JSON.stringify(err, null, 2)
        : t("transactions.failedToUpdate")
      setEditError(errorMessage)
      console.error('Transaction update error:', err)
    } finally {
      setEditLoading(false)
    }
  }
  // Delete transaction
  const handleDelete = async () => {
    if (!deleteUid) return
    try {
      const endpoint = `${baseUrl}api/payments/transactions/${deleteUid}/`
      await apiFetch(endpoint, { method: "DELETE" })
      toast({ title: t("transactions.transactionDeleted"), description: t("transactions.transactionDeletedSuccess") })
      setTransactions((prev) => prev.filter((t) => t.uid !== deleteUid))
      setDeleteUid(null)
    } catch (err: any) {
      const errorMessage = typeof err === "object" && Object.keys(err).length > 0 
        ? JSON.stringify(err, null, 2)
        : t("transactions.failedToDelete")
      toast({ title: t("transactions.deleteFailed"), description: errorMessage, variant: "destructive" })
      console.error('Transaction delete error:', err)
    }
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
                placeholder={t("transactions.searchByUser")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
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
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("amount")} className="h-auto p-0 font-semibold">
                        {t("transactions.amount")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>{t("transactions.user")}</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("date")} className="h-auto p-0 font-semibold">
                        {t("transactions.date")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>{t("transactions.type")}</TableHead>
                    <TableHead>{t("transactions.status")}</TableHead>
                    <TableHead>{t("transactions.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">{t("transactions.noTransactionsFound")}</TableCell>
                    </TableRow>
                  ) : (
                    paginatedTransactions.map((transaction) => (
                      <TableRow key={transaction.uid}>
                        <TableCell className="font-medium">${parseFloat(transaction.amount).toLocaleString()}</TableCell>
                        <TableCell>{transaction.display_recipient_name || transaction.recipient_phone || "-"}</TableCell>
                        <TableCell>{transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(transaction)} title={t("transactions.edit")}>
                            <Pencil className="w-4 h-4" />
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
              {t("transactions.showingResults", { start: startIndex + 1, end: Math.min(startIndex + itemsPerPage, totalCount), total: totalCount })}
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
                {t("transactions.pageOf", { current: currentPage, total: totalPages })}
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
            {editError && <div className="text-red-500 text-sm">{editError}</div>}
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
