'use server';

import { MessageProviderWebhookPayload, TextMessage } from "@/lib/types/webhook.types";
import { createServerDBProvider } from "@/lib/providers/db.provider";
import { getDeepResearchPrompt, getUniqueUUID } from "@/lib/utils";
import { createChatAction } from "./create-chat.action";
import { getAssistantResponseAction } from "./get-assistant-response.action";
import { CHAT_STATUS, Messages } from "@/lib/types/chat.types";
import { sendMessageAction } from "./send-message-action";
import { useDeepResearchService } from "@/lib/services/deep-research.service";

export const processMessageAction = async (input: MessageProviderWebhookPayload): Promise<void> => {
    const provider = await createServerDBProvider();
    const deepResearchService = useDeepResearchService();
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

    const data = assistantResponse.response.data;
    if (newStep) {
        await provider.from('chats').update({ status: newStep }).eq('id', prevChat.id);

        if (newStep === 'HOUSE_RECOGNITION') {
            await provider.from('users').update({
                full_name: data.fullName ?? '',
                dni: data.dni ?? '',
            }).eq('id', prevChat.user_id).single();
        }

        // En este momento, si se settea newStep en este estado significa que
        // ya paso el estado anterior: USER_RECOGNITION, por lo tanto ya tenemos informacion para
        // el deep research
        if (newStep === 'HOUSE_VIDEO_READING') {

            const houseId = getUniqueUUID();
            const houseResponse = await provider.from('house').insert({
                id: houseId,
                user_id: prevChat.user_id,
                chat_id: prevChat.id,
                address: data.address ?? '',
                city: data.city ?? 'BOGOTA',
                latitude: 0,
                longitude: 0,
                security_score: 0,
                investment_score: 0,
                infracstrucute_score: 0,
                around_price_estimated: 0,
                mts_estimated: 0,
                humidity_score: 0,
                recent_seismic_events: false,
                ceiling_score: 0,
                floor_score: 0,
                finishes_score: 0,
                bethrooms: 0,
                other_spaces: "",
                facade_score: 0,
                plugs_score: 0,
                special_structures: "",
                stratum: data.strate ?? 3,
                mts: 0,
            });

            console.log('hhouse response =>', JSON.stringify(houseResponse.error));


            await provider.from('chats').update({
                house_id: houseId,
            }).eq('id', prevChat.id);

            await deepResearchService.makeDeepResearch({
                conversationId: prevChat.conversation_id,
                houseId,
                prompt: getDeepResearchPrompt(data.address ?? '', data.city ?? 'BOGOTA', data.strate ?? '3'),
            });

        } else if (newStep === 'HOUSE_VERIFICATION_VALUES') {
            const houseDetails = data.houseDetails;

            await provider.from('house').update({
                "ceiling_score": houseDetails.ceilingScore ?? 0,
                "floor_score": houseDetails.floorScore ?? 0,
                "finishes_score": houseDetails.finishedScore,
                "bethrooms": Array.from(houseDetails.bethrooms).length,
                "other_spaces": houseDetails.otherSpaces,
                "facade_score": houseDetails.facadeScore,
                "plugs_score": houseDetails.plugsScore,
                "special_structures": houseDetails.specialStructures,
                "mts": houseDetails.estimatedAreaM2,
            }).eq('id', prevChat.house_id)
                .single();
        }
    } else if (newStep === 'FINAL' && data.startRange) {
        await provider.from('offert').insert({
            "start_price": parseInt(data.startRange),
            "end_range": parseInt(data.endRange),
            "chat_id": prevChat.id,
        });
    }

    console.log({
        assistantResponse: JSON.stringify(assistantResponse, null, 2),
    });


    sendMessageAction({
        to: phoneNumber,
        message: String(assistantResponse.response['message'] || 'NO_VALUE'),
    });
};
