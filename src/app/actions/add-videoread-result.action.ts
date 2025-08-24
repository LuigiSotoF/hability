import { MAIN_ASSISTANT_PROMPT } from "@/lib/constants";
import { createServerDBProvider } from "@/lib/providers/db.provider";
import { getIAProvider } from "@/lib/providers/ia.provider";
import { sendMessageAction } from "./send-message-action";

export const addVideoReadResultAction = async (input: {
    conversationId: string;
    fileIds: string[];
    houseId: string;
}): Promise<void> => {
    const provider = await createServerDBProvider();
    const iaProvider = getIAProvider();

    const responsesResult = await iaProvider.responses.create({
        model: "gpt-5",
        conversation: input.conversationId,
        store: true,
        instructions: MAIN_ASSISTANT_PROMPT,
        input: [
            {
                role: 'system',
                content: [
                    {
                        type: 'input_text',
                        text: `
                        Se envian las imagenes correspondientes al video del usuario para mostrar su casa, evalua las imagenes y responde segun los criterios.
                    `,
                    },
                ]
            },
            {
                role: 'user',
                content: input.fileIds.map(element => {
                    return {
                        type: 'input_image',
                        file_id: element,
                        detail: 'auto',
                    }
                })
            },
            {
                role: 'system',
                content: [
                    {
                        type: 'input_text',
                        text: `
                            De a cuerdo al system prompt corrobora los datos con el usuario (HOUSE_VERIFICATION_VALUES)

                            Si detectas en esta etapa que ya todos los pasos fueron ejecutados, inclusive los pasos de la 
                            investigacion entonces procede directamente con la oferta (OFFERT) , responde en tu mensaje con esta sin pausas
                        `,
                    },
                ]
            },
        ],
    });

    const chat = await provider.from('chats').select('*').eq('house_id', input.houseId).single();
    const user = await provider.from('users').select('*').eq('id', chat.data.user_id).single();
    const data = JSON.parse(responsesResult.output_text);

    sendMessageAction({
        to: user.data.phone,
        message: String(data['message'] || 'NO_VALUE'),
    });
};
