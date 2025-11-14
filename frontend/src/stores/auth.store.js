import { defineStore } from "pinia";
import api from "@/services/api.service";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: JSON.parse(localStorage.getItem("user")) || null,
        token: localStorage.getItem("token") || null,
    }),
    getters: {
        isLoggedIn: (state) => !!state.token,
    },
    actions: {
        async login(credentials) {
            const res = await api.post("/auth/login", credentials);
            this.user = res.data.user;
            this.token = res.data.token;
            localStorage.setItem("user", JSON.stringify(this.user));
            localStorage.setItem("token", this.token);
        },
        async register(data) {
            await api.post("/auth/register", data);
        },
        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        },
    },
});
