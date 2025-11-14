<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      <div class="container">
        <router-link class="navbar-brand fw-bold" to="/"
          >📚 Thư Viện</router-link
        >

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div
          class="collapse navbar-collapse"
          id="navbarNav"
          v-if="authStore.isLoggedIn"
        >
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/">Trang chủ</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/history"
                >Lịch sử mượn</router-link
              >
            </li>
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                id="userDropdown"
                role="button"
                data-bs-toggle="dropdown"
              >
                {{ authStore.user?.HoLot }} {{ authStore.user?.Ten }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <button class="dropdown-item text-danger" @click="logout">
                    <i class="bi bi-box-arrow-right"></i> Đăng xuất
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <!-- Nếu chưa đăng nhập -->
        <div class="collapse navbar-collapse" id="navbarNav" v-else>
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/login">Đăng nhập</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/register">Đăng ký</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="container p-3 mt-0">
      <slot />
    </main>

    <footer class="bg-light text-center py-3 mt-auto border-top">
      <small class="text-muted"
        >© {{ new Date().getFullYear() }} - Quản lý thư viện</small
      >
    </footer>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth.store";
const authStore = useAuthStore();
const logout = () => {
  // authStore.logout();
  const confirmLogout = window.confirm("Bạn có chắc muốn đăng xuất không?");
  if (confirmLogout) {
    authStore.logout();
  }
};
</script>
