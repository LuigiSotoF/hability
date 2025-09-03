"use server";
import { createServerDBProvider } from "@/lib/providers/db.provider";
import { GetHousesInput, GetHousesOutput } from "../../lib/types/cases/get-houses";
import { House } from "../../lib/types/house.types";

export const getHousesAction = async (input: GetHousesInput): Promise<GetHousesOutput> => {
    const dbProvider = await createServerDBProvider();
    const houses = await dbProvider.from('houses').select('id, created_at, rooms, mts, address, city, strate, ceilingScore, floorScore, finishedScore, user_id, chat_id').limit(500);
    const plain = (houses.data ?? []).map((h: any) => ({
        id: h.id,
        created_at: h.created_at ? new Date(h.created_at).toISOString() : '',
        rooms: Number(h.rooms),
        mts: Number(h.mts),
        address: h.address,
        city: h.city,
        strate: Number(h.strate),
        ceilingScore: Number(h.ceilingScore),
        floorScore: Number(h.floorScore),
        finishedScore: Number(h.finishedScore),
        user_id: h.user_id ?? null,
        chat_id: h.chat_id,
    })) as House[]

    const payload = { data: plain as unknown as House[], isOk: true as const }
    return JSON.parse(JSON.stringify(payload));
};
