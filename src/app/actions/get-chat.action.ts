import { GetChatsInput, GetChatsOutput } from "../../lib/types/cases/get-chats";
import { Chat, Messages } from "../../lib/types/chat.types";

export const getChatsAction = async (input: GetChatsInput): Promise<GetChatsOutput> => {
    const dummyChats: Chat[] = [
        {
            id: "chat1",
            user_id: "user1",
            created_at: new Date("2025-01-01T10:30:00"),
            status: "INITIAL",
            messages: [
                {
                    id: "msg1",
                    chat_id: "chat1",
                    created_at: new Date("2025-01-01T10:30:00"),
                    side: "USER",
                    content: "Hello!",
                },
            ],
        },
        {
            id: "chat2",
            user_id: "user1",
            created_at: new Date("2025-03-01T14:20:00"),
            status: "CALCULING_PRICE",
            messages: [
                {
                    id: "msg2",
                    chat_id: "chat2",
                    created_at: new Date("2025-03-01T14:20:00"),
                    side: "USER",
                    content: "Hello2!",
                },
            ],
        },
        {
            id: "chat3",
            user_id: "user1",
            created_at: new Date("2025-04-01T09:15:00"),
            status: "OFFERT",
            messages: [
                {
                    id: "msg3",
                    chat_id: "chat3",
                    created_at: new Date("2025-04-01T09:15:00"),
                    side: "USER",
                    content: "Hello3!",
                },
            ],
        },
        {
            id: "chat4",
            user_id: "user1",
            created_at: new Date("2025-08-09T16:45:00"),
            status: "OFFERT",
            messages: [
                {
                    id: "msg4",
                    chat_id: "chat4",
                    created_at: new Date("2025-08-09T16:45:00"),
                    side: "USER",
                    content: "Hello4!",
                },
            ],
        },
        {
            id: "chat5",
            user_id: "user1",
            created_at: new Date("2025-08-03T11:30:00"),
            status: "OFFERT",
            messages: [
                {
                    id: "msg5",
                    chat_id: "chat5",
                    created_at: new Date("2025-08-03T11:30:00"),
                    side: "USER",
                    content: "Hello5!",
                },
            ],
        },
    ];
    return {
        data: dummyChats,
        isOk: true,
    };
};
