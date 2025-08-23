import { getUsersAction } from "@/app/actions/get-user.action"
import { GetUsersInput, GetUsersOutput } from "../types/cases/get-users"

export const useUsersService = ()=> {

    const getUsers = (input: GetUsersInput) : Promise<GetUsersOutput> => {
        return getUsersAction(input)
    }

    return {
        getUsers,
    }
}