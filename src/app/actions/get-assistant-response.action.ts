import { getIAProvider } from "@/lib/providers/ia.provider";
import { GetChatsInput, GetChatsOutput } from "../../lib/types/cases/get-chats";
import { Chat, Messages } from "../../lib/types/chat.types";
import { AudioMessage, ImageMessage, TextMessage, DocumentMessage, VideoMessage } from "@/lib/types/webhook.types";
import { MAIN_ASSISTANT_PROMPT } from "@/lib/constants";
import { ResponseInputContent } from "openai/resources/responses/responses.js";
import { getExtensionByMimetipe, getMimetypeByExtension, stripB64Prefix } from "@/lib/utils";
import { toFile } from "openai/uploads";


export const getAssistantResponseAction = async (input: {
    threadId?: string;
    message: TextMessage | ImageMessage | DocumentMessage | AudioMessage | VideoMessage;
}): Promise<{
    threadId: string;
    response: Record<string, any>;
}> => {
    try {
        const provider = getIAProvider();

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

        let messageBuilder: ResponseInputContent;
        if (input.message && (input.message as TextMessage)?.conversation) {
            messageBuilder = { type: "input_text", text: (input.message as TextMessage).conversation };
        } else if (input.message && (input.message as ImageMessage)?.imageMessage) {
            const content = (input.message as ImageMessage);

            const buffer = Buffer.from(stripB64Prefix(content.base64), "base64");
            const uploadedFile = await provider.files.create({
                file: await toFile(buffer, 'image.jpeg', {
                    type: 'image/jpeg',
                }),
                purpose: 'vision',
            });

            messageBuilder = {
                type: "input_image",
                file_id: uploadedFile.id,
                detail: "auto",
            }

        } else if (input.message && (input.message as DocumentMessage)?.documentMessage) {
            const content = (input.message as DocumentMessage);

            const mime = content.documentMessage.mimetype ?? 'application/octet-stream';
            const ext = getExtensionByMimetipe(mime);
            const safeExt = ext.startsWith('.') ? ext : `.${ext}`;
            const fileName = `document${safeExt}`;

            // 3) Decodifica el base64 a bytes
            const buffer = Buffer.from(stripB64Prefix(content.base64), 'base64');

            const uploadedFile = await provider.files.create({
                file: await toFile(buffer, fileName, { type: mime }),
                purpose: 'user_data',
            });

            messageBuilder = {
                type: "input_file",
                file_id: uploadedFile.id,
            };
        } else if (input.message && (input.message as VideoMessage).videoMessage) {
            const content = (input.message as VideoMessage);
            const fileExtension = getExtensionByMimetipe(content.videoMessage.mimetype);
            const mime = getMimetypeByExtension(fileExtension);
            const fileName = 'video' + fileExtension;

            const buffer = Buffer.from(stripB64Prefix(content.base64), 'base64');

            const uploadedFile = await provider.files.create({
                file: await toFile(buffer, fileName, { type: mime }),
                purpose: 'vision',
            });

            messageBuilder = {
                type: 'input_image',
                file_id: uploadedFile.id,
                detail: 'auto',
            }
        } else {
            messageBuilder = { type: "input_text", text: "System: el usuario ha enviado un tipo de archivo no soportado.", };
        }

        const responsesResult = await provider.responses.create({
            model: "gpt-5",
            conversation: input.threadId,
            store: true,
            instructions: MAIN_ASSISTANT_PROMPT,
            input: [
                {
                    role: "user",
                    content: [messageBuilder]
                }
            ]
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
