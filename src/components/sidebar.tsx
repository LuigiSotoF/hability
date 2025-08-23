"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Activity,
  Users,
  Package,
  CreditCard,
  Settings,
  BarChart3,
  FileText,
  Bell,
  Menu,
  X,
  Home,
  User,
  LogOut
} from "lucide-react"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

interface SidebarProps {
  isOpen?: boolean
  onToggle?: () => void
}

export default function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    { id: "analytics", label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    { id: "users", label: "Usuarios", icon: Users, href: "/dashboard/users" },
    { id: "settings", label: "Configuración", icon: Settings, href: "/dashboard/settings" },
  ]

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 h-full bg-white border-r border-gray-200 rounded-2xl lg:rounded-none transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#1382F8] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Hability</h1>
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

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/api/placeholder/40/40" />
              <AvatarFallback className="bg-[#1382F8] text-white">
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Admin
              </p>
              <p className="text-xs text-gray-500 truncate">
                admin@hability.com
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

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

        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={onToggle}
            className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </>
  )
}
