'use server';

import { MessageProviderWebhookPayload, TextMessage } from "@/lib/types/webhook.types";
import { createServerDBProvider } from "@/lib/providers/db.provider";
import { getUniqueUUID } from "@/lib/utils";
import { createChatAction } from "./create-chat.action";
import { getAssistantResponseAction } from "./get-assistant-response.action";
import { CHAT_STATUS, Messages } from "@/lib/types/chat.types";
import { sendMessageAction } from "./send-message-action";

export const processMessageAction = async (input: MessageProviderWebhookPayload): Promise<void> => {
    const provider = await createServerDBProvider();
    const [phoneNumber, _] = input.data.key.remoteJid.split('@');

    const user = await provider.from('users').select('*').eq('phone', phoneNumber).single();

    if (user.error) {
        const userId = getUniqueUUID();
        const createUserResponse = await provider.from('users').insert({
            id: userId,
            phone: phoneNumber
        });

        if (createUserResponse.error) {
            console.error('Error creating user:', createUserResponse.error);
            throw new Error('Error creating user');
        }

        const assistantResponse = await getAssistantResponseAction({
            message: input.data.message,
        });

        await createChatAction({
            userId,
            userMessage: (input.data.message as TextMessage).conversation,
            assistantResponse: assistantResponse.response['message'] || 'NO_VALUE',
            conversationId: assistantResponse.threadId,
        });

        sendMessageAction({
            to: phoneNumber,
            message: String(assistantResponse.response['message'] || 'NO_VALUE'),
        });

        return;
    }

    const existingChat = await provider.from('chats').select('*').eq('user_id', user.data.id).order('created_at', { ascending: false }).limit(1).single();
    const prevChat = existingChat.data;

    if (!prevChat) {
        throw new Error('No existing chat found for user');
    }

    const assistantResponse = await getAssistantResponseAction({
        threadId: prevChat.conversation_id,
        message: input.data.message,
    });

    await provider.from('messages').insert<Partial<Messages>>([
        {
            side: 'USER',
            content: (input.data.message as TextMessage).conversation,
            chat_id: prevChat.id,
        },
        {
            side: 'ASSISTANT',
            content: assistantResponse.response['message'] || 'NO_VALUE',
            chat_id: prevChat.id,
        }
    ]);

    const newStep: CHAT_STATUS = assistantResponse.response?.data?.newStep;

    if (newStep) {
        await provider.from('chats').update({
            status: assistantResponse.response.data.newStep,
        }).eq('id', prevChat.id);

        if (newStep === 'HOUSE_RECOGNITION') {
            console.log("Aqui se necesita emitir un evento para liberar el deep research");
        }

        if (newStep === 'CALCULING_PRICE') {
            console.log("Aqui se necesita emitir un evento para calcular el precio");
        }
    }

    console.log({
        assistantResponse,
    });


    sendMessageAction({
        to: phoneNumber,
        message: String(assistantResponse.response['message'] || 'NO_VALUE'),
    });
};
