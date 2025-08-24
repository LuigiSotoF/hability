"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Settings,
  X,
  Home,
  User,
  LogOut,
  TextSearch,
  IdCard,
  KeyRound
} from "lucide-react"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import Image from "next/image"

interface SidebarProps {
  isOpen?: boolean
  onToggle?: () => void
}

export default function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    { id: "register", label: "Registro", icon: TextSearch, href: "/dashboard/register" },
    { id: "account_settings", label: "Configuración", icon: Settings, href: "/dashboard/account-settings" },
    { id: "api_and_integrations", label: "API & Integraciones", icon: KeyRound, href: "/dashboard/api-and-integrations", disabled: true },
  ]

  const menuProducts = [
    { id: "infra_check", label: "Infra Check", icon: IdCard, href: "/dashboard/infra-check", color: "bg-[#1482F8]" },
    { id: "legal_check", label: "Legal Check", icon: IdCard, href: "/dashboard/legal-check", color: "bg-[#F86B14]", disabled: true },
    { id: "debt_check", label: "Debt Check", icon: IdCard, href: "/dashboard/debt-check", color: "bg-[#F81418]", disabled: true },
    { id: "market_check", label: "Market Check", icon: IdCard, href: "/dashboard/market-check", color: "bg-[#F81418]", disabled: true },
  ]

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/35 bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 h-screen bg-white border-r border-[#DEDEDE] shadow-lg lg:shadow-none transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-2">
            <Image src="/hability-logo.svg" alt="Hability" width={120} height={120} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="border-b border-[#F0F0F0] mx-4 rounded-md" />
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isDisabled = item.disabled

            if (isDisabled) {
              return (
                <div
                  key={item.id}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed opacity-50"
                >
                  <Icon className="w-5 h-5 mr-3 text-gray-300" />
                  {item.label}
                </div>
              )
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onToggle}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                  ${isActive
                    ? 'bg-[#1382F8] text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[#F0F0F0] mx-4 rounded-md" />
        <nav className="flex-1 p-4 ">
          <h1 className="text-sm font-medium text-gray-600">Productos</h1>
          {menuProducts.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isDisabled = item.disabled

            if (isDisabled) {
              return (
                <div
                  key={item.id}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed opacity-50"
                >
                  <Icon className={`w-7 h-7 mr-3 p-1 rounded ${item.color} text-white opacity-50`} />
                  {item.label}
                </div>
              )
            }

            return (
              <Link key={item.id} href={item.href} className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                <Icon className={`w-7 h-7 mr-3 p-1 rounded ${item.color} text-white`} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
