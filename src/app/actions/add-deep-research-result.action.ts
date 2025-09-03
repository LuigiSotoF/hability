import { MAIN_ASSISTANT_PROMPT } from "@/lib/constants";
import { createServerDBProvider } from "@/lib/providers/db.provider";
import { getIAProvider } from "@/lib/providers/ia.provider";
import { sendMessageAction } from "./send-message-action";

export const addDeepResearchResultAction = async (input: {
    conversationId: string;
    content: string;
}): Promise<void> => {
    const provider = await createServerDBProvider();
    const iaProvider = getIAProvider();

    const responsesResult = await iaProvider.responses.create({
        model: "gpt-5-mini",
        conversation: input.conversationId,
        store: true,
        instructions: MAIN_ASSISTANT_PROMPT,
        input: [
            {
                role: 'system',
                content: [{
                    type: 'input_text',
                    text: `
                        Te envio el "INFORME DE BUSQUEDA PROFUNDA", responde de acuerdo a los criterios definidos anteriormente 

                        ## INFORME DE BUSQUEDA PROFUNDA
                        ${input.content}
                    `,
                }, {
                    type: 'input_text',
                    text: `
                        Procede a calcular la oferta para el usuario segun los criterios de tu prompt.
                    `,
                }]
            }
        ],
    });

    const data = JSON.parse(responsesResult.output_text);
    const chat = await provider.from('chats').select('*').eq('conversation_id', input.conversationId).single();
    const user = await provider.from('users').select('*').eq('id', chat.data.user_id).single();

    await provider.from('messages').insert({
        side: 'ASSISTANT',
        content: String(data['message'] || 'Tuvimos un problema, intenta nuevamente'),
        chat_id: chat.data.id,
    });

    sendMessageAction({
        to: user.data.phoneNumber,
        message: String(data['message'] || 'Tuvimos un problema, intenta nuevamente'),
    });
};
