import { ResponseWrapper } from "../generics.types";
import { House } from "../house.types";

export type GetHousesInput = {
    page: number;
    limit: number;
}

export type GetHousesOutput = ResponseWrapper<House[]>;