import { Chat } from "../chat.types";
import { ResponseWrapper } from "../generics.types";

export type GetChatsInput = {
    page: number;
    limit: number;
}

export type GetChatsOutput = ResponseWrapper<Chat[]> 