import deepResearch from "../interceptors/deep-research.interceptor";
import { createLogger } from "../logger";

export const useDeepResearchService = () => {

    const makeDeepResearch = (input: {
        prompt: string;
        conversationId: string;
    }): Promise<any> => {
        const logger = createLogger({ flow: 'service:deepResearch', correlationId: input.conversationId });
        logger.step('enqueue_start');
        const res = deepResearch.post('/deep-research/enqueue', {
            prompt: input.prompt,
            callbackUrl: process.env.APP_URL + '/api/webhook/deep-research-result' + '?conversationId=' + input.conversationId,
        });
        logger.ok('enqueue_ok');
        return res;
    }

    return {
        makeDeepResearch,
    }
}