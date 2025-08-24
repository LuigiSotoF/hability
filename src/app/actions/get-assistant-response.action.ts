import { getIAProvider } from "@/lib/providers/ia.provider";
import { GetChatsInput, GetChatsOutput } from "../../lib/types/cases/get-chats";
import { Chat, Messages } from "../../lib/types/chat.types";
import { AudioMessage, ImageMessage, TextMessage, DocumentMessage } from "@/lib/types/webhook.types";
import { MAIN_ASSISTANT_PROMPT } from "@/lib/constants";
import { ResponseInputContent } from "openai/resources/responses/responses.js";
import { stripB64Prefix } from "@/lib/utils";
import { toFile } from "openai/uploads";


export const getAssistantResponseAction = async (input: {
    threadId?: string;
    message: TextMessage | ImageMessage | DocumentMessage | AudioMessage;
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
            const uploadedFile = await provider.files.create({
                file: new File([content.base64] as any, 'document.pdf', { type: 'application/pdf' }),
                purpose: 'user_data',
            });

            messageBuilder = {
                type: "input_file",
                file_id: uploadedFile.id,
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
