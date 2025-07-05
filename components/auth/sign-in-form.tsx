"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useLanguage } from "@/components/providers/language-provider"
import { Zap, Eye, EyeOff } from "lucide-react"
import { useApi } from "@/lib/useApi"

// Helper to extract error messages from API responses
function extractErrorMessages(errorObj: any): string {
  if (!errorObj || typeof errorObj !== "object") return String(errorObj)
  if (errorObj.detail) return errorObj.detail
  if (errorObj.message) return errorObj.message
  // If it's a field error object, join all messages
  return Object.values(errorObj)
    .flat()
    .join(" ")
}

export function SignInForm() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { t } = useLanguage()
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const [showPassword, setShowPassword] = useState(false)
  const apiFetch = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      // Use apiFetch instead of fetch
      const data = await apiFetch(`${baseUrl}api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      })
      if (!data || data.detail) {
        setError(extractErrorMessages(data) || "Login failed.")
        return
      }
      // Store tokens and user info in localStorage for client use
      localStorage.setItem("accessToken", data.access)
      localStorage.setItem("refreshToken", data.refresh)
      localStorage.setItem("user", JSON.stringify(data.user))
      console.log('Login response access token:', data.access);
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true")
        // Set cookie for 1 day
        document.cookie = `accessToken=${data.access}; path=/; max-age=86400; secure; samesite=strict`;
      } else {
        localStorage.removeItem("rememberMe")
        // Set session cookie
        document.cookie = `accessToken=${data.access}; path=/; secure; samesite=strict`;
      }
      console.log('Cookie after login:', document.cookie);
      router.push("/dashboard")
    } catch (err) {
      setError("Network error.")
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Zap className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">Connect Pro</span>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{t("auth.welcome")}</CardTitle>
          <CardDescription className="text-center">{t("auth.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm">
                  {t("auth.rememberMe")}
                </Label>
              </div>
              <Button variant="link" className="px-0 text-sm">
                {t("auth.forgotPassword")}
              </Button>
            </div>
            <Button type="submit" className="w-full">
              {t("auth.signIn")}
            </Button>
            {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
