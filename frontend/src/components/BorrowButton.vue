<template>
  <button class="btn btn-primary w-100" @click="borrowBook" :disabled="loading">
    <i class="bi bi-bookmark-plus"></i>
    {{ loading ? "Đang gửi..." : "Đăng ký mượn sách" }}
  </button>
</template>

<script setup>
import api from "@/services/api.service";
import { ref } from "vue";

const props = defineProps({
  bookId: String,
});

const loading = ref(false);

const borrowBook = async () => {
  if (!props.bookId) return;
  loading.value = true;
  try {
    await api.post("/borrow/request", { sachId: props.bookId });
    alert("Đã gửi yêu cầu mượn sách!");
  } catch (err) {
    alert(err.response?.data?.message || "Lỗi khi gửi yêu cầu.");
  } finally {
    loading.value = false;
  }
};
</script>
