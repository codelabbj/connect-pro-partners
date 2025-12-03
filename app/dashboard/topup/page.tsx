
// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { useLanguage } from "@/components/providers/language-provider"
// import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Copy } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
// import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
// import { useApi } from "@/lib/useApi"

// export default function TopupPage() {
// 	const [searchTerm, setSearchTerm] = useState("")
// 	const [statusFilter, setStatusFilter] = useState("all")
// 	const [currentPage, setCurrentPage] = useState(1)
// 	const [topups, setTopups] = useState<any[]>([])
// 	const [totalCount, setTotalCount] = useState(0)
// 	const [totalPages, setTotalPages] = useState(1)
// 	const [loading, setLoading] = useState(false)
// 	const [error, setError] = useState("")
// 	const [sortField, setSortField] = useState<"amount" | "created_at" | "status" | null>(null)
// 	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
// 	const { t } = useLanguage()
// 	const itemsPerPage = 10
// 	const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
// 	const { toast } = useToast()
// 	const apiFetch = useApi();
// 	const [detailModalOpen, setDetailModalOpen] = useState(false)
// 	const [detailTopup, setDetailTopup] = useState<any | null>(null)
// 	const [detailLoading, setDetailLoading] = useState(false)
// 	const [detailError, setDetailError] = useState("")
	
// 	// Approve/Reject modal state
// 	const [actionModalOpen, setActionModalOpen] = useState(false);
// 	const [actionType, setActionType] = useState<"approve"|"reject"|null>(null);
// 	const [actionTopup, setActionTopup] = useState<any|null>(null);
// 	const [adminNotes, setAdminNotes] = useState("");
// 	const [rejectionReason, setRejectionReason] = useState("");
// 	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
// 	const [pendingAction, setPendingAction] = useState(false);
// 	const [disabledTopups, setDisabledTopups] = useState<{[uid:string]:"approved"|"rejected"|undefined}>({});

// 	// Fetch topups from API
// 	useEffect(() => {
// 		const fetchTopups = async () => {
// 			setLoading(true)
// 			setError("")
// 			try {
// 				const params = new URLSearchParams({
// 					page: currentPage.toString(),
// 					page_size: itemsPerPage.toString(),
// 				})
// 				if (searchTerm.trim() !== "") {
// 					params.append("search", searchTerm)
// 				}
// 				if (statusFilter !== "all") {
// 					params.append("status", statusFilter)
// 				}
// 				const orderingParam = sortField
// 					? `&ordering=${(sortDirection === "asc" ? "+" : "-")}${sortField}`
// 					: ""
// 				const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/recharge-requests/?${params.toString()}${orderingParam}`
// 				const data = await apiFetch(endpoint)
// 				setTopups(data.results || [])
// 				setTotalCount(data.count || 0)
// 				setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
// 				toast({ title: t("topup.success"), description: t("topup.loadedSuccessfully") })
// 			} catch (err: any) {
// 				const errorMessage = extractErrorMessages(err)
// 				setError(errorMessage)
// 				setTopups([])
// 				setTotalCount(0)
// 				setTotalPages(1)
// 				toast({ title: t("topup.failedToLoad"), description: errorMessage, variant: "destructive" })
// 			} finally {
// 				setLoading(false)
// 			}
// 		}
// 		fetchTopups()
// 	}, [searchTerm, currentPage, itemsPerPage, baseUrl, statusFilter, sortField, sortDirection, t, toast, apiFetch])

// 	const startIndex = (currentPage - 1) * itemsPerPage

// 	const handleSort = (field: "amount" | "created_at" | "status") => {
// 		if (sortField === field) {
// 			setSortDirection(sortDirection === "asc" ? "desc" : "asc")
// 		} else {
// 			setSortField(field)
// 			setSortDirection("desc")
// 		}
// 	}

// 	// Fetch topup details
// 	const handleOpenDetail = async (uid: string) => {
// 		setDetailModalOpen(true)
// 		setDetailLoading(true)
// 		setDetailError("")
// 		setDetailTopup(null)
// 		try {
// 			// For demo, just find in topups
// 			const found = topups.find((t) => t.uid === uid)
// 			setDetailTopup(found)
// 			toast({ title: t("topup.detailLoaded"), description: t("topup.detailLoadedSuccessfully") })
// 		} catch (err: any) {
// 			setDetailError(extractErrorMessages(err))
// 			toast({ title: t("topup.detailFailed"), description: extractErrorMessages(err), variant: "destructive" })
// 		} finally {
// 			setDetailLoading(false)
// 		}
// 	}

// 	const handleCloseDetail = () => {
// 		setDetailModalOpen(false)
// 		setDetailTopup(null)
// 		setDetailError("")
// 	}

// 	return (
// 		<>
// 			<Card>
// 				<CardHeader>
// 					<CardTitle>{t("topup.title") || "Top Up Requests"}</CardTitle>
// 				</CardHeader>
// 				<CardContent>
// 					{/* Search & Filter */}
// 					<div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
// 						<div className="relative flex-1">
// 							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
// 							<Input
// 								placeholder={t("topup.search") || "Search"}
// 								value={searchTerm}
// 								onChange={(e) => setSearchTerm(e.target.value)}
// 								className="pl-10"
// 							/>
// 						</div>
// 						<select
// 							value={statusFilter}
// 							onChange={(e) => setStatusFilter(e.target.value)}
// 							className="w-full sm:w-48 border rounded px-2 py-1"
// 						>
// 							<option value="all">{t("topup.allStatuses") || "All Statuses"}</option>
// 							<option value="pending">{t("topup.pending") || "Pending"}</option>
// 							<option value="approved">{t("topup.approved") || "Approved"}</option>
// 							<option value="rejected">{t("topup.rejected") || "Rejected"}</option>
// 							<option value="expired">{t("topup.expired") || "Expired"}</option>
// 						</select>
// 					</div>

