import { House } from "./house.types";
import { Offert } from "./offert.types";

export type CHAT_STATUS = "INITIAL" | "USER_RECOGNITION" | "HOUSE_RECOGNITION" | "HOUSE_VIDEO_READING" | "HOUSE_VERIFICATION_VALUES" | "CALCULING_PRICE" | "OFFERT" | 'FINAL';
export interface Chat {
    id: string;
    user_id: string;
    created_at: Date;
    status: CHAT_STATUS;
    messages: Messages[];
    house?: House;
    offert?: Offert;
}

export type MESSAGE_SIDE = "USER" | "ASSISTANT";
export interface Messages {
    id: string;
    chat_id: string;
    created_at: Date;
    side: MESSAGE_SIDE;
    action?: string;
    content: string;
}