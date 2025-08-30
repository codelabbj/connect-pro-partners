"use client"

import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useLanguage } from "@/components/providers/language-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const pageNames: Record<string, string> = {
  "/dashboard": "dashboard.title",
  "/dashboard/users": "users.title",
  "/dashboard/transactions": "transactions.title",
}

export function Header() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const pageTitle = pageNames[pathname] || "dashboard.title"

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex h-14 sm:h-16 justify-between items-center">
          <div className="flex items-center min-w-0 flex-1">
            <h1 className="hidden sm:block text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white truncate">
              {t(pageTitle)}
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
            <div className="hidden sm:flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 sm:h-9 sm:w-9 cursor-pointer">
                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer">
                  <a href="/dashboard/profile" className="w-full">Profile</a>
                </DropdownMenuItem>
                {/* <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
