"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Copy } from "lucide-react"
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function EditTransactionPage() {
  const { uid } = useParams()
  const { t } = useLanguage()
  const apiFetch = useApi()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [transaction, setTransaction] = useState<any>(null)
  const [form, setForm] = useState({
    status: "",
    external_transaction_id: "",
    balance_before: "",
    balance_after: "",
    fees: "",
    confirmation_message: "",
    raw_sms: "",
    error_message: "",
    objet: "",
  })

  useEffect(() => {
    const fetchTransaction = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(`${baseUrl}api/payments/transactions/${uid}/`)
        setTransaction(data)
        setForm({
          status: data.status || "",
          external_transaction_id: data.external_transaction_id || "",
          balance_before: data.balance_before || "",
          balance_after: data.balance_after || "",
          fees: data.fees || "",
          confirmation_message: data.confirmation_message || "",
          raw_sms: data.raw_sms || "",
          error_message: data.error_message || "",
          objet: data.objet || "",
        })
      } catch (err: any) {
        setError(extractErrorMessages(err) || t("transactions.failedToLoad"))
      } finally {
        setLoading(false)
      }
    }
    fetchTransaction()
  }, [uid])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

   const [copied, setCopied] = useState(false)
  const handleCopyReference = () => {
    if (transaction?.reference) {
      navigator.clipboard.writeText(transaction.reference)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
        await apiFetch(`${baseUrl}api/payments/transactions/${uid}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      router.push("/dashboard/transactions")
    } catch (err: any) {
      setError(extractErrorMessages(err) || t("transactions.failedToUpdate"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center">{t("common.loading")}</div>
  if (error) return <ErrorDisplay error={error} />

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>{t("transactions.editTransaction")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Read-only info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <strong>{t("transactions.reference")}:</strong> {transaction.reference}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-1"
                onClick={handleCopyReference}
                title={copied ? t("smsLogs.copied") : t("smsLogs.copy")}
              >
                <Copy className="w-4 h-4" />
              </Button>
              {copied && <span className="text-xs text-green-600">{t("smsLogs.copied")}</span>}
            </div>
            <div><strong>{t("transactions.type")}:</strong> <Badge>{t(`transactions.${transaction.type}`)}</Badge></div>
            <div><strong>{t("transactions.amount")}:</strong> {transaction.amount}</div>
            <div><strong>{t("transactions.recipientName")}:</strong> {transaction.display_recipient_name || transaction.recipient_name}</div>
            <div><strong>{t("transactions.recipientPhone")}:</strong> {transaction.recipient_phone}</div>
            <div><strong>{t("transactions.network")}: </strong>{transaction.network_name}</div>
            <div><strong>{t("transactions.status")}:</strong> <Badge>{t(`transactions.${transaction.status}`)}</Badge></div>
            <div><strong>{t("transactions.createdAt")}:</strong> {transaction.created_at ? new Date(transaction.created_at).toLocaleString() : "-"}</div>
            <div><strong>{t("transactions.completedAt")}:</strong> {transaction.completed_at ? new Date(transaction.completed_at).toLocaleString() : "-"}</div>
            <div><strong>Processed By:</strong> {transaction.processed_by_name}</div>
          </div>
          {/* USSD Path */}
          {transaction.ussd_path && Array.isArray(transaction.ussd_path) && (
            <div className="mb-4">
              <strong>USSD Path:</strong>
              <pre className="bg-muted p-2 rounded text-xs whitespace-pre-wrap">{transaction.ussd_path.join("\n")}</pre>
            </div>
          )}
          {/* Editable fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">{t("transactions.status")}</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded p-2">
                <option value="pending">{t("transactions.pending")}</option>
                <option value="completed">{t("transactions.completed")}</option>
                <option value="success">{t("transactions.success")}</option>
                <option value="failed">{t("transactions.failed")}</option>
                <option value="cancelled">{t("transactions.cancelled")}</option>
                <option value="timeout">{t("transactions.timeout")}</option>
                <option value="sent_to_user">{t("transactions.sentToUser")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">{t("transactions.externalTransactionId")}</label>
              <Input name="external_transaction_id" value={form.external_transaction_id} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium">{t("transactions.balanceBefore")}</label>
              <Input name="balance_before" value={form.balance_before} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium">{t("transactions.balanceAfter")}</label>
              <Input name="balance_after" value={form.balance_after} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium">{t("transactions.fees")}</label>
              <Input name="fees" value={form.fees} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium">{t("transactions.confirmationMessage")}</label>
              <Input name="confirmation_message" value={form.confirmation_message} onChange={handleChange} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">{t("transactions.rawSms")}</label>
              <textarea name="raw_sms" value={form.raw_sms} onChange={handleChange} className="w-full border rounded p-2" rows={2} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">{t("transactions.errorMessage")}</label>
              <textarea name="error_message" value={form.error_message} onChange={handleChange} className="w-full border rounded p-2" rows={2} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium">Objet</label>
              <Input name="objet" value={form.objet} onChange={handleChange} />
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button type="submit" disabled={saving}>{saving ? t("transactions.saving") : t("transactions.saveChanges")}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>{t("common.cancel")}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}