import { createServerDBProvider } from "@/lib/providers/db.provider";
import { CHAT_STATUS, Messages } from "@/lib/types/chat.types";
import { getUniqueUUID } from "@/lib/utils";

export const createChatAction = async (input: {
    userId: string;
    userMessage: string;
    assistantResponse: string;
    conversationId: string;
}): Promise<string> => {
    const provider = await createServerDBProvider();

    const chatId = getUniqueUUID();

    await provider.from('chats').insert({
        id: chatId,
        user_id: input.userId,
        status: 'INITIAL' as CHAT_STATUS,
        conversation_id: input.conversationId,
    });

    await provider.from('messages').insert<Partial<Messages>>([
        {
            side: 'USER',
            content: input.userMessage,
            chat_id: chatId,
        },
        {
            side: 'ASSISTANT',
            content: input.assistantResponse,
            chat_id: chatId,
        }
    ]);

    return chatId;
};
