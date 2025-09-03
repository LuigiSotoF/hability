"use server";
import { createServerDBProvider } from "@/lib/providers/db.provider";
import { GetChatsInput, GetChatsOutput } from "../../lib/types/cases/get-chats";
import { Chat } from "@/lib/types/chat.types";

export const getChatsAction = async (input: GetChatsInput): Promise<GetChatsOutput> => {
    const dbProvider = await createServerDBProvider();
    const chats = await dbProvider
        .from('chats')
        .select('id, created_at, status, user_id, conversation_id')
        .order('created_at', { ascending: false })
        .limit(500);
    const plain = (chats.data ?? []).map((c: any) => ({
        id: c.id,
        user_id: c.user_id,
        created_at: c.created_at ? new Date(c.created_at).toISOString() : null,
        status: c.status,
        messages: [],
    })) as Chat[]

    // forzar objetos planos serializables (envoltorio)
    const payload = { data: plain as unknown as Chat[], isOk: true as const }
    return JSON.parse(JSON.stringify(payload));
};
