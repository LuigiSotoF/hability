import OpenAI from "openai"

export const getIAProvider = () => {
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
}