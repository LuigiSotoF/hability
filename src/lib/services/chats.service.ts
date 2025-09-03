import { GetChatsInput, GetChatsOutput } from "../types/cases/get-chats"
import { getChatsAction } from "@/app/actions/get-chat.action"

export const useChatsService = () => {

    const getChats = (input: GetChatsInput): Promise<GetChatsOutput> => {
        return getChatsAction(input)
    }

    return {
        getChats,
    }
}