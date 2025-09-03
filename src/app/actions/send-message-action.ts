import evolutionInterceptor from "@/lib/interceptors/evolution.interceptor";
import { createLogger } from "@/lib/logger";

export const sendMessageAction = async (input: {
    to: string;
    message: string;
}): Promise<boolean> => {
    const logger = createLogger({ flow: 'action:sendMessage', correlationId: input.to });
    logger.step('send_start', { to: input.to });
    const response = await evolutionInterceptor.post('/message/sendText/Melo', {
        number: input.to,
        text: input.message,
    });
    logger.ok('send_ok', 'Mensaje enviado', { status: response.status });
    return !!response.data;
};
