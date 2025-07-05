"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function NetworkEditPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const [nom, setNom] = useState("")
  const [code, setCode] = useState("")
  const [country, setCountry] = useState("")
  const [ussdBaseCode, setUssdBaseCode] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [countries, setCountries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const apiFetch = useApi()
  const { t } = useLanguage()

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/countries/`)
        setCountries(Array.isArray(data) ? data : data.results || [])
      } catch (err: any) {
        setCountries([])
      }
    }
    
    fetchCountries()
  }, [])

  useEffect(() => {
    if (!id) return
    
    const fetchNetwork = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/networks/${id}/`)
        setNom(data.nom || "")
        setCode(data.code || "")
        setCountry(data.country || "")
        setUssdBaseCode(data.ussd_base_code || "")
        setIsActive(data.is_active)
      } catch (err: any) {
        setError(err.message || t("network.failedToLoad"))
      } finally {
        setLoading(false)
      }
    }
    
    fetchNetwork()
  }, [id])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/networks/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, code, country, ussd_base_code: ussdBaseCode, is_active: isActive })
      })
      router.push("/dashboard/network/list")
    } catch (err: any) {
      setError(err.message || t("network.failedToUpdate"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("network.edit")}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <div>{t("network.loading")}</div> : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label>{t("network.name")}</label>
              <Input value={nom} onChange={e => setNom(e.target.value)} required />
            </div>
            <div>
              <label>{t("network.code")}</label>
              <Input value={code} onChange={e => setCode(e.target.value)} required />
            </div>
            <div>
              <label>{t("network.country")}</label>
              <select value={country} onChange={e => setCountry(e.target.value)} required>
                <option value="">{t("network.selectCountry")}</option>
                {countries.map((c: any) => (
                  <option key={c.uid} value={c.uid}>{c.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label>{t("network.ussdBaseCode")}</label>
              <Input value={ussdBaseCode} onChange={e => setUssdBaseCode(e.target.value)} required />
            </div>
            <div>
              <label>{t("network.status")}</label>
              <select value={isActive ? "active" : "inactive"} onChange={e => setIsActive(e.target.value === "active")}> 
                <option value="active">{t("network.active")}</option>
                <option value="inactive">{t("network.inactive")}</option>
              </select>
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <Button type="submit" disabled={loading}>{loading ? t("network.saving") : t("network.save")}</Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
} 