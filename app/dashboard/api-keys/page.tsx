"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { useToast } from "@/hooks/use-toast"
import { Copy, Key, RefreshCw, CheckCircle2, Terminal, Plus, Eye, EyeOff } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"

interface ApiKeyResponse {
    api_key: string
    api_secret: string
    created_at: string
    detail?: string
}

export default function ApiKeysPage() {
    const apiFetch = useApi()
    const { t } = useLanguage()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<ApiKeyResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showApiKey, setShowApiKey] = useState(false)
    const [showApiSecret, setShowApiSecret] = useState(false)

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

    const generateKeys = async () => {
        setLoading(true)
        setError(null)
        setShowApiKey(false)
        setShowApiSecret(false)
        try {
            const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auth/api-key/`
            const response = await apiFetch(endpoint, {
                method: "GET",
            })
            setData(response)
            toast({
                title: t("apiKeys.generateSuccess"),
                variant: "default",
            })
        } catch (err: any) {
            console.error("Failed to generate API Keys:", err)
            const errorMessage = extractErrorMessages(err)
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast({
            description: t("apiKeys.copySuccess"),
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{t("apiKeys.title")}</h1>
                <p className="text-muted-foreground">{t("apiKeys.subtitle")}</p>
            </div>

            {error && (
                <ErrorDisplay
                    error={error}
                    onRetry={generateKeys}
                    variant="full"
                    showDismiss={true}
                    onDismiss={() => setError(null)}
                />
            )}

            <Card className="border-2 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Terminal className="h-5 w-5 text-blue-600" />
                            <CardTitle>{t("apiKeys.title")}</CardTitle>
                        </div>
                        {data && (
                            <Button
                                onClick={generateKeys}
                                disabled={loading}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                                {t("apiKeys.generateNew")}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {loading && !data ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    ) : data ? (
                        <>
                            <div className="grid gap-4">
                                {/* API Key */}
                                <div className="space-y-2">
                                    <Label htmlFor="api-key" className="text-sm font-semibold">{t("apiKeys.keyLabel")}</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="api-key"
                                            type={showApiKey ? "text" : "password"}
                                            value={data.api_key}
                                            readOnly
                                            className="font-mono bg-muted focus-visible:ring-0"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setShowApiKey((v) => !v)}
                                            title={showApiKey ? "Masquer" : "Afficher"}
                                            className="shrink-0"
                                        >
                                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => copyToClipboard(data.api_key)}
                                            title="Copy API Key"
                                            className="shrink-0"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* API Secret */}
                                <div className="space-y-2">
                                    <Label htmlFor="api-secret" className="text-sm font-semibold">{t("apiKeys.secretLabel")}</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="api-secret"
                                            type={showApiSecret ? "text" : "password"}
                                            value={data.api_secret}
                                            readOnly
                                            className="font-mono bg-muted focus-visible:ring-0"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setShowApiSecret((v) => !v)}
                                            title={showApiSecret ? "Masquer" : "Afficher"}
                                            className="shrink-0"
                                        >
                                            {showApiSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => copyToClipboard(data.api_secret)}
                                            title="Copy API Secret"
                                            className="shrink-0"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t mt-2">
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    <span>{t("apiKeys.createdAt")}: {new Date(data.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/30">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
                                <Key className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold">{t("apiKeys.noKeys")}</h3>
                            <p className="text-sm text-muted-foreground mt-2 mb-6">
                                {t("apiKeys.generateNew")}
                            </p>
                            <Button onClick={generateKeys} disabled={loading} className="gap-2 shadow-lg">
                                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                {t("apiKeys.generateNew")}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
