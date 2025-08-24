import axios from "axios";

// Crear instancia axios
const evolutionInterceptor = axios.create({
    baseURL: "http://45.55.162.127:8080",
    headers: {
        "apikey": "086222D76C5E-46B1-8254-7974FE706EDD",
        "Content-Type": "application/json",
    },
});

// Interceptor para requests (antes de enviar)
evolutionInterceptor.interceptors.request.use((config) => {
    return config;
});

// Interceptor para responses
evolutionInterceptor.interceptors.response.use(
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

export default evolutionInterceptor;