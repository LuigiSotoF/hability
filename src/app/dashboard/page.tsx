"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HistoryChart } from "@/components/history-chart"
import { DateFilterSelector, DateFilter } from "@/components/date-filter-selector"
import { useState, useEffect } from "react"
import { useChatsService } from "@/lib/services/chats.service"
import { Chat } from "@/lib/types/chat.types"
import { ArrowUpRight } from "lucide-react"

export default function Dashboard() {
  const [filteredChats, setFilteredChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [currentFilter, setCurrentFilter] = useState<DateFilter>("thismonth")
  const { getChats } = useChatsService()
  const [chartLabels, setChartLabels] = useState<string[]>([])
  const [chartValues, setChartValues] = useState<number[]>([])

  const handleFilterChange = (filter: DateFilter, startDate: Date | null, endDate: Date | null) => {
    setCurrentFilter(filter)
    if (startDate && endDate) {
      filterChatsByDateRange(startDate, endDate)
    }
  }

  const filterChatsByDateRange = async (startDate: Date, endDate: Date) => {
    setLoading(true)
    const result = await getChats({ page: 1, limit: 1000 })

    console.log({ result });


    if (result.isOk && result.data) {
      const filtered = result.data.filter(chat => {
        const chatDate = new Date(chat.created_at)
        return chatDate >= startDate && chatDate <= endDate
      })
      setFilteredChats(filtered)

      // construir serie para el gráfico (conteo por día)
      const countsMap = new Map<string, number>()
      filtered.forEach((chat) => {
        const d = new Date(chat.created_at)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        countsMap.set(key, (countsMap.get(key) ?? 0) + 1)
      })

      const labels = Array.from(countsMap.keys()).sort()
      const values = labels.map((k) => countsMap.get(k) ?? 0)
      setChartLabels(labels)
      setChartValues(values)
    }
    setLoading(false)
  }

  useEffect(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    filterChatsByDateRange(startOfMonth, now)
  }, [])

  const totalChats = filteredChats.length
  // Verificaciones totales: REGISTER_ACCEPTED_OFFERT o REGISTER_HOUSE_DETAILS
  const verificationChats = filteredChats.filter((chat) =>
    chat.status === "REGISTER_ACCEPTED_OFFERT" || chat.status === "REGISTER_HOUSE_DETAILS"
  ).length
  // Completados: REGISTER_ACCEPTED_OFFERT
  const completedChats = filteredChats.filter((chat) => chat.status === "REGISTER_ACCEPTED_OFFERT").length

  return (
    <div className="space-y-6">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <div>
          <DateFilterSelector onFilterChange={handleFilterChange} defaultValue={currentFilter} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificaciones Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {loading ? "..." : verificationChats}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1 text-green-600" />
              {loading ? "..." : totalChats > 0 ? `${((verificationChats / totalChats) * 100).toFixed(1)}% del total` : "0% del total"}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Chats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {loading ? "..." : totalChats}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1 text-green-600" />
              En el período seleccionado
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chats Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {loading ? "..." : completedChats}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1 text-green-600" />
              {loading ? "..." : `${((completedChats / totalChats) * 100).toFixed(1)}% del total`}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
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
        <HistoryChart labels={chartLabels} values={chartValues} />
      </div>
    </div>
  )
}
