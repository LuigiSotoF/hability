import { NextRequest, NextResponse } from 'next/server';
import { MessageProviderWebhookPayload } from '@/lib/types/webhook.types';
import { processMessageAction } from '@/app/actions/process-message.action';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json() as MessageProviderWebhookPayload;

        console.log("Entry to webhook");

        if (
            (payload as any).data.message.senderKeyDistributionMessage
        ) {
            console.log("otros grupos recibidos y anulados");

            return NextResponse.json({ status: 'ok' });;
        }

        if (!payload.data.key.remoteJid.includes('3012414878')) {
            return NextResponse.json({ status: 'ok' });
        }
        // Aquí puedes procesar el payload recibido
        console.log({
            payload: JSON.stringify(payload, null, 2),
        });

        processMessageAction(payload);

        // Responde con éxito
        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Error procesando el webhook:', error);
        return NextResponse.json({ status: 'error', error: (error instanceof Error ? error.message : 'Unknown error') }, { status: 400 });
    }
}
