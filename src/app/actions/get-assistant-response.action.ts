import { getIAProvider } from "@/lib/providers/ia.provider";
import { GetChatsInput, GetChatsOutput } from "../../lib/types/cases/get-chats";
import { Chat, CHAT_STATUS, Messages } from "../../lib/types/chat.types";
import { AudioMessage, ImageMessage, TextMessage, DocumentMessage, VideoMessage } from "@/lib/types/webhook.types";
import { MAIN_ASSISTANT_PROMPT } from "@/lib/constants";
import { ResponseInput, ResponseInputContent } from "openai/resources/responses/responses.js";
import { getExtensionByMimetipe, getMimetypeByExtension, getUniqueUUID, stripB64Prefix } from "@/lib/utils";
import { toFile } from "openai/uploads";
import { createServerDBProvider } from "@/lib/providers/db.provider";
import { useVideosService } from "@/lib/services/videos.service";
import { createLogger } from "@/lib/logger";


export const getAssistantResponseAction = async (input: {
    threadId?: string;
    houseId?: string;
    message: TextMessage | ImageMessage | DocumentMessage | AudioMessage | VideoMessage;
    chatStatus: CHAT_STATUS,
}): Promise<{
    threadId: string;
    response: Record<string, any>;
}> => {
    try {
        const logger = createLogger({ flow: 'action:getAssistantResponse', correlationId: input.threadId });
        const videoService = useVideosService();
        const provider = getIAProvider();
        const dbProvider = await createServerDBProvider();

        if (!input.threadId) {
            logger.step('new_thread');
            const thread = await provider.conversations.create({});
            input.threadId = thread.id;

            const responsesResult = await provider.responses.create({
                model: "gpt-5-mini",
                conversation: input.threadId,
                store: true,
                instructions: MAIN_ASSISTANT_PROMPT,
                input: [
                    {
                        role: "user",
                        content: [
                            { type: "input_text", text: (input.message as TextMessage)?.conversation ?? 'Hola' }
                        ]
                    }
                ]
            });

            logger.ok('assistant_responded', 'Assistant respondio en nuevo thread');
            return {
                threadId: input.threadId,
                response: JSON.parse(responsesResult.output_text),
            }
        }

        let messageBuilder: ResponseInput;
        if (input.message && (input.message as TextMessage)?.conversation) {
            logger.step('build_message_text');
            messageBuilder = [{
                role: "user",
                content: [{ type: "input_text", text: (input.message as TextMessage).conversation }]
            }];
        } else if (input.message && (input.message as ImageMessage)?.imageMessage) {
            logger.step('build_message_image');
            const content = (input.message as ImageMessage);

            const buffer = Buffer.from(stripB64Prefix(content.base64), "base64");
            const uploadedFile = await provider.files.create({
                file: await toFile(buffer, 'image.jpeg', {
                    type: 'image/jpeg',
                }),
                purpose: 'vision',
            });

            messageBuilder = [{
                role: 'user',
                content: [{
                    type: "input_image",
                    file_id: uploadedFile.id,
                    detail: "auto",
                }]
            }]

        } else if (input.message && (input.message as DocumentMessage)?.documentMessage) {
            logger.step('build_message_document');
            const content = (input.message as DocumentMessage);

            const mime = content.documentMessage.mimetype ?? 'application/octet-stream';
            const ext = getExtensionByMimetipe(mime);
            const safeExt = ext.startsWith('.') ? ext : `.${ext}`;
            const fileName = `document${safeExt}`;
            const buffer = Buffer.from(stripB64Prefix(content.base64), 'base64');
            const uploadedFile = await provider.files.create({
                file: await toFile(buffer, fileName, { type: mime }),
                purpose: 'user_data',
            });

            messageBuilder = [{
                role: 'user',
                content: [{
                    type: "input_file",
                    file_id: uploadedFile.id,
                }]
            }]
        } else if (input.message && (input.message as VideoMessage).videoMessage) {
            if (input.chatStatus !== 'REGISTER_USER_DATA') {
                logger.warn('unexpected_video', 'Video enviado en etapa incorrecta', { status: input.chatStatus });
                messageBuilder = [{
                    role: 'system',
                    content: [{
                        type: 'input_text',
                        text: 'El usuario ha compartido un video pero no lo ha compartido en el momento adecuado, por lo tanto debes responder que no puede procesar el video en esta etapa y que primero debe completar los demas pasos.'
                    }]
                }]
            } else {
                logger.step('build_message_video_upload_start');
                const content = (input.message as VideoMessage);
                const fileExtension = getExtensionByMimetipe(content.videoMessage.mimetype);
                const mime = getMimetypeByExtension(fileExtension);
                const fileName = 'video' + fileExtension;
                const buffer = Buffer.from(stripB64Prefix(content.base64), 'base64');
                const destinationPath = getUniqueUUID() + '/' + fileName;
                await dbProvider.storage.from('uploads').upload(
                    destinationPath,
                    buffer,
                    {
                        contentType: mime,
                    }
                );
                const uploadSignedUrl = await dbProvider.storage.from('uploads').createSignedUrl(destinationPath, 10000);
                const chat = await dbProvider.from('chats').select('*').eq('conversation_id', input.threadId).single();
                logger.ok('video_uploaded', 'Video cargado y URL firmada generada');
                videoService.processVideoFrames({
                    videoUrl: uploadSignedUrl.data?.signedUrl ?? '',
                    conversationId: chat.data.conversation_id,
                });
                logger.info('video_processing_enqueued', 'Procesamiento de video encolado');

                messageBuilder = [{
                    role: 'system',
                    content: [{
                        type: 'input_text',
                        text: 'El usuario ha enviado un video y se encuentra siendo procesado, este es el estado actual y solo cambiará cuando se agreguen mas mensajes por parte del system, por ahora las respuestas deben indicar que el procedimiento sigue en proceso y que tomara maximo 5 minutos.'
                    }]
                }]
            }
        } else {
            logger.warn('unsupported_message', 'Archivo incorrecto recibido');
            messageBuilder = [{
                role: 'system',
                content: [{
                    type: 'input_text',
                    text: 'El usuario ha enviado un archivo incorrecto y debe reenviarlo.'
                }]
            }]
        }

        const responsesResult = await provider.responses.create({
            model: "gpt-5-mini",
            conversation: input.threadId,
            store: true,
            instructions: MAIN_ASSISTANT_PROMPT,
            input: messageBuilder,
        })
        logger.ok('assistant_responded', 'Assistant respondio');
        return {
            threadId: input.threadId,
            response: JSON.parse(responsesResult.output_text),
        }
    } catch (error) {
        const logger = createLogger({ flow: 'action:getAssistantResponse' });
        logger.error('unhandled_exception', 'Error al obtener respuesta del assistant', { error: (error as any)?.error ?? JSON.stringify(error) });
        throw error;
    }
};