// 					{/* Table */}
// 					<div className="rounded-md border">
// 						{loading ? (
// 							<div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>
// 						) : error ? (
// 							<ErrorDisplay
// 								error={error}
// 								onRetry={() => {
// 									setCurrentPage(1)
// 									setError("")
// 								}}
// 								variant="full"
// 								showDismiss={false}
// 							/>
// 						) : (
// 							<Table>
// 								<TableHeader>
// 									<TableRow>
// 										<TableHead>{t("topup.uid") || "UID"}</TableHead>
// 										<TableHead>
// 											<Button variant="ghost" onClick={() => handleSort("amount")} className="h-auto p-0 font-semibold">
// 												{t("topup.amount") || "Amount"}
// 												<ArrowUpDown className="ml-2 h-4 w-4" />
// 											</Button>
// 										</TableHead>
// 										<TableHead>{t("topup.formattedAmount") || "Formatted Amount"}</TableHead>
// 										<TableHead>
// 											<Button variant="ghost" onClick={() => handleSort("status")} className="h-auto p-0 font-semibold">
// 												{t("topup.status") || "Status"}
// 												<ArrowUpDown className="ml-2 h-4 w-4" />
// 											</Button>
// 										</TableHead>
// 										<TableHead>{t("topup.userName") || "User Name"}</TableHead>
// 										<TableHead>{t("topup.userEmail") || "User Email"}</TableHead>
// 										<TableHead>{t("topup.reference") || "Reference"}</TableHead>
// 										<TableHead>
// 											<Button variant="ghost" onClick={() => handleSort("created_at")} className="h-auto p-0 font-semibold">
// 												{t("topup.createdAt") || "Created At"}
// 												<ArrowUpDown className="ml-2 h-4 w-4" />
// 											</Button>
// 										</TableHead>
// 										<TableHead>{t("topup.details") || "Details"}</TableHead>
// 									</TableRow>
// 								</TableHeader>
// 								<TableBody>
// 									{topups.map((topup) => (
// 										<TableRow key={topup.uid}>
// 											<TableCell>{topup.uid}</TableCell>
// 											<TableCell>{topup.amount}</TableCell>
// 											<TableCell>{topup.formatted_amount}</TableCell>
// 											<TableCell>
// 												<Badge variant={topup.status === "pending" ? "outline" : topup.status === "approved" ? "default" : "secondary"}>{topup.status_display || topup.status}</Badge>
// 											</TableCell>
// 											<TableCell>{topup.user_name}</TableCell>
// 											<TableCell>{topup.user_email}</TableCell>
// 											<TableCell>{topup.reference}</TableCell>
// 											<TableCell>{topup.created_at ? topup.created_at.split("T")[0] : "-"}</TableCell>
// 											<TableCell>
// 												<Button size="sm" variant="secondary" onClick={() => handleOpenDetail(topup.uid)}>
// 													{t("topup.details") || "Details"}
// 													{/* Approve Button */}
// 													<Button
// 														size="sm"
// 														variant="default"
// 														className="ml-2"
// 														disabled={!!disabledTopups[topup.uid] || topup.status !== "pending"}
// 														onClick={() => {
// 															setActionType("approve");
// 															setActionTopup(topup);
// 															setAdminNotes("");
// 															setActionModalOpen(true);
// 														}}
// 													>
// 														{disabledTopups[topup.uid] === "approved" ? t("topup.approved") || "Approved" : t("topup.approve") || "Approve"}
// 													</Button>
// 													{/* Reject Button */}
// 													<Button
// 														size="sm"
// 														variant="destructive"
// 														className="ml-2"
// 														disabled={!!disabledTopups[topup.uid] || topup.status !== "pending"}
// 														onClick={() => {
// 															setActionType("reject");
// 															setActionTopup(topup);
// 															setAdminNotes("");
// 															setRejectionReason("");
// 															setActionModalOpen(true);
// 														}}
// 													>
// 														{disabledTopups[topup.uid] === "rejected" ? t("topup.rejected") || "Rejected" : t("topup.reject") || "Reject"}
// 													</Button>
// 												</Button>
// 											</TableCell>
// 										</TableRow>
// 									))}
// 								</TableBody>
// 							</Table>
// 						)}
// 					</div>

// 					{/* Pagination */}
// 					<div className="flex items-center justify-between mt-6">
// 						<div className="text-sm text-muted-foreground">
// 							{`${t("topup.showingResults") || "Showing"}: ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalCount)} / ${totalCount}`}
// 						</div>
// 						<div className="flex items-center space-x-2">
// 							<Button
// 								variant="outline"
// 								size="sm"
// 								onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
// 								disabled={currentPage === 1}
// 							>
// 								<ChevronLeft className="h-4 w-4 mr-1" />
// 								{t("common.previous")}
// 							</Button>
// 							<div className="text-sm">
// 								{`${t("topup.pageOf") || "Page"}: ${currentPage}/${totalPages}`}
// 							</div>
// 							<Button
// 								variant="outline"
// 								size="sm"
// 								onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
// 								disabled={currentPage === totalPages}
// 							>
// 								{t("common.next")}
// 								<ChevronRight className="h-4 w-4 ml-1" />
// 							</Button>
// 						</div>
// 					</div>
// 				</CardContent>
// 			</Card>

