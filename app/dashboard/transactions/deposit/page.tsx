"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApi } from "@/lib/useApi"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useLanguage } from "@/components/providers/language-provider"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function DepositPage() {
  const [networks, setNetworks] = useState<any[]>([])
  const [network, setNetwork] = useState("")
  const [amount, setAmount] = useState("5500")
  const [confirmAmount, setConfirmAmount] = useState("5500")
  const [recipientPhone, setRecipientPhone] = useState("0167890123")
  const [confirmRecipientPhone, setConfirmRecipientPhone] = useState("0167890123")
  const [objet, setObjet] = useState("test")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [confirmDetails, setConfirmDetails] = useState(false)
  const apiFetch = useApi()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const data = await apiFetch(`${baseUrl}api/payments/networks/`)
        setNetworks(data.results || [])
      } catch (err) {
        setError(t("transactions.failedToLoadNetworks") || "Failed to load networks")
      }
    }
    fetchNetworks()
  }, [apiFetch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Client-side validations
    if (amount.trim() !== confirmAmount.trim()) {
      setError(t("transactions.amountMismatch") || "Amount and Confirm Amount do not match")
      return
    }
    if (recipientPhone.trim() !== confirmRecipientPhone.trim()) {
      setError(t("transactions.phoneMismatch") || "Phone number and Confirm Phone number do not match")
      return
    }
    if (!confirmDetails) {
      setError(t("transactions.confirmDetailsRequired") || "Please confirm the phone number and amount")
      return
    }
    setLoading(true)
    setError("")
    try {
      await apiFetch(`${baseUrl}api/payments/transactions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "deposit",
          amount,
          recipient_phone: recipientPhone,
          recipient_name: null,
          objet,
          network,
        }),
      })
      toast({
        title: t("transactions.depositCreatedTitle") || "Deposit created",
        description: t("transactions.transactionCreatedDesc") || "Transaction created successfully",
      })
      router.push("/dashboard/transactions")
    } catch (err: any) {
      setError(extractErrorMessages(err) || t("transactions.failedToCreateDeposit") || "Failed to create deposit")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>{t("transactions.depositTitle") || "Deposit"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select value={network} onValueChange={setNetwork}>
              <SelectTrigger>
                <SelectValue placeholder={t("transactions.selectNetwork") || "Select Network"} />
              </SelectTrigger>
              <SelectContent>
                {networks.map((n) => (
                  <SelectItem key={n.uid} value={n.uid}>{n.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder={t("transactions.amount") || "Amount"}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              type="number"
              required
            />
            <Input
              placeholder={t("transactions.confirmAmount") || "Confirm Amount"}
              value={confirmAmount}
              onChange={e => setConfirmAmount(e.target.value)}
              type="number"
              required
            />
            <Input
              placeholder={t("transactions.recipientPhone") || "Recipient Phone"}
              value={recipientPhone}
              onChange={e => setRecipientPhone(e.target.value)}
              required
            />
            <Input
              placeholder={t("transactions.confirmRecipientPhone") || "Confirm Recipient Phone"}
              value={confirmRecipientPhone}
              onChange={e => setConfirmRecipientPhone(e.target.value)}
              required
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={confirmDetails}
                onChange={e => setConfirmDetails(e.target.checked)}
              />
              {t("transactions.confirmationLabel") || "I confirm the phone number and amount are correct"}
            </label>
            <Input
              placeholder={t("transactions.purpose") || "Objet"}
              value={objet}
              onChange={e => setObjet(e.target.value)}
              required
            />
            {error && <ErrorDisplay error={error} variant="inline" />}
            <Button
              type="submit"
              disabled={
                loading ||
                !network ||
                !confirmDetails ||
                amount.trim() !== confirmAmount.trim() ||
                recipientPhone.trim() !== confirmRecipientPhone.trim()
              }
            >
              {loading
                ? t("common.submitting") || "Submitting..."
                : t("transactions.createDeposit") || "Create Deposit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}