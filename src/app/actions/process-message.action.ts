'use server';

import { MessageProviderWebhookPayload, TextMessage } from "@/lib/types/webhook.types";
import { createServerDBProvider } from "@/lib/providers/db.provider";
import { getDeepResearchPrompt, getUniqueUUID } from "@/lib/utils";
import { createChatAction } from "./create-chat.action";
import { getAssistantResponseAction } from "./get-assistant-response.action";
import { CHAT_STATUS, Messages } from "@/lib/types/chat.types";
import { sendMessageAction } from "./send-message-action";
import { useDeepResearchService } from "@/lib/services/deep-research.service";
import { createLogger } from "@/lib/logger";

export const processMessageAction = async (input: MessageProviderWebhookPayload): Promise<void> => {
    const deepResearchService = useDeepResearchService();
    const provider = await createServerDBProvider();
    const [phoneNumber, _] = input.data.key.remoteJid.split('@');
    const logger = createLogger({ flow: 'action:processMessage', correlationId: phoneNumber });

    logger.step('start', { phoneNumber });

    const user = await provider.from('users').select('*').eq('phoneNumber', phoneNumber).single();

    if (user.error) {
        logger.info('user_not_found', 'Creando nuevo usuario');
        const userId = getUniqueUUID();
        const createUserResponse = await provider.from('users').insert({
            id: userId,
            phoneNumber: phoneNumber
        });

        if (createUserResponse.error) {
            logger.error('user_create_failed', 'Fallo creando usuario', { error: createUserResponse.error });
            throw new Error('Error creating user');
        }
        logger.ok('user_created', 'Usuario creado', { userId });

        const assistantResponse = await getAssistantResponseAction({
            message: input.data.message,
            chatStatus: 'CREATING_RESPONSE',
        });
        logger.ok('assistant_response_new_thread', 'Respuesta inicial de assistant recibida', { threadId: assistantResponse.threadId });

        await createChatAction({
            userId,
            userMessage: (input.data.message as TextMessage).conversation,
            assistantResponse: assistantResponse.response['message'] || 'NO_VALUE',
            conversationId: assistantResponse.threadId,
        });
        logger.ok('chat_created', 'Chat inicial creado');

        sendMessageAction({
            to: phoneNumber,
            message: String(assistantResponse.response['message'] || 'NO_VALUE'),
        });
        logger.ok('message_sent', 'Mensaje enviado al usuario');
        return;
    }

    const {
        data: chat,
    } = await provider.from('chats')
        .select('*')
        .eq('user_id', user.data.id)
        .order('created_at', { ascending: false })
        .limit(1).single();

    if (!chat) {
        logger.error('chat_not_found', 'No se encontro chat existente para el usuario');
        throw new Error('No existing chat found for user');
    }

    const assistantResponse = await getAssistantResponseAction({
        threadId: chat.conversation_id,
        message: input.data.message,
        chatStatus: chat.status,
    });
    logger.ok('assistant_response_existing_thread', 'Respuesta de assistant recibida', { threadId: chat.conversation_id });

    await provider.from('messages').insert<Partial<Messages>>([
        {
            side: 'USER',
            content: (input.data.message as TextMessage).conversation,
            chat_id: chat.id,
        },
        {
            side: 'ASSISTANT',
            content: assistantResponse.response['message'] || 'NO_VALUE',
            chat_id: chat.id,
        }
    ]);
    logger.ok('messages_persisted', 'Mensajes insertados en BD');

    const payload = assistantResponse.response;
    const newStep: CHAT_STATUS = payload.action;
    const data = payload.data;

    if (newStep) {
        await provider.from('chats').update({ status: newStep }).eq('id', chat.id);
        logger.info('chat_status_updated', 'Estado del chat actualizado', { status: newStep });

        if (newStep === 'REGISTER_USER_DATA') {
            await provider.from('users').update({
                fullName: data.fullName ?? '',
            }).eq('id', chat.user_id).single();
            logger.ok('user_updated', 'Usuario actualizado con nombre', { fullName: data.fullName });
        }

        if (newStep === 'REGISTER_HOUSE_DETAILS') {
            const houseId = getUniqueUUID();
            const houseResponse = await provider.from('houses').insert({
                id: houseId,
                user_id: chat.user_id,
                chat_id: chat.id,
                address: data.address ?? '',
                city: data.city ?? 'BOGOTA',
                strate: parseInt(String(data.strate)) ?? 3,
                mts: parseInt(String(data.mts)) ?? 0,
                ceilingScore: parseInt(String(data.ceilingScore)) ?? 0,
                rooms: parseInt(String(data.rooms)) ?? 0,
                floorScore: parseInt(String(data.floorScore)) ?? 0,
                finishedScore: parseInt(String(data.finishedScore)) ?? 0,
            });
            logger.ok('house_created', 'Casa registrada', { houseId, response: houseResponse?.status ?? 'ok' });

            await deepResearchService.makeDeepResearch({
                conversationId: chat.conversation_id,
                prompt: getDeepResearchPrompt(data.address ?? '', data.city ?? 'BOGOTA', data.strate ?? '3'),
            });
            logger.info('deep_research_enqueued', 'Deep research encolado');

        } else if (newStep === 'REGISTER_PRE_OFFERT' || newStep === 'REGISTER_ACCEPTED_OFFERT') {
            const offertResponse = await provider.from('offerts').upsert({
                id: chat.id,
                chat_id: chat.id,
                startRange: parseInt(String(data.startRange)),
                endRange: parseInt(String(data.endRange)),
                detail: data.detail ?? '',
                accepted: newStep === 'REGISTER_ACCEPTED_OFFERT',
            });

            if (offertResponse.error) {
                logger.error('offert_create_failed', 'Fallo creando pre-oferta', { error: offertResponse.error });
                throw new Error('Error creating pre-offert');
            }

            logger.ok('pre_offert_saved', 'Pre-oferta registrada', { data });
        }
    }
    logger.debug('assistant_payload', 'Payload assistant', { response: assistantResponse });


    sendMessageAction({
        to: phoneNumber,
        message: String(assistantResponse.response['message'] || 'NO_VALUE'),
    });
    logger.ok('message_sent', 'Mensaje enviado al usuario');
};
