import evolutionInterceptor from "@/lib/interceptors/evolution.interceptor";

export const sendMessageAction = async (input: {
    to: string;
    message: string;
}): Promise<boolean> => {
    const response = await evolutionInterceptor.post('/message/sendText/Melo', {
        number: input.to,
        text: input.message,
    });

    console.log('SendToWhatsapp => ', input);

    return !!response.data;
};
