<template>
  <div class="admin-wrapper">
    <div v-if="adminStore.isLoggedIn" class="d-flex min-vh-100">
      <!-- Sidebar -->
      <aside
        class="bg-dark text-white p-3"
        style="width: 250px; flex-shrink: 0"
      >
        <h4 class="fw-bold text-center mb-4">📘 Admin</h4>
        <ul class="nav flex-column">
          <li class="nav-item mb-2">
            <router-link class="nav-link text-white" to="/admin/dashboard">
              <i class="bi bi-speedometer2 me-2"></i> Dashboard
            </router-link>
          </li>
          <li class="nav-item mb-2">
            <router-link class="nav-link text-white" to="/admin/books">
              <i class="bi bi-journal-text me-2"></i> Quản lý Sách
            </router-link>
          </li>
          <li class="nav-item mb-2">
            <router-link class="nav-link text-white" to="/admin/publishers">
              <i class="bi bi-building me-2"></i> Nhà Xuất Bản
            </router-link>
          </li>
          <li class="nav-item mb-2">
            <router-link class="nav-link text-white" to="/admin/borrow">
              <i class="bi bi-bookmark-check me-2"></i> Mượn sách
            </router-link>
          </li>
        </ul>
        <hr class="text-secondary" />
        <button class="btn btn-outline-light w-100" @click="logout">
          <i class="bi bi-box-arrow-right me-1"></i> Đăng xuất
        </button>
      </aside>

      <!-- Main content -->
      <div class="flex-grow-1 d-flex flex-column" style="margin-left: 250px">
        <nav class="navbar navbar-light bg-light border-bottom flex-shrink-0">
          <div class="container-fluid">
            <span class="navbar-text fw-bold text-primary">
              Xin chào, {{ adminStore.admin?.HoTen || "Admin" }}
            </span>
          </div>
        </nav>

        <main class="p-4 overflow-auto flex-grow-1 bg-light">
          <slot />
        </main>
      </div>
    </div>

    <!-- Khi chưa login -->
    <div v-else class="container py-5 text-center">
      <h5>
        Vui lòng <router-link to="/admin/login">đăng nhập</router-link> để truy
        cập trang quản trị.
      </h5>
    </div>
  </div>
</template>

<script setup>
import { useAdminStore } from "@/stores/admin.store";
const adminStore = useAdminStore();

const logout = () => {
  if (confirm("Bạn có chắc muốn đăng xuất không?")) {
    adminStore.logout();
  }
};
</script>

<style scoped>
.admin-wrapper {
  margin-top: -60px; /* khử phần margin-top của App.vue */
}

aside {
  /* height: 100vh;
  overflow-y: auto; */
  width: 250px;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  background: #212529;
  color: white;
  overflow: hidden;
}

.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 0.375rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
}

main {
  padding-top: 1rem;
  padding-bottom: 2rem;
  /* margin-top: -50px; */
}

body {
  margin: 0;
}
</style>
