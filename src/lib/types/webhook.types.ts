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
    },
    base64: string;
}

export interface AudioMessage {
    audioMessage: {
        url: string;
    },
    base64: string;
}

export interface MessageProviderWebhookPayload {
    event: "messages.upsert" | string;
    data: {
        key: {
            remoteJid: string;
        }
        message: TextMessage | ImageMessage | DocumentMessage | AudioMessage;
    }
}