// 			{/* Topup Details Modal */}
// 			<Dialog open={detailModalOpen} onOpenChange={(open) => { if (!open) handleCloseDetail() }}>
// 				<DialogContent>
// 					<DialogHeader>
// 						<DialogTitle>{t("topup.details") || "Top Up Details"}</DialogTitle>
// 					</DialogHeader>
// 					{detailLoading ? (
// 						<div className="p-4 text-center">{t("common.loading")}</div>
// 					) : detailError ? (
// 						<ErrorDisplay
// 							error={detailError}
// 							variant="inline"
// 							showRetry={false}
// 							className="mb-4"
// 						/>
// 					) : detailTopup ? (
// 						<div className="space-y-2">
// 							<div className="flex items-center gap-2">
// 								<b>{t("topup.uid") || "UID"}:</b> {detailTopup.uid}
// 								<Button
// 									variant="ghost"
// 									size="icon"
// 									className="h-5 w-5"
// 									onClick={() => {
// 										navigator.clipboard.writeText(detailTopup.uid)
// 										toast({ title: t("topup.copiedUid") || "UID copied!" })
// 									}}
// 									aria-label={t("topup.copyUid") || "Copy UID"}
// 								>
// 									<Copy className="h-4 w-4" />
// 								</Button>
// 							</div>
// 							<div><b>{t("topup.amount") || "Amount"}:</b> {detailTopup.amount}</div>
// 							<div><b>{t("topup.formattedAmount") || "Formatted Amount"}:</b> {detailTopup.formatted_amount}</div>
// 							<div><b>{t("topup.status") || "Status"}:</b> {detailTopup.status_display || detailTopup.status}</div>
// 							<div><b>{t("topup.userName") || "User Name"}:</b> {detailTopup.user_name}</div>
// 							<div><b>{t("topup.userEmail") || "User Email"}:</b> {detailTopup.user_email}</div>
// 							<div><b>{t("topup.reference") || "Reference"}:</b> {detailTopup.reference}</div>
// 							<div><b>{t("topup.createdAt") || "Created At"}:</b> {detailTopup.created_at ? detailTopup.created_at.split("T")[0] : "-"}</div>
// 							<div><b>{t("topup.expiresAt") || "Expires At"}:</b> {detailTopup.expires_at ? detailTopup.expires_at.split("T")[0] : "-"}</div>
// 							<div><b>{t("topup.proofDescription") || "Proof Description"}:</b> {detailTopup.proof_description}</div>
// 							<div><b>{t("topup.adminNotes") || "Admin Notes"}:</b> {detailTopup.admin_notes}</div>
// 							<div><b>{t("topup.rejectionReason") || "Rejection Reason"}:</b> {detailTopup.rejection_reason}</div>
// 						</div>
// 					) : null}
// 					<DialogClose asChild>
// 						<Button className="mt-4 w-full">{t("common.close")}</Button>
// 					</DialogClose>
// 				</DialogContent>
// 			</Dialog>
// 		</>
// 	)
// }


"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Copy, Plus, Upload, Zap, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useApi } from "@/lib/useApi"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DateFilter } from "@/components/ui/date-filter"

