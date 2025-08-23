import { getHousesAction } from "@/app/actions/get-houses.action"
import { GetHousesInput, GetHousesOutput } from "../types/cases/get-houses"

export const useHouseService = ()=> {

    const getHouses = (input: GetHousesInput) : Promise<GetHousesOutput> => {
        return getHousesAction(input)
    }

    return {
        getHouses,
    }
}