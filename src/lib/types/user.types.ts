import { Chat } from "./chat.types";

export interface User {
    id: string;
    created_at: Date;
    fullName: string;
    phoneNumber: string;
}