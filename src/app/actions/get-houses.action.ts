import { GetHousesInput, GetHousesOutput } from "../../lib/types/cases/get-houses";
import { House } from "../../lib/types/house.types";

export const getHousesAction = async (input: GetHousesInput): Promise<GetHousesOutput> => {
    const dummyHouses: House[] = [
        {
            id: "1",
            created_at: new Date(),
            chat_id: "chat1",
            user_id: "user1",
            address: "123 Main St",
            city: "Anytown",
            latitude: 40.7128,
            longitude: -74.0060,
            security_score: 8.5,
            investment_score: 7.2,
            infracstrucute_score: 6.8,
            around_price_estimated: 250000,
            mts_estimated: 120,
            humidity_score: 5.5,
            recent_seismic_events: false,
            ceiling_score: "good",
            floor_score: "excellent",
            finishes_score: "modern",
            bethrooms: 3,
            other_spaces: "garage, garden",
            facade_score: 8.0,
            plugs_score: 7.5,
            special_structures: "solar panels",
            stratum: 3,
        },
    ];
    return {
        data: dummyHouses,
        isOk: true,
    };
};
