"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { useToast } from "@/hooks/use-toast"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function NetworkConfigCreatePage() {
  const router = useRouter()
  
  const [networks, setNetworks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Form state
  const [network, setNetwork] = useState("")
  const [isActive, setIsActive] = useState(true)
  
  // USSD Commands
  const [ussdBalance, setUssdBalance] = useState("*880#\n1\n{pin}")
  const [ussdDeposit, setUssdDeposit] = useState("*880#\n2\n1\n{phone}\n{phone}\n{amount}\n{pin}")
  const [ussdWithdrawal, setUssdWithdrawal] = useState("*880#\n3\n1\n{phone}\n{phone}\n{amount}\n{object}\n{pin}")
  
  // SMS Keywords
  const [smsBalanceKeywords, setSmsBalanceKeywords] = useState("solde actuel, votre solde")
  const [smsDepositKeywords, setSmsDepositKeywords] = useState("depot effectue, retrait effectue")
  const [smsWithdrawalKeywords, setSmsWithdrawalKeywords] = useState("vous avez envoye, transfert effectue")
  
  // Error Keywords
  const [errorKeywords, setErrorKeywords] = useState("solde insuffisant, code incorrect, service indisponible")
  
  // Custom Settings
  const [timeoutSeconds, setTimeoutSeconds] = useState(30)
  const [maxRetries, setMaxRetries] = useState(3)
  const [autoConfirm, setAutoConfirm] = useState(false)
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/networks/`)
        setNetworks(Array.isArray(data) ? data : data.results || [])
        toast({
          title: t("networkConfig.networksLoaded"),
          description: t("networkConfig.networksLoadedSuccessfully"),
        })
      } catch (err: any) {
        setError(t("networkConfig.failedToLoadNetworks"))
        setNetworks([])
        toast({
          title: t("networkConfig.networksFailedToLoad"),
          description: err.message || t("networkConfig.failedToLoadNetworks"),
          variant: "destructive",
        })
      }
    }
    
    fetchNetworks()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      const payload = {
        network,
        ussd_commands: {
          balance: ussdBalance,
          deposit: ussdDeposit,
          withdrawal: ussdWithdrawal
        },
        sms_keywords: {
          balance: smsBalanceKeywords.split(',').map(k => k.trim()),
          deposit: smsDepositKeywords.split(',').map(k => k.trim()),
          withdrawal: smsWithdrawalKeywords.split(',').map(k => k.trim())
        },
        error_keywords: errorKeywords.split(',').map(k => k.trim()),
        is_active: isActive,
        custom_settings: {
          timeout_seconds: timeoutSeconds,
          max_retries: maxRetries,
          auto_confirm: autoConfirm
        }
      }
      
      await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/network-configs/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      
      toast({
        title: t("networkConfig.success"),
        description: t("networkConfig.createdSuccessfully"),
      })
      router.push("/dashboard/network-config/list")
    } catch (err: any) {
      setError(err.message || t("networkConfig.failedToCreate"))
      toast({
        title: t("networkConfig.failedToCreate"),
        description: err.message || t("networkConfig.failedToCreate"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-lg font-semibold">{t("networkConfig.loading")}</span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("networkConfig.create")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Network Selection */}
          <div className="space-y-2">
            <Label htmlFor="network">{t("networkConfig.network")}</Label>
            <select
              id="network"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">{t("networkConfig.selectNetwork")}</option>
              {networks.map((net: any) => (
                <option key={net.uid} value={net.uid}>
                  {net.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="is-active">{t("networkConfig.active")}</Label>
          </div>

          {/* USSD Commands */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("networkConfig.ussdCommands")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ussd-balance">{t("networkConfig.balanceCommand")}</Label>
                <Textarea
                  id="ussd-balance"
                  value={ussdBalance}
                  onChange={(e) => setUssdBalance(e.target.value)}
                  placeholder="*880#\n1\n{pin}"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ussd-deposit">{t("networkConfig.depositCommand")}</Label>
                <Textarea
                  id="ussd-deposit"
                  value={ussdDeposit}
                  onChange={(e) => setUssdDeposit(e.target.value)}
                  placeholder="*880#\n2\n1\n{phone}\n{phone}\n{amount}\n{pin}"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ussd-withdrawal">{t("networkConfig.withdrawalCommand")}</Label>
                <Textarea
                  id="ussd-withdrawal"
                  value={ussdWithdrawal}
                  onChange={(e) => setUssdWithdrawal(e.target.value)}
                  placeholder="*880#\n3\n1\n{phone}\n{phone}\n{amount}\n{object}\n{pin}"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* SMS Keywords */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("networkConfig.smsKeywords")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sms-balance">{t("networkConfig.balanceKeywords")}</Label>
                <Input
                  id="sms-balance"
                  value={smsBalanceKeywords}
                  onChange={(e) => setSmsBalanceKeywords(e.target.value)}
                  placeholder="solde actuel, votre solde"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sms-deposit">{t("networkConfig.depositKeywords")}</Label>
                <Input
                  id="sms-deposit"
                  value={smsDepositKeywords}
                  onChange={(e) => setSmsDepositKeywords(e.target.value)}
                  placeholder="depot effectue, retrait effectue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sms-withdrawal">{t("networkConfig.withdrawalKeywords")}</Label>
                <Input
                  id="sms-withdrawal"
                  value={smsWithdrawalKeywords}
                  onChange={(e) => setSmsWithdrawalKeywords(e.target.value)}
                  placeholder="vous avez envoye, transfert effectue"
                />
              </div>
            </div>
          </div>

          {/* Error Keywords */}
          <div className="space-y-2">
            <Label htmlFor="error-keywords">{t("networkConfig.errorKeywordsInput")}</Label>
            <Input
              id="error-keywords"
              value={errorKeywords}
              onChange={(e) => setErrorKeywords(e.target.value)}
              placeholder="solde insuffisant, code incorrect, service indisponible"
            />
          </div>

          {/* Custom Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("networkConfig.customSettings")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeout">{t("networkConfig.timeout")}</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={timeoutSeconds}
                  onChange={(e) => setTimeoutSeconds(parseInt(e.target.value))}
                  min="1"
                  max="300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-retries">{t("networkConfig.maxRetries")}</Label>
                <Input
                  id="max-retries"
                  type="number"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(parseInt(e.target.value))}
                  min="0"
                  max="10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-confirm"
                  checked={autoConfirm}
                  onCheckedChange={setAutoConfirm}
                />
                <Label htmlFor="auto-confirm">{t("networkConfig.autoConfirm")}</Label>
              </div>
            </div>
          </div>

          {error && <div className="text-red-500">{error}</div>}
          
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? t("networkConfig.creating") : t("networkConfig.create")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/network-config/list")}
            >
              {t("networkConfig.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 