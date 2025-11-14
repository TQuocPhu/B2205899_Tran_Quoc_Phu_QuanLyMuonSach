<template>
  <div
    class="login-page d-flex align-items-center justify-content-center min-vh-100"
  >
    <div class="card login-card shadow-lg border-0 rounded-4 p-4">
      <div class="text-center mb-4">
        <div class="login-icon mb-2">
          <i class="bi bi-book-half text-primary" style="font-size: 3rem"></i>
        </div>
        <h3 class="fw-bold text-primary">Thư Viện Số</h3>
        <p class="text-muted mb-0">Đăng nhập dành cho độc giả</p>
      </div>

      <form @submit.prevent="loginUser">
        <div class="mb-3">
          <label class="form-label fw-semibold">📖 Email hoặc Mã độc giả</label>
          <input
            v-model="form.TaiKhoan"
            class="form-control form-control-lg rounded-3"
            placeholder="Nhập Email hoặc Mã độc giả..."
            required
          />
        </div>

        <hr />

        <div class="mb-3">
          <label class="form-label fw-semibold">🔒 Mật khẩu</label>
          <input
            v-model="form.MatKhau"
            type="password"
            class="form-control form-control-lg rounded-3"
            placeholder="Nhập mật khẩu..."
            required
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary w-100 py-2 fw-semibold rounded-3"
          :disabled="loading"
        >
          <i class="bi bi-box-arrow-in-right me-2"></i>
          {{ loading ? "Đang đăng nhập..." : "Đăng nhập" }}
        </button>
      </form>

      <p class="text-center mt-3 mb-0 text-muted">
        Chưa có tài khoản?
        <router-link
          to="/register"
          class="fw-semibold text-decoration-none text-primary"
        >
          Đăng ký ngay
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

const form = reactive({
  TaiKhoan: "", // có thể nhập Email hoặc Mã độc giả
  MatKhau: "",
});

const loginUser = async () => {
  loading.value = true;
  try {
    await authStore.login(form);
    router.push("/");
  } catch (err) {
    alert(err.response?.data?.message || "Sai Email/Mã độc giả hoặc mật khẩu!");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
}

.login-card {
  width: 100%;
  max-width: 420px;
  background-color: #fff;
  border-radius: 1rem;
  animation: fadeIn 0.6s ease;
}

.login-icon {
  background: #e3f2fd;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
