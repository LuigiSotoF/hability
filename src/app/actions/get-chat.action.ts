import { GetChatsInput, GetChatsOutput } from "../../lib/types/cases/get-chats";
import { Chat, Messages } from "../../lib/types/chat.types";

export const getChatsAction = async (input: GetChatsInput): Promise<GetChatsOutput> => {
    const dummyChats: Chat[] = [
        {
            id: "chat1",
            user_id: "user1",
            created_at: new Date(),
            status: "INITIAL",
            messages: [
                {
                    id: "msg1",
                    chat_id: "chat1",
                    created_at: new Date(),
                    side: "USER",
                    content: "Hello!",
                },
            ],
        },
    ];
    return {
        data: dummyChats,
        isOk: true,
    };
};
