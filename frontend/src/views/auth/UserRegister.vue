<template>
  <div class="container d-flex align-items-center justify-content-center min-vh-100">
    <div class="card shadow-lg border-0 rounded-4" style="max-width: 500px; width: 100%">
      <div class="card-body p-4">
        <h3 class="text-center text-success fw-bold mb-3">Đăng ký Độc giả</h3>

        <form @submit.prevent="registerUser">
          <div class="row g-2">
            <div class="col-md-6">
              <label class="form-label">Mã độc giả</label>
              <input v-model="form.MaDocGia" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Họ lót</label>
              <input v-model="form.HoLot" class="form-control" required />
            </div>
          </div>

          <div class="row g-2 mt-2">
            <div class="col-md-6">
              <label class="form-label">Tên</label>
              <input v-model="form.Ten" class="form-control" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Ngày sinh</label>
              <input v-model="form.NgaySinh" type="date" class="form-control" />
            </div>
          </div>

          <div class="mt-2">
            <label class="form-label">Email</label>
            <input v-model="form.Email" type="email" class="form-control" required />
          </div>

          <div class="mt-2">
            <label class="form-label">Số điện thoại</label>
            <input v-model="form.SoDienThoai" class="form-control" required />
          </div>

          <div class="mt-2">
            <label class="form-label">Địa chỉ</label>
            <input v-model="form.DiaChi" class="form-control" />
          </div>

          <div class="mt-2">
            <label class="form-label">Mật khẩu</label>
            <input v-model="form.MatKhau" type="password" class="form-control" required />
          </div>

          <button type="submit" class="btn btn-success w-100 mt-3" :disabled="loading">
            <i class="bi bi-person-plus"></i>
            {{ loading ? "Đang đăng ký..." : "Đăng ký" }}
          </button>
        </form>

        <p class="text-center mt-3 mb-0">
          Đã có tài khoản?
          <router-link to="/login">Đăng nhập</router-link>
        </p>
      </div>
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
  MaDocGia: "",
  HoLot: "",
  Ten: "",
  Email: "",
  NgaySinh: "",
  DiaChi: "",
  SoDienThoai: "",
  MatKhau: "",
});

const registerUser = async () => {
  loading.value = true;
  try {
    await authStore.register(form);
    alert("Đăng ký thành công! Hãy đăng nhập để tiếp tục.");
    router.push("/login");
  } catch (err) {
    alert(err.response?.data?.message || "Lỗi khi đăng ký.");
  } finally {
    loading.value = false;
  }
};
</script>
