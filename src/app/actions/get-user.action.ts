import { createServerDBProvider } from "@/lib/providers/db.provider";
import { GetUsersInput, GetUsersOutput } from "../../lib/types/cases/get-users";
import { User } from "../../lib/types/user.types";

export const getUsersAction = async (input: GetUsersInput): Promise<GetUsersOutput> => {
    const dbProvider = await createServerDBProvider();
    const users = await dbProvider.from('users').select('*').limit(500);
    return {
        data: users.data as User[],
        isOk: true,
    };
};
