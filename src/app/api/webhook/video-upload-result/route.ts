import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120; // segundos
import { VideoProviderWebhookPayload } from '@/lib/types/webhook.types';
import { addVideoReadResultAction } from '@/app/actions/add-videoread-result.action';
import { createLogger } from '@/lib/logger';

export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get("conversationId") ?? '';
        const payload = await req.json() as VideoProviderWebhookPayload;

        const logger = createLogger({ flow: 'webhook:video-upload-result', correlationId: conversationId });
        logger.step('webhook_received', { conversationId, fileIdsCount: payload.openai_file_ids?.length || 0 });


        logger.ok('dispatch_process', 'Delegando a addVideoReadResultAction');
        addVideoReadResultAction({
            conversationId,
            fileIds: payload.openai_file_ids,
        });

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        const logger = createLogger({ flow: 'webhook:video-upload-result' });
        logger.error('unhandled_exception', 'Error procesando el webhook', { error: (error as any)?.message || error });
        return NextResponse.json({ status: 'error', error: (error instanceof Error ? error.message : 'Unknown error') }, { status: 400 });
    }
}
