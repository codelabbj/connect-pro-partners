'use client'
import { SignInForm } from "@/components/auth/sign-in-form"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check for accessToken cookie
    if (typeof document !== 'undefined') {
      const hasToken = document.cookie.split(';').some(cookie => cookie.trim().startsWith('accessToken='))
      if (hasToken) {
        router.push('/dashboard')
      } else {
        setChecking(false)
      }
    }
  }, [router])

  if (checking) {
    // Show a fallback UI while checking for the access token
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <span className="text-gray-700 dark:text-gray-200 text-base sm:text-lg">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-6 sm:py-8 lg:py-12 px-3 sm:px-4 lg:px-6 xl:px-8">
      <SignInForm />
    </div>
  )
}
