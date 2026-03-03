"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Mail, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
    const [identifier, setIdentifier] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const { t } = useLanguage()
    const apiFetch = useApi()
    const { toast } = useToast()
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auth/password-reset/`
            await apiFetch(endpoint, {
                method: "POST",
                body: JSON.stringify({ identifier }),
            })

            toast({
                title: t("common.success"),
                description: t("auth.resetInitiated"),
            })

            // Save identifier for the next step
            localStorage.setItem("reset_identifier", identifier)
            router.push("/reset-password")
        } catch (err: any) {
            const errorMessage = extractErrorMessages(err)
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => router.push("/")}>
                                <img src="/logo.png" alt="Connect Pro" className="h-10 w-10" />
                                <CardTitle className="text-xl">Connect Pro</CardTitle>
                            </div>
                            <div className="flex items-center space-x-2">
                                <ThemeToggle />
                                <LanguageSwitcher />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl">{t("auth.forgotPasswordTitle")}</CardTitle>
                            <CardDescription>{t("auth.forgotPasswordSubtitle")}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="identifier">{t("auth.identifierLabel")}</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="identifier"
                                        type="text"
                                        placeholder="email@example.com"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <ErrorDisplay
                                    error={error}
                                    variant="inline"
                                    showDismiss={true}
                                    onDismiss={() => setError(null)}
                                />
                            )}

                            <div className="flex flex-col gap-3">
                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading ? t("common.submitting") : t("auth.sendCode")}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full gap-2"
                                    onClick={() => router.push("/")}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    {t("auth.backToLogin")}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
