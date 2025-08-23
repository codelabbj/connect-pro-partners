"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Check, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function CreateTransactionPage() {
  const [networks, setNetworks] = useState<any[]>([])
  const [networksLoading, setNetworksLoading] = useState(true)
  const [networksError, setNetworksError] = useState("")
  
  const [transactionForm, setTransactionForm] = useState({
    type: "" as "deposit" | "withdrawal" | "",
    amount: "",
    recipient_phone: "",
    network: "" as any,
  })
  
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const { t } = useLanguage()
  const apiFetch = useApi()
  const { toast } = useToast()
  const router = useRouter()

  // Fetch networks on component mount
  useEffect(() => {
    const fetchNetworks = async () => {
      setNetworksLoading(true)
      setNetworksError("")
      try {
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/networks/`
        const data = await apiFetch(endpoint)
        // Filter only active networks
        const activeNetworks = (data.results || []).filter((network: any) => network.is_active)
        setNetworks(activeNetworks)
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err)
        setNetworksError(errorMessage)
        toast({ title: t("payment.failedToLoadNetworks"), description: errorMessage, variant: "destructive" })
      } finally {
        setNetworksLoading(false)
      }
    }
    fetchNetworks()
  }, [baseUrl, apiFetch, t, toast])

  const handleTransactionTypeSelect = (type: "deposit" | "withdrawal") => {
    setTransactionForm(prev => ({ ...prev, type }))
  }

  const handleNetworkSelect = (network: any) => {
    setTransactionForm(prev => ({ ...prev, network }))
  }

  const handleCreateClick = () => {
    setConfirmModalOpen(true)
  }

  const handleConfirmTransaction = async () => {
    setSubmitting(true)
    setSubmitError("")
    try {
      const payload = {
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount),
        recipient_phone: transactionForm.recipient_phone,
        network: transactionForm.network.uid,
        objet: null
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
      
      // Redirect back to transactions page
      router.push("/dashboard/transactions") // Adjust the path as needed
      
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setSubmitError(errorMessage)
      toast({ title: t("payment.createFailed"), description: errorMessage, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const isFormValid = transactionForm.type && transactionForm.network && transactionForm.amount && transactionForm.recipient_phone

  return (
    <div className="ml-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back") || "Back"}
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t("payment.newTransaction") || "Create New Transaction"}</h1>
          <p className="text-muted-foreground">{t("payment.createTransactionSubtitle") || "Choose transaction type and fill in the details"}</p>
        </div>
      </div>

      {/* Transaction Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t("payment.selectTransactionType") || "Select Transaction Type"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                transactionForm.type === "deposit" 
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                  : "border-gray-200 hover:border-green-300"
              }`}
              onClick={() => handleTransactionTypeSelect("deposit")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t("payment.deposit") || "Deposit"}</h3>
                    <p className="text-sm text-muted-foreground">{t("payment.depositDescription") || "Add money to your account"}</p>
                  </div>
                </div>
                {transactionForm.type === "deposit" && (
                  <Check className="h-6 w-6 text-green-600" />
                )}
              </div>
            </div>

            <div 
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                transactionForm.type === "withdrawal" 
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20" 
                  : "border-gray-200 hover:border-red-300"
              }`}
              onClick={() => handleTransactionTypeSelect("withdrawal")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t("payment.withdrawal") || "Withdraw"}</h3>
                    <p className="text-sm text-muted-foreground">{t("payment.withdrawDescription") || "Send money from your account"}</p>
                  </div>
                </div>
                {transactionForm.type === "withdrawal" && (
                  <Check className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Selection */}
      {transactionForm.type && (
        <Card>
          <CardHeader>
            <CardTitle>{t("payment.selectNetwork") || "Select Network"}</CardTitle>
          </CardHeader>
          <CardContent>
            {networksLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                {t("common.loading") || "Loading networks..."}
              </div>
            ) : networksError ? (
              <ErrorDisplay
                error={networksError}
                onRetry={() => window.location.reload()}
                variant="full"
                showDismiss={false}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {networks.map((network) => (
                  <div
                    key={network.uid}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      transactionForm.network?.uid === network.uid
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => handleNetworkSelect(network)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{network.nom}</h3>
                        <p className="text-sm text-muted-foreground">{network.country_name}</p>
                        {network.description && (
                          <p className="text-xs text-muted-foreground mt-1">{network.description}</p>
                        )}
                      </div>
                      {transactionForm.network?.uid === network.uid && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transaction Details */}
      {transactionForm.type && transactionForm.network && (
        <Card>
          <CardHeader>
            <CardTitle>{t("payment.transactionDetails") || "Transaction Details"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="recipient_phone">{t("payment.recipientPhone") || "Recipient Phone"} *</Label>
              <Input
                id="recipient_phone"
                type="tel"
                placeholder="Entrez le numéro de téléphone du destinataire"
                value={transactionForm.recipient_phone}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, recipient_phone: e.target.value }))}
                required
                className="mt-1 border-gray-400 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-400/50"
              />
            </div>

            <div>
              <Label htmlFor="amount">{t("payment.amount") || "Amount"} (FCFA) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Entrez le montant"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                required
                min="1"
                className="mt-1 border-gray-400 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-400/50 "
              />
            </div>

            {/* Transaction Summary */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold mb-3">{t("payment.transactionSummary") || "Transaction Summary"}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t("payment.type") || "Type"}:</span>
                  <Badge variant={transactionForm.type === "deposit" ? "default" : "destructive"}>
                    {t(`payment.${transactionForm.type}`) || transactionForm.type}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>{t("payment.network") || "Network"}:</span>
                  <span>{transactionForm.network?.nom} ({transactionForm.network?.country_name})</span>
                </div>
                {transactionForm.recipient_phone && (
                  <div className="flex justify-between">
                    <span>{t("payment.recipientPhone") || "Recipient"}:</span>
                    <span>{transactionForm.recipient_phone}</span>
                  </div>
                )}
                {transactionForm.amount && (
                  <div className="flex justify-between font-semibold">
                    <span>{t("payment.amount") || "Amount"}:</span>
                    <span>{parseFloat(transactionForm.amount).toLocaleString()} FCFA</span>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={handleCreateClick}
              disabled={!isFormValid}
              className="w-full mt-6"
              size="lg"
            >
              {t("payment.createTransaction") || "Create Transaction"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Modal */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("payment.confirmTransaction") || "Confirm Transaction"}</DialogTitle>
            <DialogDescription>
              {t("payment.confirmTransactionDescription") || "Please review the transaction details before confirming."}
            </DialogDescription>
          </DialogHeader>

          {submitError && (
            <ErrorDisplay
              error={submitError}
              variant="inline"
              showRetry={false}
              className="mb-4"
            />
          )}

          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">{t("payment.type") || "Type"}:</span>
                  <Badge variant={transactionForm.type === "deposit" ? "default" : "destructive"}>
                    {t(`payment.${transactionForm.type}`) || transactionForm.type}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{t("payment.network") || "Network"}:</span>
                  <span>{transactionForm.network?.nom} ({transactionForm.network?.country_name})</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{t("payment.recipientPhone") || "Recipient"}:</span>
                  <span>{transactionForm.recipient_phone}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">{t("payment.amount") || "Amount"}:</span>
                  <span className="font-bold">{parseFloat(transactionForm.amount).toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {t("payment.confirmationWarning") || "Please verify all details are correct before confirming. This action cannot be undone."}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setConfirmModalOpen(false)}
              disabled={submitting}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button 
              onClick={handleConfirmTransaction}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t("common.processing") || "Processing..."}
                </>
              ) : (
                t("payment.confirmAndCreate") || "Confirm & Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}