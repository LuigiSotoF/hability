import videosInterceptor from "../interceptors/videos.interceptor";
import { GetChatsInput } from "../types/cases/get-chats"
import { createLogger } from "../logger";

export const useVideosService = () => {

    const processVideoFrames = (input: {
        videoUrl: string;
        conversationId: string;
    }): Promise<any> => {
        const logger = createLogger({ flow: 'service:videos', correlationId: input.conversationId });
        logger.step('enqueue_start', { videoUrl: input.videoUrl });
        const res = videosInterceptor.post('/video-extractor/enqueue', {
            videoUrl: input.videoUrl,
            callbackUrl: process.env.APP_URL + '/api/webhook/video-upload-result' + '?conversationId=' + input.conversationId,
            "options": {
                "fps": 1.1,
                "maxThumbnails": 230,
            }
        });
        logger.ok('enqueue_ok');
        return res;
    }

    return {
        processVideoFrames,
    }
}