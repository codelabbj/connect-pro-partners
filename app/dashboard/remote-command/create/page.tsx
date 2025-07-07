"use client"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { useToast } from "@/hooks/use-toast"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function RemoteCommandCreatePage() {
  const [command, setCommand] = useState("")
  const [deviceId, setDeviceId] = useState("")
  const [parameters, setParameters] = useState("{}")
  const [priority, setPriority] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    let paramsObj = {}
    try {
      paramsObj = JSON.parse(parameters)
    } catch {
      setError(t("remoteCommand.parametersMustBeValidJson"))
      toast({
        title: t("remoteCommand.failed"),
        description: t("remoteCommand.parametersMustBeValidJson"),
        variant: "destructive",
      })
      setLoading(false)
      return
    }
    try {
      const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/remote-command/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, device_id: deviceId, parameters: paramsObj, priority })
      })
      setSuccess(data.status || t("remoteCommand.commandSentSuccessfully"))
      toast({
        title: t("remoteCommand.success"),
        description: data.status || t("remoteCommand.commandSentSuccessfully"),
      })
    } catch (err: any) {
      const backendError = err.message || t("remoteCommand.failedToCreate")
      setError(backendError)
      toast({
        title: t("remoteCommand.failed"),
        description: backendError,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-lg font-semibold">{t("remoteCommand.sending")}</span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("remoteCommand.create")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>{t("remoteCommand.command")}</label>
            <Input value={command} onChange={e => setCommand(e.target.value)} required />
          </div>
          <div>
            <label>{t("remoteCommand.deviceId")}</label>
            <Input value={deviceId} onChange={e => setDeviceId(e.target.value)} required />
          </div>
          <div>
            <label>{t("remoteCommand.parameters")}</label>
            <Input value={parameters} onChange={e => setParameters(e.target.value)} required />
          </div>
          <div>
            <label>{t("remoteCommand.priority")}</label>
            <Input type="number" value={priority} onChange={e => setPriority(Number(e.target.value))} required />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
          <Button type="submit" disabled={loading}>{loading ? t("remoteCommand.sending") : t("remoteCommand.sendCommand")}</Button>
        </form>
      </CardContent>
    </Card>
  )
} 