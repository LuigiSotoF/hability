
export type CHAT_STATUS = 'CREATING_RESPONSE' | 'REGISTER_USER_DATA' | 'CHECK_HOUSE_PROPERTIES' | 'REGISTER_HOUSE_DETAILS' | 'REGISTER_PRE_OFFERT' | 'REGISTER_ACCEPTED_OFFERT';
export interface Chat {
    id: string;
    user_id: string;
    created_at: string; // ISO string para compatibilidad con Client Components
    status: CHAT_STATUS;
    messages: Messages[];
}

export type MESSAGE_SIDE = "USER" | "ASSISTANT";
export interface Messages {
    id: string;
    chat_id: string;
    created_at: string; // ISO string
    side: MESSAGE_SIDE;
    action?: string;
    content: string;
}