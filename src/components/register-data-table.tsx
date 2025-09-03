"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getHousesAction } from "@/app/actions/get-houses.action"
import { getChatsAction } from "@/app/actions/get-chat.action"
import { getOffertsAction } from "@/app/actions/get-offerts.action"
import { House } from "@/lib/types/house.types"
import { Chat, CHAT_STATUS } from "@/lib/types/chat.types"
import { Offert } from "@/lib/types/offert.types"

// Tipo combinado para la tabla
export type HouseTableData = {
  id: string
  address: string
  status: CHAT_STATUS
  infra_check: string
  date: string
  general_score: number
  created_at: Date | null
}

export interface RegisterDataTableProps {
  startDate?: Date | null
  endDate?: Date | null
}

export const columns: ColumnDef<HouseTableData>[] = [
  {
    accessorKey: "address",
    header: "Dirección",
    cell: ({ row }) => <div className="lowercase">{row.getValue("address")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const getStatusDisplay = (status: string) => {
        switch (status) {
          case "REGISTER_USER_DATA":
            return "Registro usuario"
          case "CHECK_HOUSE_PROPERTIES":
            return "Verif. propiedad"
          case "REGISTER_HOUSE_DETAILS":
            return "Detalles propiedad"
          case "REGISTER_PRE_OFFERT":
            return "Pre-oferta"
          case "REGISTER_ACCEPTED_OFFERT":
            return "Oferta aceptada"
          default:
            return status
        }
      }
      return (
        <div className="capitalize">{getStatusDisplay(status)}</div>
      )
    },
  },
  {
    accessorKey: "infra_check",
    header: "Infra Check",
    cell: ({ row }) => {
      const score = parseFloat(row.getValue("infra_check") as string)
      const getScoreColor = (score: number) => {
        if (score >= 8) return "bg-[#007524]/17 text-[#007524]"
        if (score >= 6) return "bg-[#feb204]/17 text-[#feb204]"
        if (score >= 4) return "bg-[#F86B14]/17 text-[#F86B14]"
        return "bg-[#D01A1A]/17 text-[#D01A1A]"
      }

      return (
        <div className={`px-2 py-1 rounded-md text-sm font-medium inline-block ${getScoreColor(score)}`}>
          {score}/10
        </div>
      )
    },
  },
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("date")}</div>
    ),
  },
  {
    accessorKey: "general_score",
    header: "General Score",
    cell: ({ row }) => {
      const score = row.getValue("general_score") as number
      const percentage = (score / 10) * 100 // Asumiendo que el score máximo es 10

      return (
        <div className="flex items-center gap-2">
          <div className="w-30 bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#1482F8] h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )
    },
  },

]

export function RegisterDataTable({ startDate, endDate }: RegisterDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [data, setData] = React.useState<HouseTableData[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Obtener houses
        const housesResponse = await getHousesAction({ page: 1, limit: 100 })
        const houses = housesResponse.isOk ? housesResponse.data : []

        // Obtener chats
        const chatsResponse = await getChatsAction({ page: 1, limit: 100 })
        const chats = chatsResponse.isOk ? chatsResponse.data : []

        // Obtener ofertas
        const offertsResponse = await getOffertsAction({ page: 1, limit: 100 })
        const offerts = offertsResponse.isOk ? offertsResponse.data : []

        // Crear mapas por id
        const chatMap = new Map<string, Chat>()
        chats.forEach((chat: Chat) => {
          chatMap.set(chat.id, chat)
        })

        const offertsByChatId = new Map<string, Offert[]>()
        offerts.forEach((off: Offert) => {
          const arr = offertsByChatId.get(off.chat_id) ?? []
          arr.push(off)
          offertsByChatId.set(off.chat_id, arr)
        })

        // Combinar datos de houses con chats y ofertas
        let tableData: HouseTableData[] = houses.map((house: House) => {
          const chat = chatMap.get(house.chat_id)
          const chatOfferts = offertsByChatId.get(house.chat_id) ?? []
          const hasAccepted = chatOfferts.some(o => o.accepted)
          const hasAnyOffert = chatOfferts.length > 0

          const resolvedStatus: CHAT_STATUS = hasAccepted
            ? "REGISTER_ACCEPTED_OFFERT"
            : hasAnyOffert
              ? "REGISTER_PRE_OFFERT"
              : (chat?.status ?? "REGISTER_USER_DATA")

          // Calcular un infra check simple promediando scores disponibles
          const infraAvg = Math.round((house.ceilingScore + house.floorScore + house.finishedScore) / 3)

          return {
            id: house.id,
            address: house.address,
            status: resolvedStatus,
            infra_check: String(infraAvg),
            date: chat?.created_at ? new Date(chat.created_at).toLocaleDateString('es-ES') : "N/A",
            general_score: infraAvg, // temporal, el usuario definirá luego
            created_at: chat?.created_at ? new Date(chat.created_at) : null
          }
        })

        // Filtrar por fecha si se proporcionan startDate y endDate
        if (startDate && endDate) {
          tableData = tableData.filter((item) => {
            if (!item.created_at) return false
            return item.created_at >= startDate && item.created_at <= endDate
          })
        }
        // Si startDate y endDate son null, no se aplica filtro (muestra todos)

        setData(tableData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [startDate, endDate])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por dirección..."
            value={(table.getColumn("address")?.getFilterValue() as string) ?? ""}
            onChange={(event: any) =>
              table.getColumn("address")?.setFilterValue(event.target.value)
            }
            className="w-full pl-10"
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
