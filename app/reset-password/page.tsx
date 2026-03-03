"use client"

import { useState, useEffect } from "react"
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
import { KeyRound, ShieldCheck, ArrowLeft, Eye, EyeOff } from "lucide-react"

export default function ResetPasswordPage() {
    const [identifier, setIdentifier] = useState("")
    const [code, setCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const { t } = useLanguage()
    const apiFetch = useApi()
    const { toast } = useToast()
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

    useEffect(() => {
        const savedIdentifier = localStorage.getItem("reset_identifier")
        if (savedIdentifier) {
            setIdentifier(savedIdentifier)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            setError(t("register.passwordsNoMatch"))
            return
        }

        setLoading(true)
        setError(null)

        try {
            const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auth/password-reset/confirm/`
            await apiFetch(endpoint, {
                method: "POST",
                body: JSON.stringify({
                    identifier,
                    code,
                    new_password: newPassword,
                }),
            })

            toast({
                title: t("common.success"),
                description: t("auth.resetSuccess"),
            })

            localStorage.removeItem("reset_identifier")
            router.push("/")
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
                            <CardTitle className="text-2xl">{t("auth.resetPasswordTitle")}</CardTitle>
                            <CardDescription>{t("auth.resetPasswordSubtitle")}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="identifier">{t("auth.identifierLabel")}</Label>
                                <Input
                                    id="identifier"
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="code">{t("auth.resetCode")}</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    placeholder="123456"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                    className="text-center tracking-widest text-lg font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new_password">{t("auth.newPassword")}</Label>
                                <div className="relative">
                                    <Input
                                        id="new_password"
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm_password">{t("auth.confirmNewPassword")}</Label>
                                <Input
                                    id="confirm_password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <ErrorDisplay
                                    error={error}
                                    variant="inline"
                                    showDismiss={true}
                                    onDismiss={() => setError(null)}
                                />
                            )}

                            <div className="flex flex-col gap-3 pt-2">
                                <Button type="submit" disabled={loading} className="w-full gap-2">
                                    {loading ? <KeyRound className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                    {t("auth.confirmReset")}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full gap-2"
                                    onClick={() => router.push("/forgot-password")}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    {t("common.back")}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
