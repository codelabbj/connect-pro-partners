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
import { Eye, EyeOff } from "lucide-react"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"

export function SignInForm() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const [showPassword, setShowPassword] = useState(false)
  const apiFetch = useApi();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = await apiFetch(`${baseUrl}api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      })
      if (!data || !data.access || !data.refresh || !data.user) {
        const backendError = extractErrorMessages(data) || t("auth.loginFailed")
        setError(backendError)
        toast({
          title: t("auth.loginFailed"),
          description: backendError,
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      // Enforce staff/superuser-only access
      const user = data.user
      // const isStaff = Boolean(user?.is_staff)
      const isSuperuser = Boolean(user?.is_partner)
      if (!isSuperuser) {
        const notAllowedMsg = t("auth.notAllowed") || "User is not allowed to access this dashboard."
        setError(notAllowedMsg)
        toast({
          title: t("auth.loginFailed"),
          description: notAllowedMsg,
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      localStorage.setItem("accessToken", data.access)
      localStorage.setItem("refreshToken", data.refresh)
      localStorage.setItem("user", JSON.stringify(data.user))
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true")
        document.cookie = `accessToken=${data.access}; path=/; max-age=86400; secure; samesite=strict`;
      } else {
        localStorage.removeItem("rememberMe")
        document.cookie = `accessToken=${data.access}; path=/; secure; samesite=strict`;
      }
      toast({
        title: t("auth.loginSuccess"),
        description: t("auth.loggedInSuccessfully"),
      })
      router.push("/dashboard")
    } catch (err: any) {
      let backendError = t("auth.networkError");
      if (err && err.message) {
        try {
          const parsed = JSON.parse(err.message);
          backendError = extractErrorMessages(parsed) || backendError;
        } catch {
          backendError = extractErrorMessages(err.message) || backendError;
        }
      } else if (err) {
        backendError = extractErrorMessages(err) || backendError;
      }
      setError(backendError);
      toast({
        title: t("auth.networkError"),
        description: backendError,
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full">
        <CardHeader className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Connect Pro Logo" className="h-15 w-15 sm:h-20 sm:w-20" />
              <div>
                <CardTitle className="text-xl sm:text-2xl">Connect Pro</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Partenaires Dashboard</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm sm:text-base">
                {t("auth.email")}
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="john@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base">
                {t("auth.password")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 text-sm sm:text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="rememberMe" className="text-xs sm:text-sm">
                {t("auth.rememberMe")}
              </Label>
            </div>
            {error && (
              <ErrorDisplay
                error={error}
                variant="inline"
                showDismiss={true}
                onDismiss={() => setError("")}
              />
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ?t("auth.loggingIn") : t("auth.signIn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
