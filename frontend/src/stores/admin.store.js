import { defineStore } from "pinia";
import adminApi from "@/services/adminApi";

export const useAdminStore = defineStore("admin", {
    state: () => {
        let admin = null;
        try {
            admin = JSON.parse(localStorage.getItem("admin"));
        } catch (e) {
            admin = null;
        }
        return {
            admin,
            token: localStorage.getItem("adminToken") || null,
        };
    },
    getters: {
        isLoggedIn: (state) => !!state.token,
    },
    actions: {
        async login(credentials) {
            const res = await adminApi.post("/admin/auth/login", credentials);
            this.admin = res.data.admin;
            this.token = res.data.token;
            localStorage.setItem("admin", JSON.stringify(this.admin));
            localStorage.setItem("adminToken", this.token);
        },
        logout() {
            this.admin = null;
            this.token = null;
            localStorage.removeItem("admin");
            localStorage.removeItem("adminToken");
        },
    },
});
