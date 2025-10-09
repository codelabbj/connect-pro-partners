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
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Pencil, Trash, Clock, RefreshCw, Plus, Wallet, TrendingUp, TrendingDown, Copy } from "lucide-react"
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
// import { useWebSocket } from "@/components/providers/websocket-provider"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DateFilter } from "@/components/ui/date-filter"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function UserTransactionsPage() {
  // Account data state
  const [accountData, setAccountData] = useState<any>(null)
  const [accountLoading, setAccountLoading] = useState(true)
  const [accountError, setAccountError] = useState("")

  // Transactions list state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<"amount" | "date" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [transactions, setTransactions] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Networks state
  const [networks, setNetworks] = useState<any[]>([])
  const [networksLoading, setNetworksLoading] = useState(false)
  
  // Transaction creation state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState("")
  const [transactionForm, setTransactionForm] = useState({
    type: "deposit" as "deposit" | "withdraw",
    amount: "",
    recipient_phone: "",
    network: "",
    objet: ""
  })

  const { t } = useLanguage()
  const itemsPerPage = 10
  const apiFetch = useApi()
  const { toast } = useToast()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)

  // Fetch account data
  useEffect(() => {
    const fetchAccountData = async () => {
      setAccountLoading(true)
      setAccountError("")
      try {
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/account/`
        const data = await apiFetch(endpoint)
        setAccountData(data)
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err)
        setAccountError(errorMessage)
        toast({ title: t("payment.failedToLoadAccount"), description: errorMessage, variant: "destructive" })
      } finally {
        setAccountLoading(false)
      }
    }
    fetchAccountData()
  }, [baseUrl, apiFetch, t, toast])

  // Fetch networks when create modal opens
  useEffect(() => {
    const fetchNetworks = async () => {
      if (!createModalOpen) return
      setNetworksLoading(true)
      try {
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/networks/`
        const data = await apiFetch(endpoint)
        setNetworks(data.results || [])
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err)
        toast({ title: t("payment.failedToLoadNetworks"), description: errorMessage, variant: "destructive" })
      } finally {
        setNetworksLoading(false)
      }
    }
    fetchNetworks()
  }, [createModalOpen, baseUrl, apiFetch, t, toast])

  // Fetch user transactions from API
  const fetchTransactions = async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: itemsPerPage.toString(),
      });

      // Add search parameter
      if (searchTerm.trim() !== "") {
        params.append("search", searchTerm);
      }

      // Add status filter
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      // Add type filter  
      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }

      // Add date filters
      if (startDate) {
        params.append("created_at__gte", startDate);
      }
      if (endDate) {
        params.append("created_at__lte", endDate);
      }

      // Add sorting
      if (sortField) {
        const orderBy = sortField === "date" ? "created_at" : "amount";
        const prefix = sortDirection === "desc" ? "-" : "";
        params.append("ordering", `${prefix}${orderBy}`);
      }

      const endpoint = `${baseUrl}api/payments/user/transactions/?${params.toString()}`;
      const data = await apiFetch(endpoint)
      
      setTransactions(data.results || [])
      setTotalCount(data.count || 0)
      
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("transactions.failedToLoad") || "Failed to load transactions"
      setError(errorMessage)
      setTransactions([])
      setTotalCount(0)
      toast({
        title: t("transactions.failedToLoad") || "Failed to load",
        description: errorMessage,
        variant: "destructive",
      })
      console.error('Transactions fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchTransactions()
    setRefreshing(false)
  }

  // Refresh account data
  const refreshAccountData = async () => {
    setAccountLoading(true)
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/account/`
      const data = await apiFetch(endpoint)
      setAccountData(data)
      toast({ title: t("payment.accountRefreshed"), description: t("payment.accountDataUpdated") })
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      toast({ title: t("payment.refreshFailed"), description: errorMessage, variant: "destructive" })
    } finally {
      setAccountLoading(false)
    }
  }

  // Handle transaction creation
  const handleCreateTransaction = async () => {
    setCreateLoading(true)
    setCreateError("")
    try {
      const payload = {
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount),
        recipient_phone: transactionForm.recipient_phone,
        network: transactionForm.network,
        objet: transactionForm.objet
      }

      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/transactions/`
      await apiFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
      
      toast({ 
        title: t("payment.success"), 
        description: t(`payment.${transactionForm.type}CreatedSuccessfully`) || `${transactionForm.type} created successfully!`
      })
      setCreateModalOpen(false)
      setTransactionForm({
        type: "deposit",
        amount: "",
        recipient_phone: "",
        network: "",
        objet: ""
      })
      // Refresh data
      setCurrentPage(1)
      await fetchTransactions()
      await refreshAccountData()
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setCreateError(errorMessage)
      toast({ title: t("payment.createFailed"), description: errorMessage, variant: "destructive" })
    } finally {
      setCreateLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, searchTerm, statusFilter, typeFilter, startDate, endDate, sortField, sortDirection])

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage

  const handleSort = (field: "amount" | "date") => {
    setCurrentPage(1)
    setSortDirection((prevDir) => (sortField === field ? (prevDir === "desc" ? "asc" : "desc") : "desc"))
    setSortField(field)
  }

  const handleClearDates = () => {
    setStartDate("")
    setEndDate("")
    setCurrentPage(1)
  }

  // Enhanced status map with more statuses from the API response
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "En attente", color: "#ffc107" },
    sent_to_user: { label: "Envoyé à l'utilisateur", color: "#17a2b8" },
    processing: { label: "En cours", color: "#fd7e14" },
    completed: { label: "Terminé", color: "#28a745" },
    success: { label: "Succès", color: "#20c997" },
    failed: { label: "Échec", color: "#dc3545" },
    cancelled: { label: "Annulé", color: "#6c757d" },
    timeout: { label: "Expiré", color: "#6f42c1" },
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

  // Format processing duration
  const formatProcessingDuration = (duration: string | null) => {
    if (!duration) return "-"
    return duration
  }

  // Listen for transaction updates via WebSocket
  // const { lastMessage } = useWebSocket();
  // useEffect(() => {
  //   if (!lastMessage) return;
  //   try {
  //     const data = typeof lastMessage.data === "string" ? JSON.parse(lastMessage.data) : lastMessage.data;

  //     // Handle new transaction creation
  //     if (data.type === "new_transaction" && data.event === "transaction_created" && data.transaction_data) {
  //       const newTx = data.transaction_data;
  //       if (currentPage === 1) {
  //         setTransactions(prev => [newTx, ...prev].slice(0, itemsPerPage));
  //       }
  //       setTotalCount(prev => prev + 1);
  //       toast({
  //         title: t("transactions.created") || "Transaction created",
  //         description: data.message || `Transaction ${newTx.reference} created successfully`,
  //       });
  //       return;
  //     }

  //     // Handle live transaction updates
  //     if (data.type === "transaction_update" && data.transaction_uid) {
  //       setTransactions((prev) =>
  //         prev.map((tx) =>
  //           tx.uid === data.transaction_uid
  //             ? { ...tx, status: data.status, ...data.data }
  //             : tx
  //         )
  //       );
  //       toast({
  //         title: t("transactions.liveUpdate") || "Live update",
  //         description: `Transaction ${data.transaction_uid} status updated: ${data.status}`,
  //       });
  //       return;
  //     }
  //   } catch (err) {
  //     // Handle parse errors silently
  //   }
  // }, [lastMessage, t, toast, currentPage, itemsPerPage]);

  return (
    <div className="ml-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("transactions.title") || "My Transactions"}</h1>
          <p className="text-muted-foreground">{t("transactions.subtitle") || "Manage your transactions"}</p>
        </div>
        
      </div>

      {/* Account Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              {t("payment.accountOverview") || "Account Overview"}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={refreshAccountData} disabled={accountLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${accountLoading ? 'animate-spin' : ''}`} />
              {t("common.refresh") || "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {accountLoading ? (
            <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>
          ) : accountError ? (
            <ErrorDisplay
              error={accountError}
              onRetry={refreshAccountData}
              variant="full"
              showDismiss={false}
            />
          ) : accountData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">{t("payment.currentBalance") || "Current Balance"}</p>
                    <p className="text-2xl font-bold text-blue-900">{accountData.formatted_balance}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">{t("payment.totalRecharged") || "Total Recharged"}</p>
                    <p className="text-2xl font-bold text-green-900">{accountData.total_recharged} FCFA</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">{t("payment.totalDeposited") || "Total Deposited"}</p>
                    <p className="text-2xl font-bold text-purple-900">{accountData.total_deposited} FCFA</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">{t("payment.totalWithdrawn") || "Total Withdrawn"}</p>
                    <p className="text-2xl font-bold text-orange-900">{accountData.total_withdrawn} FCFA</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>
          ) : null}

          {accountData && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">{t("payment.accountStatus") || "Account Status"}</span>
                <Badge variant={accountData.is_active ? "default" : "destructive"}>
                  {accountData.is_active ? (t("payment.active") || "Active") : (t("payment.inactive") || "Inactive")}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">{t("payment.accountFrozen") || "Account Frozen"}</span>
                <Badge variant={accountData.is_frozen ? "destructive" : "default"}>
                  {accountData.is_frozen ? (t("common.yes") || "Yes") : (t("common.no") || "No")}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">{t("payment.utilizationRate") || "Utilization Rate"}</span>
                <span className="font-semibold">{(accountData.utilization_rate * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center justify-between">
              <span>{t("transactions.transactionHistory") || "Transaction History"}</span>
              {/* <span className="text-sm font-normal text-muted-foreground">
                {totalCount} {t("transactions.total") || "total"}
              </span> */}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={refreshing}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {/* {t("common.refresh") || "Refresh"} */}
              </Button>
            
              <Button 
                onClick={() => router.push('/dashboard/transactions/create')}
                size="sm"
                className="w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {t("payment.newTransaction") || "New Transaction"}
              </Button>
            </div> 
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("common.searchPlaceholder") || "Search by reference, phone, or amount..."}
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
                <SelectValue placeholder={t("transactions.allStatuses") || "All Statuses"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("transactions.allStatuses") || "All Statuses"}</SelectItem>
                <SelectItem value="pending">{t("transactions.pending") || "Pending"}</SelectItem>
                <SelectItem value="sent_to_user">{t("transactions.sentToUser") || "Sent to User"}</SelectItem>
                <SelectItem value="completed">{t("transactions.completed") || "Completed"}</SelectItem>
                <SelectItem value="success">{t("transactions.success") || "Success"}</SelectItem>
                <SelectItem value="failed">{t("transactions.failed") || "Failed"}</SelectItem>
                <SelectItem value="cancelled">{t("transactions.cancelled") || "Cancelled"}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value) => {
              setTypeFilter(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder={t("transactions.allTypes") || "All Types"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("transactions.allTypes") || "All Types"}</SelectItem>
                <SelectItem value="deposit">{t("transactions.deposit") || "Deposit"}</SelectItem>
                <SelectItem value="withdrawal">{t("transactions.withdrawal") || "Withdrawal"}</SelectItem>
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

          {/* Inline error display */}
          {error && (
            <div className="mb-4">
              <ErrorDisplay
                error={error}
                onRetry={fetchTransactions}
                variant="full"
                showDismiss={false}
              />
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border min-h-[400px]">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                {t("common.loading") || "Loading..."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("transactions.reference") || "Reference"}</TableHead>
                    <TableHead>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => handleSort("amount")} 
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        {t("transactions.amount") || "Amount"}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>{t("transactions.recipientInfo") || "Recipient"}</TableHead>
                    <TableHead>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => handleSort("date")} 
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        {t("transactions.date") || "Date"}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>{t("transactions.type") || "Type"}</TableHead>
                    <TableHead>{t("transactions.network") || "Network"}</TableHead>
                    <TableHead>{t("transactions.status") || "Status"}</TableHead>
                    {/* <TableHead>{t("transactions.retryInfo") || "Retry Info"}</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        {t("transactions.noTransactionsFound") || "No transactions found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.uid} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">
                          <div className="flex items-center gap-2">
                            <span>{transaction.reference || transaction.uid.slice(0, 8)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => {
                                navigator.clipboard.writeText(transaction.reference || transaction.uid)
                                toast({ title: t("payment.referenceCopied") || "Reference copied!" })
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{transaction.formatted_amount || `${parseFloat(transaction.amount).toLocaleString()} FCFA`}</span>
                            {transaction.fees && (
                              <span className="text-xs text-muted-foreground">
                                Fees: {transaction.fees} FCFA
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {transaction.display_recipient_name || transaction.recipient_name || "-"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {transaction.recipient_phone || "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : "-"}</span>
                            <span className="text-xs text-muted-foreground">
                              {transaction.created_at ? new Date(transaction.created_at).toLocaleTimeString() : ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{transaction.network?.nom || "-"}</span>
                            <span className="text-xs text-muted-foreground">
                              {transaction.network?.country_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        {/* <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="text-muted-foreground">
                              {transaction.retry_count || 0}/{transaction.max_retries || 3}
                            </span>
                            {transaction.can_retry && (
                              <span className="text-green-600 text-xs">Can retry</span>
                            )}
                            {transaction.processing_duration && (
                              <span className="text-xs text-muted-foreground">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {formatProcessingDuration(transaction.processing_duration)}
                              </span>
                            )}
                          </div>
                        </TableCell> */}
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
              {t("transactions.showingResults") || "Showing"}: {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalCount)} {t("common.of") || "of"} {totalCount}
            </div>
            <div className="flex items-center justify-center sm:justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("common.previous") || "Previous"}
              </Button>
              <div className="text-sm font-medium px-2">
                {t("transactions.pageOf") || "Page"} {currentPage} {t("common.of") || "of"} {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
              >
                {t("common.next") || "Next"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Transaction Modal */}
      <Dialog open={createModalOpen} onOpenChange={(open) => { 
        if (!open) {
          setCreateModalOpen(false)
          setCreateError("")
          setTransactionForm({
            type: "deposit",
            amount: "",
            recipient_phone: "",
            network: "",
            objet: ""
          })
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("payment.newTransaction") || "Create New Transaction"}</DialogTitle>
          </DialogHeader>
          
          {createError && (
            <ErrorDisplay
              error={createError}
              variant="inline"
              showRetry={false}
              className="mb-4"
            />
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="type">{t("payment.transactionType") || "Transaction Type"} *</Label>
              <select
                id="type"
                value={transactionForm.type}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, type: e.target.value as "deposit" | "withdraw" }))}
                className="w-full border rounded px-3 py-2 bg-background"
                required
              >
                <option value="deposit">{t("payment.deposit") || "Deposit"}</option>
                <option value="withdraw">{t("payment.withdraw") || "Withdraw"}</option>
              </select>
            </div>

            <div>
              <Label htmlFor="amount">{t("payment.amount") || "Amount"} *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                required
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="recipient_phone">{t("payment.recipientPhone") || "Recipient Phone"} *</Label>
              <Input
                id="recipient_phone"
                type="tel"
                placeholder="Enter phone number"
                value={transactionForm.recipient_phone}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, recipient_phone: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="network">{t("payment.network") || "Network"} *</Label>
              <select
                id="network"
                value={transactionForm.network}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, network: e.target.value }))}
                className="w-full border rounded px-3 py-2 bg-background"
                required
                disabled={networksLoading}
              >
                <option value="">{networksLoading ? t("common.loading") || "Loading..." : t("payment.selectNetwork") || "Select Network"}</option>
                {networks.map((network) => (
                  <option key={network.uid} value={network.uid} disabled={!network.is_active}>
                    {network.nom} ({network.country_name}) {!network.is_active && " - " + (t("common.inactive") || "Inactive")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="objet">{t("payment.description") || "Description"}</Label>
              <Textarea
                id="objet"
                placeholder="Enter transaction description..."
                value={transactionForm.objet}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, objet: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <DialogClose asChild>
              <Button variant="outline" disabled={createLoading}>
                {t("common.cancel") || "Cancel"}
              </Button>
            </DialogClose>
            <Button 
              onClick={handleCreateTransaction} 
              disabled={createLoading || !transactionForm.amount || !transactionForm.recipient_phone || !transactionForm.network}
            >
              {createLoading ? (t("common.processing") || "Processing...") : (t("common.create") || "Create")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

