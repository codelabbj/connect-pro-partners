"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { Search, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { useApi } from "@/lib/useApi"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [users, setUsers] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { t } = useLanguage()
  const itemsPerPage = 10
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  // Set default viewType to 'all' (was 'pending')
  const [viewType, setViewType] = useState("all") // 'pending' or 'all'
  const { toast } = useToast()
  const [activatingUid, setActivatingUid] = useState<string | null>(null)
  const [deactivatingUid, setDeactivatingUid] = useState<string | null>(null)
  const [selectedUids, setSelectedUids] = useState<string[]>([])
  const allSelected = users.length > 0 && users.every((u) => selectedUids.includes(u.uid))
  const someSelected = users.some((u) => selectedUids.includes(u.uid))
  const apiFetch = useApi();
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailUser, setDetailUser] = useState<any | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState("")
  
  // Verification modal states
  const [verificationModalOpen, setVerificationModalOpen] = useState(false)
  const [verificationType, setVerificationType] = useState<"email" | "phone" | null>(null)
  const [verificationStep, setVerificationStep] = useState<"input" | "code" | null>(null)
  const [verificationIdentifier, setVerificationIdentifier] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [verificationError, setVerificationError] = useState("")

  // Helper to extract error messages from API responses
  function extractErrorMessages(errorObj: any): string {
    if (!errorObj || typeof errorObj !== "object") return String(errorObj)
    // Show the raw API response if it's an object
    if (typeof errorObj === "object" && Object.keys(errorObj).length > 0) {
      return JSON.stringify(errorObj, null, 2)
    }
    return String(errorObj)
  }

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setError("")
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: itemsPerPage.toString(),
          search: searchTerm,
          is_verified: "",
          ordering: "-created_at",
        })
        const endpoint =
          viewType === "pending"
            ? `${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/pending/?${params.toString()}`
            : `${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/?${params.toString()}`
        const data = await apiFetch(endpoint)
        setUsers(data.users || [])
        setTotalCount(data.pagination?.total_count || 0)
        setTotalPages(data.pagination?.total_pages || 1)
      } catch (err: any) {
        setError(extractErrorMessages(err));
        setUsers([])
        setTotalCount(0)
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [searchTerm, currentPage, itemsPerPage, baseUrl, viewType])

  const filteredUsers = users // Filtering is now handled by the API
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers // Already paginated by API

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      pending: "outline",
    } as const

    return <Badge variant={variants[status as keyof typeof variants]}>{t(`users.${status}`)}</Badge>
  }

  // Activate user handler
  const handleActivate = async (user: any) => {
    if (!user.uid) return
    setActivatingUid(user.uid)
    try {
      const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/${user.uid}/activate/`, {
        method: "POST",
      })
      toast({ title: "User Activated", description: data.message || "User activated successfully." })
      setUsers((prev) => prev.map((u) => (u.uid === user.uid ? { ...u, ...data.user } : u)))
    } catch (err: any) {
      toast({ title: "Activation failed", description: extractErrorMessages(err) || "Could not activate user.", variant: "destructive" })
    } finally {
      setActivatingUid(null)
    }
  }

  // Deactivate user handler
  const handleDeactivate = async (user: any) => {
    if (!user.uid) return
    setDeactivatingUid(user.uid)
    try {
      const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/${user.uid}/deactivate/`, {
        method: "PATCH",
      })
      toast({ title: "User Deactivated", description: data.message || "User deactivated successfully." })
      setUsers((prev) => prev.map((u) => (u.uid === user.uid ? { ...u, ...data.user } : u)))
    } catch (err: any) {
      toast({ title: "Deactivation failed", description: extractErrorMessages(err) || "Could not deactivate user.", variant: "destructive" })
    } finally {
      setDeactivatingUid(null)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUids(Array.from(new Set([...selectedUids, ...paginatedUsers.map((u) => u.uid)])))
    } else {
      setSelectedUids(selectedUids.filter((uid) => !paginatedUsers.map((u) => u.uid).includes(uid)))
    }
  }

  const handleSelectRow = (uid: string, checked: boolean) => {
    setSelectedUids((prev) => checked ? [...prev, uid] : prev.filter((id) => id !== uid))
  }

  // Bulk action handler
  const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedUids.length === 0) return
    try {
      const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/bulk-action/`, {
        method: "POST",
        body: JSON.stringify({ action, user_ids: selectedUids }),
      })
      toast({ title: "Bulk action success", description: data.message || "Bulk action completed." })
      setUsers((prev) => prev.map((u) => selectedUids.includes(u.uid) ? { ...u, ...data.user } : u))
      setSelectedUids([])
      setCurrentPage(1)
    } catch (err: any) {
      toast({ title: "Bulk action failed", description: extractErrorMessages(err) || "Could not perform bulk action.", variant: "destructive" })
    }
  }

  // Fetch user details
  const handleOpenDetail = async (uid: string) => {
    setDetailModalOpen(true)
    setDetailLoading(true)
    setDetailError("")
    setDetailUser(null)
    try {
      const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/${uid}/`)
      setDetailUser(data)
    } catch (err: any) {
      setDetailError(extractErrorMessages(err))
    } finally {
      setDetailLoading(false)
    }
  }

  const handleCloseDetail = () => {
    setDetailModalOpen(false)
    setDetailUser(null)
    setDetailError("")
  }

  // Verification handlers
  const handleVerifyEmail = () => {
    setVerificationType("email");
    setVerificationStep("input");
    setVerificationModalOpen(true);
    setVerificationIdentifier(detailUser?.email || "");
    setVerificationError("");
  };

  const handleVerifyPhone = () => {
    setVerificationType("phone");
    setVerificationStep("input");
    setVerificationModalOpen(true);
    setVerificationIdentifier(detailUser?.phone || "");
    setVerificationError("");
  };

  const handleSendVerificationCode = async () => {
    if (!verificationIdentifier) return;
    
    setVerificationLoading(true);
    setVerificationError("");
    
    try {
      const payload = { identifier: verificationIdentifier };
      await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/verify/resend/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      setVerificationStep("code");
      toast({ title: "Code Sent", description: `Verification code sent to ${verificationType === "email" ? "email" : "phone"}.` });
    } catch (err: any) {
      setVerificationError(extractErrorMessages(err));
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) return;
    
    setVerificationLoading(true);
    setVerificationError("");
    
    try {
      const endpoint = verificationType === "email" 
        ? `${baseUrl.replace(/\/$/, "")}/api/auth/verify/email/`
        : `${baseUrl.replace(/\/$/, "")}/api/auth/verify/phone/`;
      
      const payload = verificationType === "email"
        ? { email: verificationIdentifier, code: verificationCode }
        : { phone: verificationIdentifier, code: verificationCode };
      
      const response = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      // Update user verification status
      if (verificationType === "email" && response.email_verified) {
        setDetailUser((prev: any) => prev ? { ...prev, email_verified: true } : prev);
        toast({ title: "Email Verified", description: response.message || "Email verified successfully." });
      } else if (verificationType === "phone" && response.phone_verified) {
        setDetailUser((prev: any) => prev ? { ...prev, phone_verified: true } : prev);
        toast({ title: "Phone Verified", description: response.message || "Phone verified successfully." });
      }
      
      // Close verification modal
      setVerificationModalOpen(false);
      setVerificationStep(null);
      setVerificationType(null);
      setVerificationIdentifier("");
      setVerificationCode("");
    } catch (err: any) {
      setVerificationError(extractErrorMessages(err));
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleResendCode = async () => {
    await handleSendVerificationCode();
  };

  const handleCloseVerificationModal = () => {
    setVerificationModalOpen(false);
    setVerificationStep(null);
    setVerificationType(null);
    setVerificationIdentifier("");
    setVerificationCode("");
    setVerificationError("");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("users.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* View Switcher */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("users.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={viewType} onValueChange={setViewType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t("users.viewType")}/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{t("users.pendingUsers")}</SelectItem>
                <SelectItem value="all">{t("users.allUsers")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center justify-between">
            <div className="flex-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={selectedUids.length === 0}>
                  Bulk Actions <MoreHorizontal className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction("activate")}>Activate</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("deactivate")}>Deactivate</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("delete")}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>{t("users.name")}</TableHead>
                    <TableHead>{t("users.email")}</TableHead>
                    <TableHead>{t("users.phone")}</TableHead>
                    <TableHead>{t("users.status")}</TableHead>
                    <TableHead>{t("users.lastLogin")}</TableHead>
                    <TableHead>{t("users.createdAt")}</TableHead>
                    <TableHead>{t("users.details")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.uid || user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUids.includes(user.uid)}
                          onCheckedChange={(checked) => handleSelectRow(user.uid, !!checked)}
                          aria-label={`Select user ${user.display_name || user.email}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.display_name || `${user.first_name || ""} ${user.last_name || ""}`}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.is_active ? t("users.active") : t("users.inactive")}</TableCell>
                      <TableCell>{user.last_login_at ? user.last_login_at.split("T")[0] : "-"}</TableCell>
                      <TableCell>{user.created_at ? user.created_at.split("T")[0] : "-"}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="secondary" onClick={() => handleOpenDetail(user.uid)}>
                          {t("users.details")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              {t("users.showingResults", { start: startIndex + 1, end: Math.min(startIndex + itemsPerPage, totalCount), total: totalCount })}
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
                {t("users.pageOf", { current: currentPage, total: totalPages })}
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
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={detailModalOpen} onOpenChange={(open) => { if (!open) handleCloseDetail() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("users.details")}</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="p-4 text-center">{t("common.loading")}</div>
          ) : detailError ? (
            <div className="p-4 text-red-500">{detailError}</div>
          ) : detailUser ? (
            <div className="space-y-2">
                <div><b>{t("users.uid")}:</b> {detailUser.uid}</div>
                <div><b>{t("users.name")}:</b> {detailUser.display_name || `${detailUser.first_name || ""} ${detailUser.last_name || ""}`}</div>
                <div><b>{t("users.email")}:</b> {detailUser.email}</div>
                <div><b>{t("users.phone")}:</b> {detailUser.phone}</div>
                <div><b>{t("users.status")}:</b> {detailUser.is_active ? t("users.active") : t("users.inactive")}</div>
                <div><b>{t("users.emailVerified")}:</b> {detailUser.email_verified ? t("common.yes") : (
                  <Button size="sm" onClick={handleVerifyEmail} disabled={detailLoading} className="ml-2">{t("users.verifyEmail")}</Button>
                )}</div>
                <div><b>{t("users.phoneVerified")}:</b> {detailUser.phone_verified ? t("common.yes") : (
                  <Button size="sm" onClick={handleVerifyPhone} disabled={detailLoading} className="ml-2">{t("users.verifyPhone")}</Button>
                )}</div>
                <div><b>{t("users.contactMethod")}:</b> {detailUser.contact_method}</div>
                <div><b>{t("users.createdAt")}:</b> {detailUser.created_at ? detailUser.created_at.split("T")[0] : "-"}</div>
                <div><b>{t("users.lastLogin")}:</b> {detailUser.last_login_at ? detailUser.last_login_at.split("T")[0] : "-"}</div>
            </div>
          ) : null}
          <DialogClose asChild>
            <Button className="mt-4 w-full">{t("common.close")}</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {/* Verification Modal */}
      <Dialog open={verificationModalOpen} onOpenChange={(open) => { if (!open) handleCloseVerificationModal() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verificationType === "email" ? t("users.verifyEmail") : t("users.verifyPhone")}
            </DialogTitle>
            <DialogDescription>
              {verificationStep === "input" 
                ? t("users.enterIdentifierToSendCode", { type: verificationType === "email" ? t("users.email") : t("users.phone") })
                : t("users.enterCodeSentTo", { identifier: verificationIdentifier })
              }
            </DialogDescription>
          </DialogHeader>
          
          {verificationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-red-700">
                {verificationError.startsWith('{') ? (
                  <pre className="whitespace-pre-wrap bg-red-100 p-2 rounded border text-xs">
                    {verificationError}
                  </pre>
                ) : (
                  verificationError
                )}
              </div>
            </div>
          )}

          {verificationStep === "input" ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="identifier">
                  {verificationType === "email" ? t("users.email") : t("users.phone")}
                </Label>
                <Input
                  id="identifier"
                  type={verificationType === "email" ? "email" : "tel"}
                  value={verificationIdentifier}
                  onChange={(e) => setVerificationIdentifier(e.target.value)}
                  placeholder={verificationType === "email" ? t("users.enterEmail") : t("users.enterPhone")}
                  disabled={verificationLoading}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSendVerificationCode} 
                  disabled={verificationLoading || !verificationIdentifier}
                  className="flex-1"
                >
                  {verificationLoading ? t("users.sending") : t("users.sendCode")}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCloseVerificationModal}
                  disabled={verificationLoading}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">{t("users.verificationCode")}</Label>
                <Input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder={t("users.enterVerificationCode")}
                  disabled={verificationLoading}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleVerifyCode} 
                  disabled={verificationLoading || !verificationCode}
                  className="flex-1"
                >
                  {verificationLoading ? t("users.verifying") : t("users.verifyCode")}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleResendCode}
                  disabled={verificationLoading}
                >
                  {t("users.resendCode")}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCloseVerificationModal}
                  disabled={verificationLoading}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
