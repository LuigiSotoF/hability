export interface Offert {
    id: string;
    chat_id: string;
    created_at: string; // ISO string
    startRange: number;
    endRange: number;
    accepted: boolean;
    detail?: string;
}