import { GetUsersInput, GetUsersOutput } from "../../lib/types/cases/get-users";
import { User } from "../../lib/types/user.types";

export const getUsersAction = async (input: GetUsersInput): Promise<GetUsersOutput> => {
    const dummyUsers: User[] = [
        {
            id: "user1",
            created_at: new Date(),
            full_name: "John Doe",
            phone: "1234567890",
            chats: [],
        },
    ];
    return {
        data: dummyUsers,
        isOk: true,
    };
};
