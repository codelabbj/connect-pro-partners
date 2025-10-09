"use client"

import { useState, Fragment } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/providers/language-provider"
import { BarChart3, LayoutDashboard, CreditCard, LogOut, Menu, X, Zap, ChevronDown, ChevronUp, Globe, Share2, Phone, Monitor, MessageCircle, Bell, Settings, Terminal, User, ChevronDownCircleIcon, BarChart3Icon, Send, Gamepad2, TrendingUp, DollarSign } from "lucide-react"
import { clearTokens } from "@/lib/api"

// const navigation = [
//   { name: "nav.dashboard", href: "/dashboard", icon: BarChart3 },
//   { name: "nav.users", href: "/dashboard/users", icon: Users },
//   { name: "nav.transactions", href: "/dashboard/transactions", icon: CreditCard },
// ]

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false)
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false)
  const [devicesDropdownOpen, setDevicesDropdownOpen] = useState(false)
  const [networkConfigDropdownOpen, setNetworkConfigDropdownOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()

  // Helper to check if a path is active or a child is active
  const isUsersActive = pathname.startsWith("/dashboard/users")
  const isRegisterActive = pathname === "/dashboard/users/register"
  const isListActive = pathname === "/dashboard/users/list"

  // Active logic for new dropdowns
  const isCountryActive = pathname.startsWith("/dashboard/country")
  const isCountryListActive = pathname === "/dashboard/country/list"
  const isCountryCreateActive = pathname === "/dashboard/country/create"

  const isNetworkActive = pathname.startsWith("/dashboard/network")
  const isNetworkListActive = pathname === "/dashboard/network/list"
  const isNetworkCreateActive = pathname === "/dashboard/network/create"

  const isDevicesActive = pathname.startsWith("/dashboard/devices")
  const isDevicesListActive = pathname === "/dashboard/devices/list"

  const isNetworkConfigActive = pathname.startsWith("/dashboard/network-config")
  const isNetworkConfigListActive = pathname === "/dashboard/network-config/list"
  const isNetworkConfigCreateActive = pathname === "/dashboard/network-config/create"

  const handleLogout = () => {
    clearTokens();
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    }
    localStorage.removeItem("isAuthenticated");
    router.push("/");
  }

  // Helper for section headers
  const SectionHeader = ({ children }: { children: React.ReactNode }) => (
    <div className="mt-4 mb-2 px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
      {children}
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden transition-all duration-300",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-72 sm:w-80 flex-col bg-white dark:bg-gray-900 h-full shadow-xl transition-transform duration-300">
          <div className="flex h-14 sm:h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-2 min-w-0">
              <img src="/logo.png" alt="Connect Pro Logo" className="h-12 w-12 sm:h-15 sm:w-15 flex-shrink-0" />
              <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 truncate">Connect Pro Partenaires</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="flex-shrink-0 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 p-0">
              <X className="h-8 w-8 sm:h-6 sm:w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto min-h-0">
            <SectionHeader>Generale</SectionHeader>
            <Link
              href="/dashboard"
              aria-label="Dashboard"
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-sm sm:text-base rounded-lg font-medium transition-colors",
                pathname === "/dashboard"
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">{t("nav.dashboard")}</span>
            </Link>
            
            <SectionHeader>Gestion des transactions</SectionHeader>
            <Link
              href="/dashboard/transactions"
              aria-label="Transactions"
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-sm sm:text-base rounded-lg font-medium transition-colors",
                pathname === "/dashboard/transactions"
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">{t("nav.transactions")}</span>
            </Link>
            <Link
              href="/dashboard/account-transaction"
              aria-label="Transactions"
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-sm sm:text-base rounded-lg font-medium transition-colors",
                pathname === "/dashboard/account-transaction"
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">{t("nav.accountTransaction")}</span>
            </Link>
            <Link
              href="/dashboard/topup"
              aria-label="Transactions"
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-sm sm:text-base rounded-lg font-medium transition-colors",
                pathname === "/dashboard/topup"
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">{t("nav.topup")}</span>
            </Link>
            {/* <Link
              href="/dashboard/transfer"
              aria-label="Transferts"
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-sm sm:text-base rounded-lg font-medium transition-colors",
                pathname === "/dashboard/transfer"
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Transferts</span>
            </Link>
            
            <SectionHeader>Plateformes de Paris</SectionHeader>
            <Link
              href="/dashboard/betting/platforms"
              aria-label="Plateformes"
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-sm sm:text-base rounded-lg font-medium transition-colors",
                pathname.startsWith("/dashboard/betting/platforms")
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Plateformes</span>
            </Link>
            <Link
              href="/dashboard/betting/transactions"
              aria-label="Transactions Paris"
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-sm sm:text-base rounded-lg font-medium transition-colors",
                pathname.startsWith("/dashboard/betting/transactions")
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Transactions Paris</span>
            </Link>
            <Link
              href="/dashboard/betting/commissions"
              aria-label="Commissions"
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-sm sm:text-base rounded-lg font-medium transition-colors",
                pathname.startsWith("/dashboard/betting/commissions")
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Commissions</span>
            </Link> */}
            
            
            
           
          </nav>
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-800">
            <Button variant="ghost" className="w-full justify-start text-sm sm:text-base" onClick={handleLogout}>
              <LogOut className="mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">{t("nav.logout")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-900 pt-5 pb-4 overflow-y-auto border-r border-gray-200 dark:border-gray-800">
          <div className="flex items-center flex-shrink-0 px-4">
            <img src="/logo.png" alt="Connect Pro Logo" className="h-14 w-14" />
            <span className="ml-3 text-lg font-bold text-gray-800 dark:text-gray-100">Connect Pro Partenaires</span>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            <SectionHeader>Generale</SectionHeader>
            <Link
              href="/dashboard"
              aria-label="Dashboard"
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-base rounded-lg font-medium transition-colors",
                pathname === "/dashboard"
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              <BarChart3 className="h-5 w-5" />
              {t("nav.dashboard")}
            </Link>
            
            <SectionHeader>Gestion des transactions</SectionHeader>
            <Link
              href="/dashboard/transactions"
              aria-label="Transactions"
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-base rounded-lg font-medium transition-colors",
                pathname === "/dashboard/transactions"
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              <CreditCard className="h-5 w-5" />
              {t("nav.transactions")}
            </Link>
            <Link
              href="/dashboard/account-transaction"
              aria-label="Transactions"
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-base rounded-lg font-medium transition-colors",
                pathname === "/dashboard/account-transaction"
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              {t("nav.accountTransaction")}
            </Link>
            <Link
              href="/dashboard/topup"
              aria-label="Transactions"
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-base rounded-lg font-medium transition-colors",
                pathname === "/dashboard/topup"
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              <Zap className="h-5 w-5" />
              {t("nav.topup")}
            </Link>
            {/* <Link
              href="/dashboard/transfer"
              aria-label="Transferts"
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-base rounded-lg font-medium transition-colors",
                pathname === "/dashboard/transfer"
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              <Send className="h-5 w-5" />
              Transferts
            </Link>

            <SectionHeader>Plateformes de Paris</SectionHeader>
            <Link
              href="/dashboard/betting/platforms"
              aria-label="Plateformes"
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-base rounded-lg font-medium transition-colors",
                pathname.startsWith("/dashboard/betting/platforms")
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              <Gamepad2 className="h-5 w-5" />
              Plateformes
            </Link>
            <Link
              href="/dashboard/betting/transactions"
              aria-label="Transactions Paris"
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-base rounded-lg font-medium transition-colors",
                pathname.startsWith("/dashboard/betting/transactions")
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              <CreditCard className="h-5 w-5" />
              Transactions Paris
            </Link>
            <Link
              href="/dashboard/betting/commissions"
              aria-label="Commissions"
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 text-base rounded-lg font-medium transition-colors",
                pathname.startsWith("/dashboard/betting/commissions")
                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 shadow"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              <DollarSign className="h-5 w-5" />
              Commissions
            </Link> */}

           
            
           
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-3 h-5 w-5" />
              {t("nav.logout")}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <Button variant="ghost" className="fixed top-3 left-3 z-40 h-10 w-10 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 p-0" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-9 w-9 text-gray-700 dark:text-gray-300" />
        </Button>
      </div>
    </>
  )
}
