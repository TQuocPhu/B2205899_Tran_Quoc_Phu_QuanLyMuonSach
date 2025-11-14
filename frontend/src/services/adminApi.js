import axios from "axios";
import { useAdminStore } from "@/stores/admin.store";

const adminApi = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: { "Content-Type": "application/json" },
});

adminApi.interceptors.request.use((config) => {
    const adminStore = useAdminStore();
    if (adminStore.token) {
        config.headers.Authorization = `Bearer ${adminStore.token}`;
    }
    return config;
});

export default adminApi;
