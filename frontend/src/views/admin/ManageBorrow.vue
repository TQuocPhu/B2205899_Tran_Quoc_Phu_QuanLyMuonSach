<template>
  <AdminLayout>
    <div
      class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2"
    >
      <h3 class="fw-bold text-primary">Quản lý Mượn Sách</h3>
      <div class="d-flex flex-wrap gap-2">
        <input
          v-model="filters.q"
          class="form-control"
          placeholder="Tên sách hoặc độc giả"
        />
        <button class="btn btn-primary" @click="fetchBorrows()">
          <i class="bi bi-search"></i>
        </button>
      </div>
    </div>

    <table class="table table-hover align-middle">
      <thead class="table-primary">
        <tr>
          <th>Độc giả</th>
          <th>Sách</th>
          <th>Ngày mượn</th>
          <th>Hạn trả</th>
          <th>Trạng thái</th>
          <th>Tiền phạt</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in borrows" :key="b._id">
          <td>{{ b.MaDocGia?.HoLot }} {{ b.MaDocGia?.Ten }}</td>
          <td>{{ b.MaSach?.TenSach }}</td>
          <td>{{ formatDate(b.NgayMuon) }}</td>
          <td>{{ formatDate(b.HanTra) }}</td>
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
              <span v-if="b.DaDongPhat" class="badge bg-success">Đã nộp</span>
            </span>
            <span v-else>—</span>
          </td>
          <td>
            <div class="btn-group">
              <button
                v-if="b.TrangThai === 'chờ duyệt'"
                class="btn btn-sm btn-success"
                @click="approve(b._id)"
              >
                Duyệt
              </button>
              <button
                v-if="b.TrangThai === 'chờ duyệt'"
                class="btn btn-sm btn-danger"
                @click="reject(b._id)"
              >
                Từ chối
              </button>
              <button
                v-if="b.TrangThai === 'đang mượn'"
                class="btn btn-sm btn-primary"
                @click="markReturned(b._id)"
              >
                Trả sách
              </button>
              <button
                v-if="b.TienPhat > 0 && !b.DaDongPhat"
                class="btn btn-sm btn-warning"
                @click="markPaid(b._id)"
              >
                Đánh dấu nộp phạt
              </button>
            </div>
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
  </AdminLayout>
</template>

<script>
import adminApi from "@/services/adminApi";
import AdminLayout from "@/layouts/AdminLayout.vue";

export default {
  components: { AdminLayout },
  data() {
    return { borrows: [], filters: { q: "" }, page: 1, totalPages: 1 };
  },
  async mounted() {
    await this.fetchBorrows();
  },
  methods: {
    // async fetchBorrows() {
    //   const res = await adminApi.get("/borrow");
    //   this.borrows = res.data;
    // },
    async fetchBorrows(page = 1) {
      const params = { q: this.filters.q, page, limit: 10 };
      const res = await adminApi.get("/borrow", { params });
      this.borrows = res.data.items || res.data; // backend có thể trả mảng hoặc object
      this.totalPages = res.data.totalPages || 1;
      this.page = page;
    },

    changePage(p) {
      if (p < 1 || p > this.totalPages) return;
      this.fetchBorrows(p);
    },

    async approve(id) {
      if (confirm("Phê duyệt yêu cầu mượn này?")) {
        await adminApi.put(`/borrow/${id}/approve`);
        this.fetchBorrows(this.page);
      }
    },
    async reject(id) {
      if (confirm("Từ chối yêu cầu này?")) {
        await adminApi.put(`/borrow/${id}/reject`);
        this.fetchBorrows(this.page);
      }
    },
    async markReturned(id) {
      if (confirm("Đánh dấu trả sách?")) {
        await adminApi.put(`/borrow/${id}/return`);
        this.fetchBorrows(this.page);
      }
    },
    async markPaid(id) {
      if (confirm("Đánh dấu đã nộp phạt?")) {
        await adminApi.put(`/borrow/${id}/payfine`);
        this.fetchBorrows(this.page);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString("vi-VN");
    },
  },
};
</script>
