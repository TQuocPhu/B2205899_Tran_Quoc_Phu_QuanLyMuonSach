<template>
  <AdminLayout>
    <h2 class="fw-bold text-primary mb-4">📊 Dashboard Quản trị</h2>

    <div class="row g-4">
      <div class="col-md-3" v-for="card in cards" :key="card.title">
        <div class="card shadow-sm border-0 rounded-4 h-100 text-center p-3">
          <div class="card-body">
            <i
              :class="`bi ${card.icon} text-${card.color}`"
              style="font-size: 2.5rem"
            ></i>
            <h5 class="mt-3 fw-bold">{{ card.title }}</h5>
            <h3 class="fw-bold text-dark">{{ card.value }}</h3>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import adminApi from "@/services/adminApi";

const cards = ref([]);

onMounted(async () => {
  const [books, publishers, borrows] = await Promise.all([
    adminApi.get("/books"),
    adminApi.get("/publishers"),
    adminApi.get("/borrow", { params: { limit: 1000 } }),
  ]);

  const totalBooks = books.data.total || books.data.length;
  const totalPublishers = publishers.data.length;
  const borrowItems = borrows.data.items || borrows.data;
  const totalBorrows = borrowItems.length;

  const totalFine = borrowItems.reduce((sum, b) => sum + (b.TienPhat || 0), 0);

  cards.value = [
    {
      title: "Tổng số sách",
      value: totalBooks,
      icon: "bi-book",
      color: "primary",
    },
    {
      title: "Nhà xuất bản",
      value: totalPublishers,
      icon: "bi-building",
      color: "success",
    },
    {
      title: "Lượt mượn",
      value: totalBorrows,
      icon: "bi-journal-check",
      color: "warning",
    },
    {
      title: "Tổng tiền phạt",
      value: totalFine.toLocaleString() + "đ",
      icon: "bi-cash-stack",
      color: "danger",
    },
  ];
});
</script>
