import deepResearch from "../interceptors/deep-research.interceptor";
import { GetChatsOutput } from "../types/cases/get-chats"

export const useDeepResearchService = () => {

    const makeDeepResearch = (input: {
        prompt: string;
        conversationId: string;
        houseId: string;
    }): Promise<GetChatsOutput> => {
        return deepResearch.post('/deep-research/enqueue', {
            prompt: input.prompt,
            callbackUrl: process.env.APP_URL + '/api/webhook/deep-research-result' + '?conversationId=' + input.conversationId + '&houseId=' + input.houseId,
        });
    }

    return {
        makeDeepResearch,
    }
}