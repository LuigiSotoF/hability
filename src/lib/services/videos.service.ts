import videosInterceptor from "../interceptors/videos.interceptor";
import { GetChatsInput, GetChatsOutput } from "../types/cases/get-chats"

export const useVideosService = () => {

    const processVideoFrames = (input: {
        videoUrl: string;
        chatId: string;
        houoseId: string;
    }): Promise<GetChatsOutput> => {
        return videosInterceptor.post('/video-extractor/enqueue', {
            videoUrl: input.videoUrl,
            callbackUrl: process.env.APP_URL + '/api/webhook/video-upload-result' + '?chatId=' + input.chatId + '&houseId=' + input.houoseId,
            "options": {
                "fps": 1.0,
                "maxThumbnails": 180,
            }
        });
    }

    return {
        processVideoFrames,
    }
}