export default function UserTopupPage() {
	const [searchTerm, setSearchTerm] = useState("")
	const [statusFilter, setStatusFilter] = useState("all")
	const [startDate, setStartDate] = useState("")
	const [endDate, setEndDate] = useState("")
	const [currentPage, setCurrentPage] = useState(1)
	const [topups, setTopups] = useState<any[]>([])
	const [totalCount, setTotalCount] = useState(0)
	const [totalPages, setTotalPages] = useState(1)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [sortField, setSortField] = useState<"amount" | "created_at" | "status" | null>(null)
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
	const { t } = useLanguage()
	const itemsPerPage = 10
	const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
	const { toast } = useToast()
	const apiFetch = useApi();
	const [detailModalOpen, setDetailModalOpen] = useState(false)
	const [detailTopup, setDetailTopup] = useState<any | null>(null)
	const [detailLoading, setDetailLoading] = useState(false)
	const [detailError, setDetailError] = useState("")
	
	// Recharge type toggle (normal vs auto-recharge)
	const [rechargeType, setRechargeType] = useState<"normal" | "auto">("normal")
	
	// Create topup modal state
	const [createModalOpen, setCreateModalOpen] = useState(false)
	const [createLoading, setCreateLoading] = useState(false)
	const [createError, setCreateError] = useState("")
	const [formData, setFormData] = useState({
		amount: "",
		proof_image: null as File | null,
		proof_description: "",
		transaction_date: ""
	})
	
	// Auto-recharge form state
	const [autoRechargeForm, setAutoRechargeForm] = useState({
		network: "",
		phone_number: "",
		amount: ""
	})
	const [autoRechargeNetworks, setAutoRechargeNetworks] = useState<any[]>([])
	const [autoRechargeLoading, setAutoRechargeLoading] = useState(false)
	const [autoRechargeSubmitting, setAutoRechargeSubmitting] = useState(false)

	// Payment link modal state
	const [paymentLinkModalOpen, setPaymentLinkModalOpen] = useState(false)
	const [paymentLink, setPaymentLink] = useState<string | null>(null)
	const [paymentUssd, setPaymentUssd] = useState<string | null>(null)

	// Fetch topups from API
	useEffect(() => {
		const fetchTopups = async () => {
			setLoading(true)
			setError("")
			try {
				const params = new URLSearchParams({
					page: currentPage.toString(),
				})
				if (searchTerm.trim() !== "") {
					params.append("search", searchTerm)
				}
				if (statusFilter !== "all") {
					params.append("status", statusFilter)
				}
				// Add date filters
				if (startDate) {
					params.append("created_at__gte", startDate)
				}
				if (endDate) {
					params.append("created_at__lte", endDate)
				}
				
				// Use different API endpoints based on recharge type
				let endpoint = ""
				if (rechargeType === "auto") {
					// Auto-recharge transactions API
					const orderingParam = sortField
						? `&ordering=${(sortDirection === "asc" ? "+" : "-")}${sortField === "amount" ? "amount" : "created_at"}`
						: ""
					endpoint = `${baseUrl.replace(/\/$/, "")}/api/auto-recharge/transactions/?${params.toString()}${orderingParam}`
				} else {
					// Normal recharge API
					params.append("page_size", itemsPerPage.toString())
					const orderingParam = sortField
						? `&ordering=${(sortDirection === "asc" ? "+" : "-")}${sortField}`
						: ""
					endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/recharges/?${params.toString()}${orderingParam}`
				}
				
				const data = await apiFetch(endpoint)

				// Safely process the results to ensure no objects are rendered directly
				const safeResults = (data.results || []).map((item: any) => {
					console.log('Processing item:', item.uid, 'Network:', item.network, 'Network type:', typeof item.network);
					return {
					...item,
					reference: typeof item.reference === 'string' ? item.reference : String(item.reference || ''),
					amount: typeof item.amount === 'string' || typeof item.amount === 'number' ? item.amount : 0,
					formatted_amount: typeof item.formatted_amount === 'string' ? item.formatted_amount : '',
					status: typeof item.status === 'string' ? item.status : 'unknown',
					status_display: typeof item.status_display === 'string' ? item.status_display : '',
					phone_number: typeof item.phone_number === 'string' ? item.phone_number : '',
					network_name: typeof item.network_name === 'string' ? item.network_name : '',
					network_code: typeof item.network_code === 'string' ? item.network_code : '',
					network: typeof item.network === 'object' ? item.network : null,
					created_at: typeof item.created_at === 'string' ? item.created_at : '',
					expires_at: typeof item.expires_at === 'string' ? item.expires_at : '',
					time_remaining: typeof item.time_remaining === 'string' ? item.time_remaining : '',
					is_expired: typeof item.is_expired === 'boolean' ? item.is_expired : false,
					can_submit_proof: typeof item.can_submit_proof === 'boolean' ? item.can_submit_proof : false,
					reviewed_at: typeof item.reviewed_at === 'string' ? item.reviewed_at : '',
					processed_at: typeof item.processed_at === 'string' ? item.processed_at : '',
					proof_description: typeof item.proof_description === 'string' ? item.proof_description : '',
					rejection_reason: typeof item.rejection_reason === 'string' ? item.rejection_reason : '',
					admin_notes: typeof item.admin_notes === 'string' ? item.admin_notes : '',
					transaction_date: typeof item.transaction_date === 'string' ? item.transaction_date : '',
				}
				})

				setTopups(safeResults)
				setTotalCount(data.count || 0)
				setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
			} catch (err: any) {
				const errorMessage = extractErrorMessages(err)
				setError(errorMessage)
				setTopups([])
				setTotalCount(0)
				setTotalPages(1)
				toast({ title: t("topup.failedToLoad"), description: errorMessage, variant: "destructive" })
			} finally {
				setLoading(false)
			}
		}
		fetchTopups()
	}, [searchTerm, currentPage, itemsPerPage, baseUrl, statusFilter, startDate, endDate, sortField, sortDirection, rechargeType, t, toast, apiFetch])

	const startIndex = (currentPage - 1) * itemsPerPage

	const handleSort = (field: "amount" | "created_at" | "status") => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc")
		} else {
			setSortField(field)
			setSortDirection("desc")
		}
	}

	const handleClearDates = () => {
		setStartDate("")
		setEndDate("")
		setCurrentPage(1)
	}

	// Fetch topup details
	const handleOpenDetail = async (uid: string) => {
		setDetailModalOpen(true)
		setDetailLoading(true)
		setDetailError("")
		setDetailTopup(null)
		try {
			// For demo, just find in topups
			const found = topups.find((t) => t.uid === uid)
			// Ensure the found item is safe (should already be safe from preprocessing, but double-check)
			if (found) {
				setDetailTopup({
					...found,
					reference: typeof found.reference === 'string' ? found.reference : 'N/A',
					formatted_amount: typeof found.formatted_amount === 'string' ? found.formatted_amount : 'N/A',
					status_display: typeof found.status_display === 'string' ? found.status_display : '',
					status: typeof found.status === 'string' ? found.status : 'unknown',
				})
			} else {
				setDetailTopup(null)
			}
			toast({
				title: t("topup.detailLoaded"),
				description: t("topup.detailLoadedSuccessfully"),
				variant: "default",
				className: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200"
			})
		} catch (err: any) {
			setDetailError(extractErrorMessages(err))
			toast({ title: t("topup.detailFailed"), description: extractErrorMessages(err), variant: "destructive" })
		} finally {
			setDetailLoading(false)
		}
	}

	const handleCloseDetail = () => {
		setDetailModalOpen(false)
		setDetailTopup(null)
		setDetailError("")
	}

	// Handle create topup
	const handleCreateTopup = async () => {
		setCreateLoading(true)
		setCreateError("")
		try {
			const formDataPayload = new FormData()
			formDataPayload.append("amount", formData.amount)
			if (formData.proof_image) {
				formDataPayload.append("proof_image", formData.proof_image)
			}
			formDataPayload.append("proof_description", formData.proof_description)
			if (formData.transaction_date) {
				formDataPayload.append("transaction_date", formData.transaction_date)
			}

			const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/recharges/`
			await apiFetch(endpoint, {
				method: "POST",
				body: formDataPayload
			})
			
			toast({
				title: t("topup.success"),
				description: t("topup.createdSuccessfully"),
				variant: "default",
				className: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200"
			})
			setCreateModalOpen(false)
			setFormData({
				amount: "",
				proof_image: null,
				proof_description: "",
				transaction_date: ""
			})
			// Refresh the list
			setCurrentPage(1)
		} catch (err: any) {
			const errorMessage = extractErrorMessages(err)
			setCreateError(errorMessage)
			toast({ title: t("topup.createFailed"), description: errorMessage, variant: "destructive" })
		} finally {
			setCreateLoading(false)
		}
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setFormData(prev => ({ ...prev, proof_image: file }))
		}
	}

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "pending":
				return "outline"
			case "approved":
			case "completed":
			case "success":
				return "default"
			case "rejected":
			case "failed":
				return "destructive"
			case "expired":
			case "cancelled":
				return "secondary"
			case "processing":
			case "initiated":
				return "outline"
			default:
				return "secondary"
		}
	}

	const formatTimeRemaining = (timeRemaining: string) => {
		if (!timeRemaining) return "-"
		const seconds = parseFloat(timeRemaining)
		const hours = Math.floor(seconds / 3600)
		const minutes = Math.floor((seconds % 3600) / 60)
		return `${hours}h ${minutes}m`
	}

	const getNetworkDisplayName = (topup: any) => {
		console.log('getNetworkDisplayName called for:', topup.uid, 'network:', topup.network, 'network_name:', topup.network_name, 'network_code:', topup.network_code)

		// Check top-level network_name first
		if (topup.network_name && typeof topup.network_name === 'string') {
			console.log('Returning network_name:', topup.network_name)
			return topup.network_name
		}

		// Check top-level network_code
		if (topup.network_code && typeof topup.network_code === 'string') {
			console.log('Returning network_code:', topup.network_code)
			return topup.network_code
		}

		// Check network object
		if (topup.network && typeof topup.network === 'object') {
			const networkObj = topup.network as any
			console.log('Network object found:', networkObj)

			// Try to get name with country
			if (networkObj.nom) {
				const name = String(networkObj.nom)
				const country = networkObj.country_name ? String(networkObj.country_name) : null
				const result = country ? `${name} (${country})` : name
				console.log('Returning network nom:', result)
				return result
			}

			// Fallback to network code
			if (networkObj.code) {
				console.log('Returning network code:', networkObj.code)
				return String(networkObj.code)
			}
		}

		console.log('Returning N/A')
		return 'N/A'
	}

	// Fetch auto-recharge networks
	useEffect(() => {
		if (rechargeType === "auto" && autoRechargeNetworks.length === 0) {
			const fetchAutoRechargeNetworks = async () => {
				setAutoRechargeLoading(true)
				try {
					const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auto-recharge/available-networks/`
					const data = await apiFetch(endpoint)
					setAutoRechargeNetworks(data.networks || [])
				} catch (err: any) {
					const errorMessage = extractErrorMessages(err)
					toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
				} finally {
					setAutoRechargeLoading(false)
				}
			}
			fetchAutoRechargeNetworks()
		}
	}, [rechargeType, baseUrl, apiFetch, toast])

	// Handle auto-recharge submission
	const handleAutoRechargeSubmit = async () => {
		if (!autoRechargeForm.network || !autoRechargeForm.phone_number || !autoRechargeForm.amount) {
			toast({ 
				title: t("common.error") || "Error", 
				description: t("topup.fillAllFields") || "Please fill all fields", 
				variant: "destructive" 
			})
			return
		}

		setAutoRechargeSubmitting(true)
		try {
			const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auto-recharge/initiate/`
			const payload = {
				network: autoRechargeForm.network,
				amount: parseFloat(autoRechargeForm.amount),
				phone_number: autoRechargeForm.phone_number
			}

			const data = await apiFetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})

			// Check if transaction actually failed despite API success
			const transactionStatus = data.transaction?.status
			const hasError = transactionStatus === 'failed'

			if (hasError && data.transaction?.error_message) {
				toast({
					title: t("topup.failed") || "Failed",
					description: data.transaction.error_message,
					variant: "destructive"
				})
			} else if (data.transaction && transactionStatus) {
				// Transaction was created successfully
				toast({
					title: t("topup.success") || "Success",
					description: typeof data.message === 'string' ? data.message : (t("topup.createdSuccessfully") || "Recharge initiated successfully"),
					variant: "default",
					className: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200"
				})

				// Check for payment link or USSD (transaction level first, then network level)
				const paymentLink = data.transaction.payment_link || (data.transaction.network?.payment_link && data.transaction.network.payment_link.trim() !== '' ? data.transaction.network.payment_link : null)
				const paymentUssd = data.transaction.payment_ussd || (data.transaction.network?.payment_ussd && data.transaction.network.payment_ussd.trim() !== '' ? data.transaction.network.payment_ussd : null)

				if (paymentLink) {
					setPaymentLink(paymentLink)
					setPaymentUssd(null)
					setPaymentLinkModalOpen(true)
				} else if (paymentUssd) {
					setPaymentUssd(paymentUssd)
					setPaymentLink(null)
					// Try to open phone dialer
					try {
						window.location.href = `tel:${paymentUssd}`
						// Show modal as fallback after 2 seconds in case dialer doesn't work
						setTimeout(() => {
							if (!paymentLinkModalOpen) {
								setPaymentLinkModalOpen(true)
							}
						}, 2000)
					} catch (error) {
						// If dialer fails immediately, show modal
						setPaymentLinkModalOpen(true)
					}
				}

				// Close modal
				setCreateModalOpen(false)

				// Reset form
				setAutoRechargeForm({
					network: "",
					phone_number: "",
					amount: ""
				})

				// Refresh the list
				setCurrentPage(1)
			} else if (data.success) {
				toast({
					title: t("topup.success") || "Success",
					description: typeof data.message === 'string' ? data.message : (t("topup.createdSuccessfully") || "Recharge initiated successfully"),
					variant: "default",
					className: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200"
				})

				// Check for payment link or USSD in transaction (transaction level first, then network level)
				const paymentLink = data.transaction?.payment_link || (data.transaction?.network?.payment_link && data.transaction.network.payment_link.trim() !== '' ? data.transaction.network.payment_link : null)
				const paymentUssd = data.transaction?.payment_ussd || (data.transaction?.network?.payment_ussd && data.transaction.network.payment_ussd.trim() !== '' ? data.transaction.network.payment_ussd : null)

				if (paymentLink) {
					setPaymentLink(paymentLink)
					setPaymentUssd(null)
					setPaymentLinkModalOpen(true)
				} else if (paymentUssd) {
					setPaymentUssd(paymentUssd)
					setPaymentLink(null)
					// Try to open phone dialer
					try {
						window.location.href = `tel:${paymentUssd}`
						// Show modal as fallback after 2 seconds in case dialer doesn't work
						setTimeout(() => {
							if (!paymentLinkModalOpen) {
								setPaymentLinkModalOpen(true)
							}
						}, 2000)
					} catch (error) {
						// If dialer fails immediately, show modal
						setPaymentLinkModalOpen(true)
					}
				}

				// Close modal
				setCreateModalOpen(false)

				// Reset form
				setAutoRechargeForm({
					network: "",
					phone_number: "",
					amount: ""
				})

				// Refresh the list
				setCurrentPage(1)
			} else {
				toast({
					title: t("common.error") || "Error",
					description: typeof data.message === 'string' ? data.message : (t("topup.createFailed") || "Failed to initiate recharge"),
					variant: "destructive"
				})
			}
		} catch (err: any) {
			const errorMessage = extractErrorMessages(err)
			toast({ title: t("common.error") || "Error", description: errorMessage, variant: "destructive" })
		} finally {
			setAutoRechargeSubmitting(false)
		}
	}

	return (
		<div className="container mx-auto p-6">
			<Card>
				<CardHeader>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
							<CardTitle className="text-lg sm:text-xl">{t("topup.title") || "My Top Up Requests"}</CardTitle>
							<Button 
								onClick={() => setCreateModalOpen(true)}
								size="sm"
								className="w-full sm:w-auto"
							>
								<Plus className="h-4 w-4 mr-2" />
								{rechargeType === "normal" 
									? (t("topup.createNew") || "Create New Request")
									: (t("topup.createAutoRecharge") || "Create Auto-Recharge")
								}
							</Button>
						</div>
						
						{/* Recharge Type Toggle */}
						<div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
							<Button
								variant={rechargeType === "normal" ? "default" : "ghost"}
								size="sm"
								onClick={() => setRechargeType("normal")}
								className="flex items-center gap-2"
							>
								<CreditCard className="h-4 w-4" />
								{t("topup.normalRecharge") || "Normal Recharge"}
							</Button>
							<Button
								variant={rechargeType === "auto" ? "default" : "ghost"}
								size="sm"
								onClick={() => setRechargeType("auto")}
								className="flex items-center gap-2"
							>
								<Zap className="h-4 w-4" />
								{t("topup.autoRecharge") || "Auto-Recharge"}
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Search & Filter */}
					<div className="space-y-4 mb-6">
						<div className="flex flex-col sm:flex-row gap-4 items-center">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									placeholder={t("topup.search") || "Search by reference or amount"}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
							<select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
								className="w-full sm:w-48 border rounded px-3 py-2 bg-background"
							>
								<option value="all">{t("topup.allStatuses") || "All Statuses"}</option>
								<option value="pending">{t("topup.pending") || "Pending"}</option>
								{rechargeType === "normal" ? (
									<>
										<option value="approved">{t("topup.approved") || "Approved"}</option>
										<option value="rejected">{t("topup.rejected") || "Rejected"}</option>
										<option value="expired">{t("topup.expired") || "Expired"}</option>
									</>
								) : (
									<>
										<option value="processing">{t("topup.processing") || "Processing"}</option>
										<option value="success">{t("topup.success") || "Success"}</option>
										<option value="failed">{t("topup.failed") || "Failed"}</option>
										<option value="cancelled">{t("topup.cancelled") || "Cancelled"}</option>
									</>
								)}
							</select>
						</div>
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
						/>
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
										<TableHead>{t("topup.reference") || "Reference"}</TableHead>
									{rechargeType === "auto" && (
										<>
											<TableHead>{t("topup.network") || "Network"}</TableHead>
											<TableHead>{t("topup.phoneNumber") || "Phone Number"}</TableHead>
										</>
									)}
										<TableHead>
											<Button variant="ghost" onClick={() => handleSort("amount")} className="h-auto p-0 font-semibold">
												{t("topup.amount") || "Amount"}
												<ArrowUpDown className="ml-2 h-4 w-4" />
											</Button>
										</TableHead>
										<TableHead>
											<Button variant="ghost" onClick={() => handleSort("status")} className="h-auto p-0 font-semibold">
												{t("topup.status") || "Status"}
												<ArrowUpDown className="ml-2 h-4 w-4" />
											</Button>
										</TableHead>
										<TableHead>
											<Button variant="ghost" onClick={() => handleSort("created_at")} className="h-auto p-0 font-semibold">
												{t("topup.createdAt") || "Created At"}
												<ArrowUpDown className="ml-2 h-4 w-4" />
											</Button>
										</TableHead>
										{rechargeType === "normal" && (
											<>
												<TableHead>{t("topup.expiresAt") || "Expires At"}</TableHead>
												<TableHead>{t("topup.timeRemaining") || "Time Remaining"}</TableHead>
											</>
										)}
										<TableHead>{t("common.actions") || "Actions"}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{topups.length === 0 ? (
										<TableRow>
											<TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
												{t("topup.noRequests") || "No top-up requests found"}
											</TableCell>
										</TableRow>
									) : (
										topups.map((topup) => (
											<TableRow key={topup.uid}>
												<TableCell className="font-mono text-sm">{typeof topup.reference === 'string' ? topup.reference : 'N/A'}</TableCell>
												{rechargeType === "auto" && (
													<>
														<TableCell>
															{getNetworkDisplayName(topup)}
														</TableCell>
														<TableCell className="font-mono">
															{typeof topup.phone_number === 'string' ? topup.phone_number : '-'}
														</TableCell>
													</>
												)}
												<TableCell className="font-semibold">
													{rechargeType === "auto"
														? (typeof topup.amount === 'string' || typeof topup.amount === 'number' ? `${parseFloat(String(topup.amount)).toLocaleString()} FCFA` : '-')
														: (typeof topup.formatted_amount === 'string' ? topup.formatted_amount : '-')
													}
												</TableCell>
												<TableCell>
													<Badge variant={getStatusBadgeVariant(topup.status)}>
														{typeof topup.status_display === 'string' ? topup.status_display :
														 typeof topup.status === 'string' ? topup.status : 'Unknown'}
													</Badge>
												</TableCell>
												<TableCell>{topup.created_at ? new Date(topup.created_at).toLocaleDateString() : "-"}</TableCell>
												{rechargeType === "normal" && (
													<>
														<TableCell>{topup.expires_at ? new Date(topup.expires_at).toLocaleDateString() : "-"}</TableCell>
														<TableCell>
															{topup.is_expired ? (
																<Badge variant="destructive">{t("topup.expired") || "Expired"}</Badge>
															) : (
																<span className="text-sm text-muted-foreground">
																	{formatTimeRemaining(topup.time_remaining)}
																</span>
															)}
														</TableCell>
													</>
												)}
												<TableCell>
													<Button 
														size="sm" 
														variant="outline" 
														onClick={() => {
															if (rechargeType === "auto") {
																// Navigate to auto-recharge detail page
																window.location.href = `/dashboard/auto-recharge/${topup.uid}`
															} else {
																handleOpenDetail(topup.uid)
															}
														}}
													>
														{t("topup.viewDetails") || "View Details"}
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
					{totalPages > 1 && (
						<div className="flex items-center justify-between mt-6">
							<div className="text-sm text-muted-foreground">
								{`${t("topup.showingResults") || "Showing"}: ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, totalCount)} / ${totalCount}`}
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
									{`${t("topup.pageOf") || "Page"}: ${currentPage}/${totalPages}`}
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

			{/* Create Topup Modal */}
			<Dialog open={createModalOpen} onOpenChange={(open) => { 
				if (!open) {
					setCreateModalOpen(false)
					setCreateError("")
					if (rechargeType === "normal") {
						setFormData({
							amount: "",
							proof_image: null,
							proof_description: "",
							transaction_date: ""
						})
					} else {
						setAutoRechargeForm({
							network: "",
							phone_number: "",
							amount: ""
						})
					}
				}
			}}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>
							{rechargeType === "normal" 
								? (t("topup.createNew") || "Create New Top-Up Request")
								: (t("topup.createAutoRecharge") || "Create Auto-Recharge")
							}
						</DialogTitle>
					</DialogHeader>
					
					{createError && (
						<ErrorDisplay
							error={createError}
							variant="inline"
							showRetry={false}
							className="mb-4"
						/>
					)}

					{rechargeType === "normal" ? (
						// Normal Recharge Form
						<div className="space-y-4">
							<div>
								<Label htmlFor="amount">{t("topup.amount") || "Amount"} *</Label>
								<Input
									id="amount"
									type="number"
									placeholder="Enter amount (e.g., 50000)"
									value={formData.amount}
									onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
									required
								/>
							</div>

							<div>
								<Label htmlFor="proof_image">{t("topup.proofImage") || "Proof Image"}</Label>
								<div className="flex items-center gap-2">
									<Input
										id="proof_image"
										type="file"
										accept="image/*"
										onChange={handleFileChange}
										className="flex-1"
									/>
									{formData.proof_image && (
										<Badge variant="outline">{formData.proof_image.name}</Badge>
									)}
								</div>
							</div>

							<div>
								<Label htmlFor="proof_description">{t("topup.proofDescription") || "Proof Description"}</Label>
								<Textarea
									id="proof_description"
									placeholder="Describe your payment proof..."
									value={formData.proof_description}
									onChange={(e) => setFormData(prev => ({ ...prev, proof_description: e.target.value }))}
									rows={3}
								/>
							</div>

							<div>
								<Label htmlFor="transaction_date">{t("topup.transactionDate") || "Transaction Date"}</Label>
								<Input
									id="transaction_date"
									type="date"
									value={formData.transaction_date}
									onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
								/>
							</div>

							<div className="flex justify-end gap-2 mt-6">
								<DialogClose asChild>
									<Button variant="outline" disabled={createLoading}>
										{t("common.cancel") || "Cancel"}
									</Button>
								</DialogClose>
								<Button 
									onClick={handleCreateTopup} 
									disabled={createLoading || !formData.amount}
								>
									{createLoading ? t("common.creating") || "Creating..." : t("common.create") || "Create"}
								</Button>
							</div>
						</div>
					) : (
						// Auto-Recharge Form
						<div className="space-y-4">
							{autoRechargeLoading ? (
								<div className="p-4 text-center text-muted-foreground">{t("common.loading") || "Loading networks..."}</div>
							) : (
								<>
									<div>
										<Label htmlFor="auto_network">{t("topup.network") || "Network"} *</Label>
										<select
											id="auto_network"
											value={autoRechargeForm.network}
											onChange={(e) => setAutoRechargeForm(prev => ({ ...prev, network: e.target.value }))}
											className="w-full border rounded px-3 py-2 bg-background"
											required
										>
											<option value="">{t("topup.selectNetwork") || "Select Network"}</option>
											{autoRechargeNetworks.map((network) => (
												<option key={network.network.uid} value={network.network.uid}>
													{network.network.nom} ({network.network.country_name})
												</option>
											))}
										</select>
									</div>

									<div>
										<Label htmlFor="auto_phone">{t("topup.phoneNumber") || "Phone Number"} *</Label>
										<Input
											id="auto_phone"
											type="tel"
											placeholder="Ex: 0708958408"
											value={autoRechargeForm.phone_number}
											onChange={(e) => setAutoRechargeForm(prev => ({ ...prev, phone_number: e.target.value }))}
											required
										/>
									</div>

									<div>
										<Label htmlFor="auto_amount">{t("topup.amount") || "Amount"} (FCFA) *</Label>
										<Input
											id="auto_amount"
											type="number"
											placeholder={t("topup.amount") || "Enter amount"}
											value={autoRechargeForm.amount}
											onChange={(e) => setAutoRechargeForm(prev => ({ ...prev, amount: e.target.value }))}
											min={autoRechargeNetworks.find(n => n.network.uid === autoRechargeForm.network)?.min_amount || "0"}
											max={autoRechargeNetworks.find(n => n.network.uid === autoRechargeForm.network)?.max_amount || "1000000"}
											step="0.01"
											required
										/>
										{autoRechargeForm.network && (
											<p className="text-sm text-muted-foreground mt-1">
												{t("topup.limit") || "Limit"}: {parseFloat(autoRechargeNetworks.find(n => n.network.uid === autoRechargeForm.network)?.min_amount || "0").toLocaleString()} - {parseFloat(autoRechargeNetworks.find(n => n.network.uid === autoRechargeForm.network)?.max_amount || "0").toLocaleString()} FCFA
											</p>
										)}
									</div>

									<div className="flex justify-end gap-2 mt-6">
										<DialogClose asChild>
											<Button variant="outline" disabled={autoRechargeSubmitting}>
												{t("common.cancel") || "Cancel"}
											</Button>
										</DialogClose>
										<Button 
											onClick={handleAutoRechargeSubmit} 
											disabled={autoRechargeSubmitting || !autoRechargeForm.network || !autoRechargeForm.phone_number || !autoRechargeForm.amount}
										>
											{autoRechargeSubmitting ? t("common.creating") || "Creating..." : t("common.create") || "Create"}
										</Button>
									</div>
								</>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Topup Details Modal */}
			<Dialog open={detailModalOpen} onOpenChange={(open) => { if (!open) handleCloseDetail() }}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>{t("topup.details") || "Top Up Request Details"}</DialogTitle>
					</DialogHeader>
					{detailLoading ? (
						<div className="p-4 text-center">{t("common.loading")}</div>
					) : detailError ? (
						<ErrorDisplay
							error={detailError}
							variant="inline"
							showRetry={false}
							className="mb-4"
						/>
					) : detailTopup ? (
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-3">
									<div>
										<Label className="text-sm font-semibold">{t("topup.reference") || "Reference"}</Label>
										<div className="flex items-center gap-2">
											<span className="font-mono text-sm">{typeof detailTopup.reference === 'string' ? detailTopup.reference : 'N/A'}</span>
											<Button
												variant="ghost"
												size="icon"
												className="h-5 w-5"
												onClick={() => {
													const ref = typeof detailTopup.reference === 'string' ? detailTopup.reference : 'N/A'
													navigator.clipboard.writeText(ref)
													toast({
														title: t("topup.copiedReference") || "Reference copied!",
														variant: "default",
														className: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200"
													})
												}}
											>
												<Copy className="h-3 w-3" />
											</Button>
										</div>
									</div>
									
									<div>
										<Label className="text-sm font-semibold">{t("topup.amount") || "Amount"}</Label>
										<p className="text-lg font-semibold">{typeof detailTopup.formatted_amount === 'string' ? detailTopup.formatted_amount : 'N/A'}</p>
									</div>
									
									<div>
										<Label className="text-sm font-semibold">{t("topup.status") || "Status"}</Label>
										<div>
											<Badge variant={getStatusBadgeVariant(detailTopup.status)}>
												{typeof detailTopup.status_display === 'string' ? detailTopup.status_display :
												 typeof detailTopup.status === 'string' ? detailTopup.status : 'Unknown'}
											</Badge>
										</div>
									</div>

									<div>
										<Label className="text-sm font-semibold">{t("topup.createdAt") || "Created At"}</Label>
										<p>{detailTopup.created_at ? new Date(detailTopup.created_at).toLocaleString() : "-"}</p>
									</div>

									<div>
										<Label className="text-sm font-semibold">{t("topup.expiresAt") || "Expires At"}</Label>
										<p>{detailTopup.expires_at ? new Date(detailTopup.expires_at).toLocaleString() : "-"}</p>
									</div>
								</div>

								<div className="space-y-3">
									<div>
										<Label className="text-sm font-semibold">{t("topup.timeRemaining") || "Time Remaining"}</Label>
										<p>
											{detailTopup.is_expired ? (
												<Badge variant="destructive">{t("topup.expired") || "Expired"}</Badge>
											) : (
												formatTimeRemaining(detailTopup.time_remaining)
											)}
										</p>
									</div>

									<div>
										<Label className="text-sm font-semibold">{t("topup.transactionDate") || "Transaction Date"}</Label>
										<p>{detailTopup.transaction_date ? new Date(detailTopup.transaction_date).toLocaleDateString() : "-"}</p>
									</div>

									<div>
										<Label className="text-sm font-semibold">{t("topup.canSubmitProof") || "Can Submit Proof"}</Label>
										<p>{detailTopup.can_submit_proof ? t("common.yes") || "Yes" : t("common.no") || "No"}</p>
									</div>

									<div>
										<Label className="text-sm font-semibold">{t("topup.reviewedAt") || "Reviewed At"}</Label>
										<p>{detailTopup.reviewed_at ? new Date(detailTopup.reviewed_at).toLocaleString() : "-"}</p>
									</div>

									<div>
										<Label className="text-sm font-semibold">{t("topup.processedAt") || "Processed At"}</Label>
										<p>{detailTopup.processed_at ? new Date(detailTopup.processed_at).toLocaleString() : "-"}</p>
									</div>
								</div>
							</div>

							{detailTopup.proof_description && (
								<div>
									<Label className="text-sm font-semibold">{t("topup.proofDescription") || "Proof Description"}</Label>
									<p className="text-sm text-muted-foreground mt-1">{detailTopup.proof_description}</p>
								</div>
							)}

							{detailTopup.rejection_reason && (
								<div>
									<Label className="text-sm font-semibold">{t("topup.rejectionReason") || "Rejection Reason"}</Label>
									<p className="text-sm text-destructive mt-1">{detailTopup.rejection_reason}</p>
								</div>
							)}

							{detailTopup.admin_notes && (
								<div>
									<Label className="text-sm font-semibold">{t("topup.adminNotes") || "Admin Notes"}</Label>
									<p className="text-sm text-muted-foreground mt-1">{detailTopup.admin_notes}</p>
								</div>
							)}
						</div>
					) : null}
					<DialogClose asChild>
						<Button className="mt-4 w-full">{t("common.close") || "Close"}</Button>
					</DialogClose>
				</DialogContent>
			</Dialog>

			{/* Payment Link/USSD Modal */}
			<Dialog open={paymentLinkModalOpen} onOpenChange={(open) => {
				if (!open) {
					setPaymentLinkModalOpen(false)
					setPaymentLink(null)
					setPaymentUssd(null)
				}
			}}>
				<DialogContent className="sm:max-w-[400px]">
					<DialogHeader>
						<DialogTitle className="text-center">
							{paymentLink ? "Continuer la Transaction" : "Code USSD"}
						</DialogTitle>
					</DialogHeader>
					<div className="text-center space-y-4">
						{paymentLink ? (
							<>
								<p className="text-muted-foreground">
									Cliquez sur le bouton ci-dessous pour continuer votre transaction de recharge.
								</p>
								<Button
									onClick={() => {
										if (paymentLink) {
											window.open(paymentLink, '_blank')
											setPaymentLinkModalOpen(false)
											setPaymentLink(null)
											setPaymentUssd(null)
										}
									}}
									className="w-full"
									size="lg"
								>
									Continuer la Transaction
								</Button>
							</>
						) : paymentUssd ? (
							<>
								<p className="text-muted-foreground mb-4">
									Copiez et collez ce code dans votre application de téléphone pour continuer la transaction.
								</p>
								<div className="bg-muted p-4 rounded-lg">
									<code className="text-lg font-mono font-bold text-primary">
										{paymentUssd}
									</code>
								</div>
								<div className="flex gap-2 mt-4">
									<Button
										onClick={() => {
											if (paymentUssd) {
												navigator.clipboard.writeText(paymentUssd)
												toast({
													title: "Copié!",
													description: "Le code USSD a été copié dans le presse-papiers",
													variant: "default",
													className: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900 dark:text-green-200"
												})
											}
										}}
										className="flex-1"
										variant="outline"
									>
										Copier
									</Button>
									<Button
										onClick={() => {
											if (paymentUssd) {
												try {
													window.location.href = `tel:${paymentUssd}`
												} catch (error) {
													toast({
														title: "Erreur",
														description: "Impossible d'ouvrir l'application téléphone",
														variant: "destructive"
													})
												}
											}
										}}
										className="flex-1"
									>
										Appeler
									</Button>
								</div>
							</>
						) : null}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}