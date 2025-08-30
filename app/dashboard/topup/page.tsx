
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
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Copy, Plus, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useApi } from "@/lib/useApi"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function UserTopupPage() {
	const [searchTerm, setSearchTerm] = useState("")
	const [statusFilter, setStatusFilter] = useState("all")
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

	// Fetch topups from API
	useEffect(() => {
		const fetchTopups = async () => {
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
				if (statusFilter !== "all") {
					params.append("status", statusFilter)
				}
				const orderingParam = sortField
					? `&ordering=${(sortDirection === "asc" ? "+" : "-")}${sortField}`
					: ""
				const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/user/recharges/?${params.toString()}${orderingParam}`
				const data = await apiFetch(endpoint)
				setTopups(data.results || [])
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
	}, [searchTerm, currentPage, itemsPerPage, baseUrl, statusFilter, sortField, sortDirection, t, toast, apiFetch])

	const startIndex = (currentPage - 1) * itemsPerPage

	const handleSort = (field: "amount" | "created_at" | "status") => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc")
		} else {
			setSortField(field)
			setSortDirection("desc")
		}
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
			setDetailTopup(found)
			toast({ title: t("topup.detailLoaded"), description: t("topup.detailLoadedSuccessfully") })
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
			
			toast({ title: t("topup.success"), description: t("topup.createdSuccessfully") })
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
				return "default"
			case "rejected":
				return "destructive"
			case "expired":
				return "secondary"
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

	return (
		<div className="container mx-auto p-6">
			<Card>
				<CardHeader>
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
						<CardTitle className="text-lg sm:text-xl">{t("topup.title") || "My Top Up Requests"}</CardTitle>
						<Button 
							onClick={() => setCreateModalOpen(true)}
							size="sm"
							className="w-full sm:w-auto"
						>
							<Plus className="h-4 w-4 mr-2" />
							{t("topup.createNew") || "Create New Request"}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{/* Search & Filter */}
					<div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
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
							<option value="approved">{t("topup.approved") || "Approved"}</option>
							<option value="rejected">{t("topup.rejected") || "Rejected"}</option>
							<option value="expired">{t("topup.expired") || "Expired"}</option>
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
										<TableHead>{t("topup.reference") || "Reference"}</TableHead>
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
										<TableHead>{t("topup.expiresAt") || "Expires At"}</TableHead>
										<TableHead>{t("topup.timeRemaining") || "Time Remaining"}</TableHead>
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
												<TableCell className="font-mono text-sm">{topup.reference}</TableCell>
												<TableCell className="font-semibold">{topup.formatted_amount}</TableCell>
												<TableCell>
													<Badge variant={getStatusBadgeVariant(topup.status)}>
														{topup.status_display || topup.status}
													</Badge>
												</TableCell>
												<TableCell>{topup.created_at ? new Date(topup.created_at).toLocaleDateString() : "-"}</TableCell>
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
												<TableCell>
													<Button 
														size="sm" 
														variant="outline" 
														onClick={() => handleOpenDetail(topup.uid)}
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
					setFormData({
						amount: "",
						proof_image: null,
						proof_description: "",
						transaction_date: ""
					})
				}
			}}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>{t("topup.createNew") || "Create New Top-Up Request"}</DialogTitle>
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
											<span className="font-mono text-sm">{detailTopup.reference}</span>
											<Button
												variant="ghost"
												size="icon"
												className="h-5 w-5"
												onClick={() => {
													navigator.clipboard.writeText(detailTopup.reference)
													toast({ title: t("topup.copiedReference") || "Reference copied!" })
												}}
											>
												<Copy className="h-3 w-3" />
											</Button>
										</div>
									</div>
									
									<div>
										<Label className="text-sm font-semibold">{t("topup.amount") || "Amount"}</Label>
										<p className="text-lg font-semibold">{detailTopup.formatted_amount}</p>
									</div>
									
									<div>
										<Label className="text-sm font-semibold">{t("topup.status") || "Status"}</Label>
										<div>
											<Badge variant={getStatusBadgeVariant(detailTopup.status)}>
												{detailTopup.status_display || detailTopup.status}
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
		</div>
	)
}