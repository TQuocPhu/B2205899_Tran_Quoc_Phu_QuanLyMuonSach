// import axios from "axios";
// import { useAuthStore } from "@/stores/auth.store";

// const api = axios.create({
//     baseURL: "http://localhost:3000/api",
//     headers: { "Content-Type": "application/json" },
// });

// api.interceptors.request.use((config) => {
//     const authStore = useAuthStore();
//     if (authStore.token) {
//         config.headers.Authorization = `Bearer ${authStore.token}`;
//     }
//     return config;
// });

// export default api;
import axios from "axios";

// Khởi tạo Axios instance
const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Thêm interceptor gắn token
api.interceptors.request.use(
    (config) => {
        // Lấy token trực tiếp từ localStorage để tránh lỗi khi Pinia chưa active
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Xử lý token hết hạn (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Token không hợp lệ hoặc đã hết hạn. Tự động đăng xuất.");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
