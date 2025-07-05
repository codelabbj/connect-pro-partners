"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function CountryCreatePage() {
  const [nom, setNom] = useState("")
  const [code, setCode] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const apiFetch = useApi()
  const { t } = useLanguage()

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/countries/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, code, is_active: isActive })
      })
      router.push("/dashboard/country/list")
    } catch (err: any) {
      setError(err.message || t("country.failedToCreate"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("country.create")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>{t("country.name")}</label>
            <Input value={nom} onChange={e => setNom(e.target.value)} required />
          </div>
          <div>
            <label>{t("country.code")}</label>
            <Input value={code} onChange={e => setCode(e.target.value)} required />
          </div>
          <div>
            <label>{t("country.status")}</label>
            <select value={isActive ? "active" : "inactive"} onChange={e => setIsActive(e.target.value === "active")}> 
              <option value="active">{t("country.active")}</option>
              <option value="inactive">{t("country.inactive")}</option>
            </select>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <Button type="submit" disabled={loading}>{loading ? t("country.creating") : t("country.create")}</Button>
        </form>
      </CardContent>
    </Card>
  )
} 