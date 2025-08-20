"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Copy, Plus, TrendingUp, TrendingDown, Wallet, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useApi } from "@/lib/useApi"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function UserPaymentPage() {
	// Account data state
	const [accountData, setAccountData] = useState<any>(null)
	const [accountLoading, setAccountLoading] = useState(true)
	const [accountError, setAccountError] = useState("")
	
	// Transactions state
	const [transactions, setTransactions] = useState<any[]>([])
	const [totalCount, setTotalCount] = useState(0)
	const [totalPages, setTotalPages] = useState(1)
	const [currentPage, setCurrentPage] = useState(1)
	const [searchTerm, setSearchTerm] = useState("")
	const [typeFilter, setTypeFilter] = useState("all")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [sortField, setSortField] = useState<"amount" | "created_at" | "type" | null>(null)
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
	
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
	const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
	const { toast } = useToast()
	const apiFetch = useApi()

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

	// Fetch transactions
	const fetchTransactions = async () => {
		setLoading(true)
		setError("")
		try {
			const params = new URLSearchParams({
				page: currentPage.toString(),
				page_size: itemsPerPage.toString(),
			})
			if (searchTerm.trim() !== "") {
				params.append("search", searchTerm)
			}
			if (typeFilter !== "all") {
				params.append("type", typeFilter)
			}
			const orderingParam = sortField
				? `&ordering=${(sortDirection === "asc" ? "+" : "-")}${sortField}`
				: ""
			const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/account/transactions/?${params.toString()}${orderingParam}`
			const data = await apiFetch(endpoint)
			setTransactions(data.results || [])
			setTotalCount(data.count || 0)
			setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
		} catch (err: any) {
			const errorMessage = extractErrorMessages(err)
			setError(errorMessage)
			setTransactions([])
			setTotalCount(0)
			setTotalPages(1)
			toast({ title: t("payment.failedToLoadTransactions"), description: errorMessage, variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchTransactions()
	}, [searchTerm, currentPage, itemsPerPage, baseUrl, typeFilter, sortField, sortDirection, t, toast, apiFetch])

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

	const startIndex = (currentPage - 1) * itemsPerPage

	const handleSort = (field: "amount" | "created_at" | "type") => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc")
		} else {
			setSortField(field)
			setSortDirection("desc")
		}
	}

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
		} catch (err: any) {
			const errorMessage = extractErrorMessages(err)
			setCreateError(errorMessage)
			toast({ title: t("payment.createFailed"), description: errorMessage, variant: "destructive" })
		} finally {
			setCreateLoading(false)
		}
	}

	const getTransactionIcon = (type: string, isCredit: boolean) => {
		if (isCredit) {
			return <TrendingUp className="h-4 w-4 text-green-600" />
		} else {
			return <TrendingDown className="h-4 w-4 text-red-600" />
		}
	}

	const getTransactionBadgeVariant = (type: string) => {
		switch (type) {
			case "deposit":
				return "default"
			case "withdraw":
				return "secondary"
			case "recharge":
				return "outline"
			default:
				return "secondary"
		}
	}

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

	const refreshTransactions = async () => {
		await fetchTransactions()
		toast({ 
			title: t("payment.transactionsRefreshed") || "Transactions Refreshed", 
			description: t("payment.transactionDataUpdated") || "Transaction data has been updated"
		})
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
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
						<CardTitle>{t("payment.transactionHistory") || "Transaction History"}</CardTitle>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" onClick={refreshTransactions} disabled={loading}>
								<RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
								{t("common.refresh") || "Refresh"}
							</Button>
							{/* <Button onClick={() => setCreateModalOpen(true)}>
								<Plus className="h-4 w-4 mr-2" />
								{t("payment.newTransaction") || "New Transaction"}
							</Button> */}
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Search & Filter */}
					<div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								placeholder={t("payment.searchTransactions") || "Search transactions..."}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
						<select
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value)}
							className="w-full sm:w-48 border rounded px-3 py-2 bg-background"
						>
							<option value="all">{t("payment.allTypes") || "All Types"}</option>
							<option value="deposit">{t("payment.deposit") || "Deposit"}</option>
							<option value="withdraw">{t("payment.withdraw") || "Withdraw"}</option>
							<option value="recharge">{t("payment.recharge") || "Recharge"}</option>
						</select>
					</div>

					{/* Table */}
					<div className="rounded-md border">
						{loading ? (
							<div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>
						) : error ? (
							<ErrorDisplay
								error={error}
								onRetry={() => {
									setCurrentPage(1)
									setError("")
								}}
								variant="full"
								showDismiss={false}
							/>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("payment.reference") || "Reference"}</TableHead>
										<TableHead>
											<Button variant="ghost" onClick={() => handleSort("type")} className="h-auto p-0 font-semibold">
												{t("payment.type") || "Type"}
												<ArrowUpDown className="ml-2 h-4 w-4" />
											</Button>
										</TableHead>
										<TableHead>
											<Button variant="ghost" onClick={() => handleSort("amount")} className="h-auto p-0 font-semibold">
												{t("payment.amount") || "Amount"}
												<ArrowUpDown className="ml-2 h-4 w-4" />
											</Button>
										</TableHead>
										<TableHead>{t("payment.balanceBefore") || "Balance Before"}</TableHead>
										<TableHead>{t("payment.balanceAfter") || "Balance After"}</TableHead>
										<TableHead>{t("payment.description") || "Description"}</TableHead>
										<TableHead>
											<Button variant="ghost" onClick={() => handleSort("created_at")} className="h-auto p-0 font-semibold">
												{t("payment.date") || "Date"}
												<ArrowUpDown className="ml-2 h-4 w-4" />
											</Button>
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{transactions.length === 0 ? (
										<TableRow>
											<TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
												{t("payment.noTransactions") || "No transactions found"}
											</TableCell>
										</TableRow>
									) : (
										transactions.map((transaction) => (
											<TableRow key={transaction.uid}>
												<TableCell>
													<div className="flex items-center gap-2">
														<span className="font-mono text-sm">{transaction.reference}</span>
														<Button
															variant="ghost"
															size="icon"
															className="h-5 w-5"
															onClick={() => {
																navigator.clipboard.writeText(transaction.reference)
																toast({ title: t("payment.referenceCopied") || "Reference copied!" })
															}}
														>
															<Copy className="h-3 w-3" />
														</Button>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														{getTransactionIcon(transaction.type, transaction.is_credit)}
														<Badge variant={getTransactionBadgeVariant(transaction.type)}>
															{transaction.type_display || transaction.type}
														</Badge>
													</div>
												</TableCell>
												<TableCell className={`font-semibold ${transaction.is_credit ? 'text-green-600' : 'text-red-600'}`}>
													{transaction.formatted_amount}
												</TableCell>
												<TableCell>{transaction.balance_before} FCFA</TableCell>
												<TableCell>{transaction.balance_after} FCFA</TableCell>
												<TableCell className="max-w-xs truncate" title={transaction.description}>
													{transaction.description}
												</TableCell>
												<TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						)}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between mt-6">
							<div className="text-sm text-muted-foreground">
								{`${t("payment.showingResults") || "Showing"}: ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalCount)} / ${totalCount}`}
							</div>
							<div className="flex items-center space-x-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
									disabled={currentPage === 1}
								>
									<ChevronLeft className="h-4 w-4 mr-1" />
									{t("common.previous")}
								</Button>
								<div className="text-sm">
									{`${t("payment.pageOf") || "Page"}: ${currentPage}/${totalPages}`}
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
									disabled={currentPage === totalPages}
								>
									{t("common.next")}
									<ChevronRight className="h-4 w-4 ml-1" />
								</Button>
							</div>
						</div>
					)}
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