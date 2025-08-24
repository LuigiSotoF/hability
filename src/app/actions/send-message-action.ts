import { createServerDBProvider } from "@/lib/providers/db.provider";
import { CHAT_STATUS, Messages } from "@/lib/types/chat.types";
import { getUniqueUUID } from "@/lib/utils";

export const sendMessageAction = async (input: {
    to: string;
    message: string;
}): Promise<boolean> => {
    const response = await fetch('http://45.55.162.127:8080/message/sendText/Melo', {
        headers: {
            'apikey': '086222D76C5E-46B1-8254-7974FE706EDD',
            'Content-Type': 'application/json',

        },
        method: "POST",
        body: JSON.stringify({
            number: input.to,
            text: input.message,
        }),
    })

    console.log('SendToWhatsapp => ', input);


    return response.status == 200;
};
