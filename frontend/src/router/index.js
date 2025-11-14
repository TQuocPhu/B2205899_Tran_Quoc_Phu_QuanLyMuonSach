import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from "@/stores/auth.store";
import { useAdminStore } from "@/stores/admin.store";

// --- User ---
import HomeUser from "@/views/user/HomeUser.vue";
import BorrowingHistory from "@/views/user/BorrowingHistory.vue";
import UserLogin from "@/views/auth/UserLogin.vue";
import UserRegister from "@/views/auth/UserRegister.vue";
import BookDetail from '@/views/user/BookDetail.vue';

// --- Admin ---
import AdminLogin from "@/views/admin/AdminLogin.vue";
import ManageBooks from "@/views/admin/ManageBooks.vue";
import ManagePublishers from "@/views/admin/ManagePublishers.vue";
import ManageBorrow from "@/views/admin/ManageBorrow.vue";
import Dashboard from "@/views/admin/Dashboard.vue";

const routes = [
    // --- USER ROUTES ---
    { path: "/", component: HomeUser },
    { path: "/login", component: UserLogin },
    { path: "/register", component: UserRegister },
    {
        path: "/history",
        component: BorrowingHistory,
        meta: { requiresAuth: true },
    },
    {
        path: '/book/:id',
        name: 'BookDetail',
        component: BookDetail,
    },

    // --- ADMIN ROUTES ---
    { path: "/admin/login", component: AdminLogin },
    {
        path: "/admin/dashboard",
        component: Dashboard,
        meta: { requiresAdmin: true },
    },
    {
        path: "/admin/books",
        component: ManageBooks,
        meta: { requiresAdmin: true },
    },
    {
        path: "/admin/publishers",
        component: ManagePublishers,
        meta: { requiresAdmin: true },
    },
    {
        path: "/admin/borrow",
        component: ManageBorrow,
        meta: { requiresAdmin: true },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Middleware bảo vệ admin
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const adminStore = useAdminStore();

    // Route yêu cầu user đăng nhập
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
        next("/login");
        return;
    }

    // Route yêu cầu admin đăng nhập
    if (to.meta.requiresAdmin && !adminStore.isLoggedIn) {
        next("/admin/login");
        return;
    }

    // Nếu user đã đăng nhập → chặn vào /login & /register
    if (to.meta.guestOnly && authStore.isLoggedIn) {
        next("/");
        return;
    }

    // Nếu admin đã đăng nhập → chặn vào /admin/login
    if (to.meta.adminGuestOnly && adminStore.isLoggedIn) {
        next("/admin/dashboard");
        return;
    }

    next();
});

export default router;
