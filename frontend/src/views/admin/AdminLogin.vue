<template>
  <div
    class="container d-flex align-items-center justify-content-center min-vh-100"
  >
    <div
      class="card shadow-lg border-0 rounded-4"
      style="max-width: 400px; width: 100%"
    >
      <div class="card-body p-4">
        <h3 class="text-center text-primary fw-bold mb-3">
          Đăng nhập Quản trị
        </h3>

        <form @submit.prevent="loginAdmin">
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input
              v-model="form.Email"
              type="email"
              class="form-control"
              required
            />
          </div>
          <div class="mb-3">
            <label class="form-label">Mật khẩu</label>
            <input
              v-model="form.MatKhau"
              type="password"
              class="form-control"
              required
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary w-100"
            :disabled="loading"
          >
            <i class="bi bi-person-lock"></i>
            {{ loading ? "Đang đăng nhập..." : "Đăng nhập" }}
          </button>
        </form>

        <p class="text-center text-muted mt-3 mb-0">
          Trang này dành cho nhân viên quản trị hệ thống.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAdminStore } from "@/stores/admin.store";

const router = useRouter();
const adminStore = useAdminStore();
const loading = ref(false);

const form = reactive({
  Email: "",
  MatKhau: "",
});

const loginAdmin = async () => {
  loading.value = true;
  try {
    await adminStore.login(form);
    router.push("/admin/dashboard");
  } catch (err) {
    alert(err.response?.data?.message || "Sai email hoặc mật khẩu!");
  } finally {
    loading.value = false;
  }
};
</script>
