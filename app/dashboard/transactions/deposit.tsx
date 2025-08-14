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

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function DepositPage() {
  const [networks, setNetworks] = useState<any[]>([])
  const [network, setNetwork] = useState("")
  const [amount, setAmount] = useState("5500")
  const [recipientPhone, setRecipientPhone] = useState("0167890123")
  const [objet, setObjet] = useState("test")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const apiFetch = useApi()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const data = await apiFetch(`${baseUrl}api/payments/networks/`)
        setNetworks(data.results || [])
      } catch (err) {
        setError("Failed to load networks")
      }
    }
    fetchNetworks()
  }, [apiFetch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      toast({ title: "Deposit created", description: "Transaction created successfully" })
      router.push("/dashboard/transactions")
    } catch (err: any) {
      setError(extractErrorMessages(err) || "Failed to create deposit")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Deposit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select value={network} onValueChange={setNetwork}>
              <SelectTrigger>
                <SelectValue placeholder="Select Network" />
              </SelectTrigger>
              <SelectContent>
                {networks.map((n) => (
                  <SelectItem key={n.uid} value={n.uid}>{n.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              type="number"
              required
            />
            <Input
              placeholder="Recipient Phone"
              value={recipientPhone}
              onChange={e => setRecipientPhone(e.target.value)}
              required
            />
            <Input
              placeholder="Objet"
              value={objet}
              onChange={e => setObjet(e.target.value)}
              required
            />
            {error && <ErrorDisplay error={error} variant="inline" />}
            <Button type="submit" disabled={loading || !network}>
              {loading ? "Submitting..." : "Create Deposit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}