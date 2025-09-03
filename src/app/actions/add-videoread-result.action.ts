import { MAIN_ASSISTANT_PROMPT, MAIN_ASSISTANT_PROMPT_VIDEO_READ } from "@/lib/constants";
import { createServerDBProvider } from "@/lib/providers/db.provider";
import { getIAProvider } from "@/lib/providers/ia.provider";
import { sendMessageAction } from "./send-message-action";
import { createLogger } from "@/lib/logger";

export const addVideoReadResultAction = async (input: {
    conversationId: string;
    fileIds: string[];
}): Promise<void> => {
    const logger = createLogger({ flow: 'action:addVideoReadResult', correlationId: input.conversationId });
    const provider = await createServerDBProvider();
    const iaProvider = getIAProvider();

    logger.step('vision_response_start', { files: input.fileIds?.length || 0 });
    const responsesResult = await iaProvider.responses.create({
        model: "gpt-5",
        instructions: MAIN_ASSISTANT_PROMPT_VIDEO_READ,
        input: [
            {
                role: 'user',
                content: input.fileIds.map(element => {
                    return {
                        type: 'input_image',
                        file_id: element,
                        detail: 'high',
                    }
                })
            },
        ],
    });
    logger.ok('vision_response_ok', 'Respuesta vision recibida');


    const assistantResponse = await iaProvider.responses.create({
        model: "gpt-5-mini",
        conversation: input.conversationId,
        store: true,
        instructions: MAIN_ASSISTANT_PROMPT,
        input: [
            {
                role: 'system',
                content: [
                    {
                        type: 'input_text',
                        text: `El proceso de validacion de video ha sido terminado y las caracteristicas del inmueble detectadas han sido agregadas en este chat en un mensaje del rol system.`,
                    },
                    {
                        type: 'input_text',
                        text: responsesResult.output_text,
                    },
                    {
                        type: 'input_text',
                        text: `Procede a validar la informacion del inmueble y responder con el action correspondiente.`,
                    }
                ]
            }
        ]
    });

    const chat = await provider.from('chats').select('*').eq('conversation_id', input.conversationId).single();
    const user = await provider.from('users').select('*').eq('id', chat.data.user_id).single();
    logger.ok('assistant_response_ok', 'Assistant respondio tras vision');
    const data = JSON.parse(assistantResponse.output_text);

    await provider.from('messages').insert({
        side: 'ASSISTANT',
        content: String(data['message'] || 'Tuvimos un problema, intenta nuevamente'),
        chat_id: chat.data.id,
    });

    sendMessageAction({
        to: user.data.phone || user.data.phoneNumber,
        message: String(data['message'] || 'NO_VALUE'),
    });
    logger.ok('message_sent', 'Mensaje enviado al usuario');
};
