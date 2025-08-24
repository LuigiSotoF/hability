"use client"

import { useChatsService } from "@/lib/services/chats.service"
import { useEffect, useState } from "react"
import { CHAT_STATUS } from "@/lib/types/chat.types"

interface ActiveChatsCounterProps {
  startDate?: Date
  endDate?: Date
}

export default function ActiveChatsCounter({ startDate, endDate }: ActiveChatsCounterProps) {
  const [activeChatsCount, setActiveChatsCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const { getChats } = useChatsService()

  useEffect(() => {
    const fetchActiveChats = async () => {
      try {
        setLoading(true)
        const result = await getChats({ page: 1, limit: 1000 })

        if (result.isOk && result.data) {
          let filteredChats = result.data.filter(chat =>
            chat.status === ("CALCULING_PRICE" as CHAT_STATUS) || chat.status === ("OFFERT" as CHAT_STATUS)
          )
          if (startDate && endDate) {
            filteredChats = filteredChats.filter(chat => {
              const chatDate = new Date(chat.created_at)
              return chatDate >= startDate && chatDate <= endDate
            })
          }

          setActiveChatsCount(filteredChats.length)
        }
      } catch (error) {
        console.error("Error fetching chats:", error)
        setActiveChatsCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchActiveChats()
  }, [startDate, endDate])

  return (
                <div className="text-2xl font-semibold">
      {loading ? "..." : activeChatsCount}
    </div>
  )
}
