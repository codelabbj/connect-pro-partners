"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const { toast } = useToast();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/countries/`)
        setCountries(Array.isArray(data) ? data : data.results || [])
        toast({
          title: t("network.countriesLoaded"),
          description: t("network.countriesLoadedSuccessfully"),
        })
      } catch (err: any) {
        setCountries([])
        toast({
          title: t("network.countriesFailedToLoad"),
          description: err.message || t("network.failedToLoadCountries"),
          variant: "destructive",
        })
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
        toast({
          title: t("network.loaded"),
          description: t("network.loadedSuccessfully"),
        })
      } catch (err: any) {
        setError(err.message || t("network.failedToLoad"))
        toast({
          title: t("network.failedToLoad"),
          description: err.message || t("network.failedToLoad"),
          variant: "destructive",
        })
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
      toast({
        title: t("network.updated"),
        description: t("network.updatedSuccessfully"),
      })
      router.push("/dashboard/network/list")
    } catch (err: any) {
      setError(err.message || t("network.failedToUpdate"))
      toast({
        title: t("network.failedToUpdate"),
        description: err.message || t("network.failedToUpdate"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-lg font-semibold">{t("network.loading")}</span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("network.edit")}</CardTitle>
      </CardHeader>
      <CardContent>
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
              <Select
                value={country}
                onValueChange={setCountry}
                disabled={countries.length === 0}
              >
                <SelectTrigger className="w-full" aria-label={t("network.country")}> 
                  <SelectValue placeholder={t("network.selectCountry")} />
                </SelectTrigger>
                <SelectContent>
                  {countries.length === 0 ? (
                    <SelectItem value="no-countries" disabled>
                      {t("network.noCountries") || "No countries available"}
                    </SelectItem>
                  ) : (
                    countries.map((c: any) => (
                      <SelectItem key={c.uid} value={c.uid}>
                        {c.nom}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label>{t("network.ussdBaseCode")}</label>
              <Input value={ussdBaseCode} onChange={e => setUssdBaseCode(e.target.value)} required />
            </div>
            <div>
              <label>{t("network.status")}</label>
              <div className="relative">
                <select value={isActive ? "active" : "inactive"} onChange={e => setIsActive(e.target.value === "active")}
                  className="w-full h-10 px-3 py-2 pr-10 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                >
                  <option value="active">{t("network.active")}</option>
                  <option value="inactive">{t("network.inactive")}</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <Button type="submit" disabled={loading}>{loading ? t("network.saving") : t("network.save")}</Button>
          </form>
      </CardContent>
    </Card>
  )
} 