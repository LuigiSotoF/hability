import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // segundos
import { MessageProviderWebhookPayload } from '@/lib/types/webhook.types';
import { processMessageAction } from '@/app/actions/process-message.action';
import { createLogger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json() as MessageProviderWebhookPayload;
        const phoneNumber = (payload.data.key.remoteJid || '').split('@')[0];
        const logger = createLogger({ flow: 'webhook:messages-upsert', correlationId: phoneNumber });

        logger.step('webhook_received', { event: payload.event });

        if (
            (payload as any).data.message.senderKeyDistributionMessage || !payload.data.key.remoteJid.includes('3012414878')
        ) {
            logger.info('ignored_message', 'Mensaje de otro grupo o tipo no soportado', {
                remoteJid: payload.data.key.remoteJid,
            });

            return NextResponse.json({ status: 'ok' });;
        }
        logger.ok('dispatch_process', 'Delegando a processMessageAction');
        processMessageAction(payload);
        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        const logger = createLogger({ flow: 'webhook:messages-upsert' });
        logger.error('unhandled_exception', 'Error procesando el webhook', { error: (error as any)?.message || error });
        return NextResponse.json({ status: 'error', error: (error instanceof Error ? error.message : 'Unknown error') }, { status: 400 });
    }
}
