import { ResponseWrapper } from "../generics.types";
import { User } from "../user.types";

export type GetUsersInput = {
    page: number;
    limit: number;
}

export type GetUsersOutput = ResponseWrapper<User[]>  