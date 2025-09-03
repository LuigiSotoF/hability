import axios from "axios";

// Crear instancia axios
const deepResearch = axios.create({
    baseURL: "https://ctls-l1er.onrender.com/",
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para requests (antes de enviar)
deepResearch.interceptors.request.use((config) => {
    return config;
});

// Interceptor para responses
deepResearch.interceptors.response.use(
    (response) => {
        if (response.status !== 200 && response.status !== 201) {
            return Promise.reject(new Error("Failed to send WhatsApp"));
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default deepResearch;