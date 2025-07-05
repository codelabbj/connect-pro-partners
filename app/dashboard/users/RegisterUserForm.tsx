"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"

export default function RegisterUserForm() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirm: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { t } = useLanguage();
  const apiFetch = useApi();

  // Get base URL and token from env
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || ""

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function extractErrorMessages(errorObj: any): string {
    if (!errorObj || typeof errorObj !== "object" || Array.isArray(errorObj)) return String(errorObj)
    if (errorObj.detail) return errorObj.detail
    if (errorObj.message) return errorObj.message
    // If it's a field error object, join all messages without field names
    return Object.values(errorObj)
      .flat()
      .join(" | ")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (form.password !== form.password_confirm) {
      setError(t("register.passwordsNoMatch"))
      return
    }
    setLoading(true)
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (apiToken) {
        headers["Authorization"] = `Bearer ${apiToken}`
      }
      const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/register/`, {
        method: "POST",
        headers,
        body: JSON.stringify(form),
      })
      if (data && data.detail) {
        setError(extractErrorMessages(data))
      } else {
        setSuccess(t("register.success"))
        setForm({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          password: "",
          password_confirm: "",
        })
      }
    } catch (err) {
      setError(t("register.networkError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{t("register.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Input
              name="first_name"
              placeholder={t("register.firstName")}
              value={form.first_name}
              onChange={handleChange}
              required
            />
            <Input
              name="last_name"
              placeholder={t("register.lastName")}
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </div>
          <Input
            name="email"
            type="email"
            placeholder={t("register.email")}
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            name="phone"
            placeholder={t("register.phone")}
            value={form.phone}
            onChange={handleChange}
            required
          />
          <div className="flex gap-4">
            <Input
              name="password"
              type="password"
              placeholder={t("register.password")}
              value={form.password}
              onChange={handleChange}
              required
            />
            <Input
              name="password_confirm"
              type="password"
              placeholder={t("register.passwordConfirm")}
              value={form.password_confirm}
              onChange={handleChange}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <Button type="submit" disabled={loading}>
            {loading ? t("register.registering") : t("register.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 