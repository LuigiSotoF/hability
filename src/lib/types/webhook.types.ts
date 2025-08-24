export interface TextMessage {
    conversation: string;
}

export interface ImageMessage {
    imageMessage: {
        url: string;
    },
    base64: string;
}

export interface DocumentMessage {
    documentMessage: {
        url: string;
        mimetype: string;
    },
    base64: string;
}

export interface AudioMessage {
    audioMessage: {
        url: string;
    },
    base64: string;
}

export interface VideoMessage {
    videoMessage: {
        url: string;
        mimetype: string;
    },
    base64: string;
}

export interface MessageProviderWebhookPayload {
    event: "messages.upsert" | string;
    data: {
        key: {
            remoteJid: string;
        }
        message: TextMessage | ImageMessage | DocumentMessage | AudioMessage | VideoMessage;
    }
}