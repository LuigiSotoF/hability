import { NextRequest, NextResponse } from 'next/server';
import { VideoProviderWebhookPayload } from '@/lib/types/webhook.types';
import { addVideoReadResultAction } from '@/app/actions/add-videoread-result.action';

export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get("chatId") ?? '';
        const houseId = searchParams.get("houseId") ?? '';
        const payload = await req.json() as VideoProviderWebhookPayload;

        console.log("Entry to deepresearch flow webhook", {
            conversationId,
            fileIds: payload.openai_file_ids,
            houseId,
        });


        addVideoReadResultAction({
            conversationId,
            fileIds: payload.openai_file_ids,
            houseId,
        });

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Error procesando el webhook:', error);
        return NextResponse.json({ status: 'error', error: (error instanceof Error ? error.message : 'Unknown error') }, { status: 400 });
    }
}
