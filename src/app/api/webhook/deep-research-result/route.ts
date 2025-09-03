import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120; // segundos
import { DeepResearchProviderWebhookPayload, MessageProviderWebhookPayload } from '@/lib/types/webhook.types';
import { addDeepResearchResultAction } from '@/app/actions/add-deep-research-result.action';
import { createLogger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get("conversationId") ?? '';
        const payload = await req.json() as DeepResearchProviderWebhookPayload;
        const logger = createLogger({ flow: 'webhook:deep-research-result', correlationId: conversationId });
        logger.step('webhook_received', { conversationId, hasContent: !!payload.content });


        logger.ok('dispatch_process', 'Delegando a addDeepResearchResultAction');
        addDeepResearchResultAction({
            conversationId,
            content: payload.content,
        });

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        const logger = createLogger({ flow: 'webhook:deep-research-result' });
        logger.error('unhandled_exception', 'Error procesando el webhook', { error: (error as any)?.message || error });
        return NextResponse.json({ status: 'error', error: (error instanceof Error ? error.message : 'Unknown error') }, { status: 400 });
    }
}
