export interface House {
    id: string;
    created_at: Date;
    chat_id: string;
    user_id: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    security_score: number;
    investment_score: number;
    infracstrucute_score: number;
    around_price_estimated: number;
    mts_estimated: number;
    humidity_score: number;
    recent_seismic_events: boolean;
    ceiling_score: string;
    floor_score: string;
    finishes_score: string;
    bethrooms: number;
    other_spaces: string;
    facade_score: number;
    plugs_score: number;
    special_structures: string;
    stratum: number;
}