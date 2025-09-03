export interface House {
    id: string;
    created_at: string; // ISO string para compatibilidad con Client Components
    rooms: number;
    mts: number;
    address: string;
    city: string;
    strate: number;
    ceilingScore: number;
    floorScore: number;
    finishedScore: number;
    user_id: string | null;
    chat_id: string;
}