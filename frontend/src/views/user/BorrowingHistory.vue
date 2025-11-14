<template>
  <UserLayout>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="fw-bold text-primary">Lịch sử mượn sách</h3>
      <input
        v-model="filters.q"
        class="form-control"
        placeholder="Tìm theo tên sách..."
        style="max-width: 300px"
      />
      <router-link to="/" class="btn btn-outline-primary">
        <i class="bi bi-arrow-left"></i> Quay lại
      </router-link>
    </div>

    <table class="table table-hover align-middle">
      <thead class="table-primary">
        <tr>
          <th>Tên sách</th>
          <th>Ngày mượn</th>
          <th>Hạn trả</th>
          <th>Ngày trả</th>
          <th>Trạng thái</th>
          <th>Tiền phạt</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in borrows" :key="b._id">
          <td>{{ b.MaSach?.TenSach }}</td>
          <td>{{ formatDate(b.NgayMuon) }}</td>
          <td>{{ formatDate(b.HanTra) }}</td>
          <td>{{ b.NgayTra ? formatDate(b.NgayTra) : "—" }}</td>
          <td>
            <span
              :class="{
                'badge bg-secondary': b.TrangThai === 'chờ duyệt',
                'badge bg-success': b.TrangThai === 'đang mượn',
                'badge bg-primary': b.TrangThai === 'đã trả',
                'badge bg-danger': b.TrangThai === 'từ chối',
              }"
            >
              {{ b.TrangThai }}
            </span>
          </td>
          <td>
            <span v-if="b.TienPhat > 0" class="text-danger fw-bold">
              {{ b.TienPhat.toLocaleString() }}đ
              <span v-if="!b.DaDongPhat" class="badge bg-warning text-dark"
                >Chưa nộp</span
              >
              <span v-else class="badge bg-success">Đã nộp</span>
            </span>
            <span v-else>—</span>
          </td>
        </tr>
      </tbody>
    </table>

    <nav v-if="totalPages > 1" class="mt-3">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: page === 1 }">
          <button class="page-link" @click="changePage(page - 1)">«</button>
        </li>
        <li
          v-for="p in totalPages"
          :key="p"
          class="page-item"
          :class="{ active: p === page }"
        >
          <button class="page-link" @click="changePage(p)">{{ p }}</button>
        </li>
        <li class="page-item" :class="{ disabled: page === totalPages }">
          <button class="page-link" @click="changePage(page + 1)">»</button>
        </li>
      </ul>
    </nav>
  </UserLayout>
</template>

<script>
import api from "@/services/api.service";
import UserLayout from "@/layouts/UserLayout.vue";

export default {
  components: { UserLayout },
  data() {
    return {
      borrows: [],
      filters: { q: "" },
      page: 1,
      totalPages: 1,
    };
  },
  async mounted() {
    await this.fetchBorrows();
  },
  methods: {
    // async fetchBorrows() {
    //   const res = await api.get("/borrow/history");
    //   this.borrows = res.data;
    // },
    async fetchBorrows(page = 1) {
      const params = { q: this.filters.q, page, limit: 10 };
      const res = await api.get("/borrow/history", { params });
      this.borrows = res.data.items || res.data;
      this.totalPages = res.data.totalPages || 1;
      this.page = page;
    },
    changePage(p) {
      if (p < 1 || p > this.totalPages) return;
      this.fetchBorrows(p);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString("vi-VN");
    },
  },

  watch: {
    "filters.q": {
      handler() {
        // Khi người dùng gõ -> reset về trang 1
        this.fetchBorrows(1);
      },
      immediate: false,
    },
  },
};
</script>
