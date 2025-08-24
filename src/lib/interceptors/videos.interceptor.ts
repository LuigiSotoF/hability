import axios from "axios";

// Crear instancia axios
const videosInterceptor = axios.create({
    baseURL: "https://ctls.onrender.com",
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para requests (antes de enviar)
videosInterceptor.interceptors.request.use((config) => {
    return config;
});

// Interceptor para responses
videosInterceptor.interceptors.response.use(
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

export default videosInterceptor;