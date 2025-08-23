interface TextMessage {
    conversation: string;
}

interface ImageMessage {
    imageMessage: {
        url: string;
    },
    base64: string;
}

interface DocumentMessage {
    documentMessage: {
        url: string;
    },
    base64: string;
}

interface AudioMessage {
    audioMessage: {
        url: string;
    },
    base64: string;
}

export interface MessageProviderWebhookPayload {
    event: "messages.upsert" | string;
    data: {
        sender: string;
        message: TextMessage | ImageMessage | DocumentMessage | AudioMessage;
    }
  }