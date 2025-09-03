"use server";

import { createServerDBProvider } from "@/lib/providers/db.provider";
import { Offert } from "@/lib/types/offert.types";

export type GetOffertsInput = { page: number; limit: number };
export type GetOffertsOutput = { isOk: true; data: Offert[] } | { isOk: false; error: string };

export const getOffertsAction = async (input: GetOffertsInput): Promise<GetOffertsOutput> => {
    try {
        const dbProvider = await createServerDBProvider();
        const { data, error } = await dbProvider
            .from('offerts')
            .select('id, chat_id, created_at, startRange, endRange, accepted, detail')
            .order('created_at', { ascending: false })
            .limit(500);
        if (error) {
            return { isOk: false, error: error.message };
        }
        const plain: Offert[] = (data ?? []).map((o: any) => ({
            id: o.id,
            chat_id: o.chat_id,
            created_at: o.created_at ? new Date(o.created_at).toISOString() : '',
            startRange: Number(o.startRange),
            endRange: Number(o.endRange),
            accepted: Boolean(o.accepted),
            detail: o.detail ?? undefined,
        }));
        const payload = { isOk: true as const, data: plain };
        return JSON.parse(JSON.stringify(payload));
    } catch (e: any) {
        return { isOk: false, error: e?.message ?? 'Unknown error' };
    }
}


