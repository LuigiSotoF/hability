import { NextRequest, NextResponse } from 'next/server';
import { DeepResearchProviderWebhookPayload, MessageProviderWebhookPayload } from '@/lib/types/webhook.types';
import { addDeepResearchResultAction } from '@/app/actions/add-deep-research-result.action';

export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get("conversationId") ?? '';
        const houseId = searchParams.get("houseId") ?? '';
        const payload = await req.json() as DeepResearchProviderWebhookPayload;

        console.log("Entry to deepresearch flow webhook");


        addDeepResearchResultAction({
            conversationId,
            content: payload.content,
            houseId,
        });

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Error procesando el webhook:', error);
        return NextResponse.json({ status: 'error', error: (error instanceof Error ? error.message : 'Unknown error') }, { status: 400 });
    }
}
