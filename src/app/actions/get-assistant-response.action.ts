import { getIAProvider } from "@/lib/providers/ia.provider";
import { GetChatsInput, GetChatsOutput } from "../../lib/types/cases/get-chats";
import { Chat, Messages } from "../../lib/types/chat.types";
import { AudioMessage, ImageMessage, TextMessage, DocumentMessage, VideoMessage } from "@/lib/types/webhook.types";
import { MAIN_ASSISTANT_PROMPT } from "@/lib/constants";
import { ResponseInput, ResponseInputContent } from "openai/resources/responses/responses.js";
import { getExtensionByMimetipe, getMimetypeByExtension, getUniqueUUID, stripB64Prefix } from "@/lib/utils";
import { toFile } from "openai/uploads";
import { createServerDBProvider } from "@/lib/providers/db.provider";
import { useVideosService } from "@/lib/services/videos.service";


export const getAssistantResponseAction = async (input: {
    threadId?: string;
    houseId?: string;
    message: TextMessage | ImageMessage | DocumentMessage | AudioMessage | VideoMessage;
}): Promise<{
    threadId: string;
    response: Record<string, any>;
}> => {
    try {
        const videoService = useVideosService();
        const provider = getIAProvider();
        const dbProvider = await createServerDBProvider();

        if (!input.threadId) {
            const conversationId = await provider.conversations.create({});
            input.threadId = conversationId.id;

            const responsesResult = await provider.responses.create({
                model: "gpt-5",
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

            return {
                threadId: input.threadId,
                response: JSON.parse(responsesResult.output_text),
            }
        }

        let messageBuilder: ResponseInput;
        if (input.message && (input.message as TextMessage)?.conversation) {
            messageBuilder = [{
                role: "user",
                content: [{ type: "input_text", text: (input.message as TextMessage).conversation }]
            }];
        } else if (input.message && (input.message as ImageMessage)?.imageMessage) {
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
            const content = (input.message as VideoMessage);
            const fileExtension = getExtensionByMimetipe(content.videoMessage.mimetype);
            const mime = getMimetypeByExtension(fileExtension);
            const fileName = 'video' + fileExtension;
            const buffer = Buffer.from(stripB64Prefix(content.base64), 'base64');
            const destinationPath = getUniqueUUID() + '/' + fileName;
            const uploadResult = await dbProvider.storage.from('uploads').upload(
                destinationPath,
                buffer,
                {
                    contentType: mime,
                }
            );
            const uploadSignedUrl = await dbProvider.storage.from('uploads').createSignedUrl(destinationPath, 10000);
            const chat = await dbProvider.from('chats').select('*').eq('conversation_id', input.threadId).single();
            videoService.processVideoFrames({
                videoUrl: uploadSignedUrl.data?.signedUrl ?? '',
                chatId: input.threadId,
                houoseId: input.houseId ?? chat.data.house_id ?? 'NO_VALUE',
            });

            messageBuilder = [{
                role: 'system',
                content: [{
                    type: 'input_text',
                    text: 'El usuario ha enviado un video y se encuentra siendo procesado, este es el estado actual y solo cambiará cuando se agreguen mas mensajes por parte del system, por ahora las respuestas deben indicar que el procedimiento sigue en proceso y que tomara maximo 5 minutos.'
                }]
            }]
        } else {
            messageBuilder = [{
                role: 'system',
                content: [{
                    type: 'input_text',
                    text: 'El usuario ha enviado un archivo incorrecto y debe reenviarlo.'
                }]
            }]
        }

        const responsesResult = await provider.responses.create({
            model: "gpt-5",
            conversation: input.threadId,
            store: true,
            instructions: MAIN_ASSISTANT_PROMPT,
            input: messageBuilder,
        })

        return {
            threadId: input.threadId,
            response: JSON.parse(responsesResult.output_text),
        }
    } catch (error) {
        console.log({
            error: (error as any)?.error ?? JSON.stringify(error)
        });
        throw error;
    }
};
