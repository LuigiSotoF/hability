"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Activity, Users, Package, CreditCard, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { HistoryChart } from "@/components/history-chart"
import ActiveChatsCounter from "@/components/active-chats-counter"
import { DateFilterSelector, DateFilter } from "@/components/date-filter-selector"
import { useState, useEffect } from "react"
import { useChatsService } from "@/lib/services/chats.service"
import { Chat } from "@/lib/types/chat.types"

export default function Dashboard() {
  const [filteredChats, setFilteredChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [currentFilter, setCurrentFilter] = useState<DateFilter>("thismonth")
  const { getChats } = useChatsService()

  const handleFilterChange = (filter: DateFilter, startDate: Date | null, endDate: Date | null) => {
    setCurrentFilter(filter)
    if (startDate && endDate) {
      filterChatsByDateRange(startDate, endDate)
    }
  }

  const filterChatsByDateRange = async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true)
      const result = await getChats({ page: 1, limit: 1000 })

      if (result.isOk && result.data) {
        const filtered = result.data.filter(chat => {
          const chatDate = new Date(chat.created_at)
          return chatDate >= startDate && chatDate <= endDate
        })
        setFilteredChats(filtered)
      }
    } catch (error) {
      console.error("Error filtering chats:", error)
      setFilteredChats([])
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    filterChatsByDateRange(startOfMonth, now)
  }, [])

  // Calcular estadísticas basadas en los chats filtrados
  const totalChats = filteredChats.length
  const activeChats = filteredChats.filter(chat =>
    chat.status === "CALCULING_PRICE" || chat.status === "OFFERT"
  ).length
  const completedChats = filteredChats.filter(chat =>
    chat.status === "OFFERT"
  ).length

  return (
    <div className="space-y-6">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div>
          <DateFilterSelector onFilterChange={handleFilterChange} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificaciones Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : activeChats}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1 text-green-600" />
              {loading ? "..." : `${((activeChats / totalChats) * 100).toFixed(1)}% del total`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Chats</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : totalChats}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1 text-green-600" />
              En el período seleccionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chats Completados</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : completedChats}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1 text-green-600" />
              {loading ? "..." : `${((completedChats / totalChats) * 100).toFixed(1)}% del total`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : totalChats > 0 ? `${((completedChats / totalChats) * 100).toFixed(1)}%` : "0%"}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1 text-green-600" />
              Completados vs Total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <HistoryChart />
      </div>
    </div>
  )
}
