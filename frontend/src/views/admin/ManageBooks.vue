<template>
  <AdminLayout>
    <div
      class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2"
    >
      <h3 class="fw-bold text-primary">Quản lý Sách</h3>
      <div class="d-flex flex-wrap gap-2">
        <input
          v-model="filters.q"
          class="form-control"
          placeholder="Tên hoặc tác giả"
        />
        <select v-model="filters.publisher" class="form-select">
          <option value="">Tất cả NXB</option>
          <option v-for="p in publishers" :key="p._id" :value="p._id">
            {{ p.TenNXB }}
          </option>
        </select>
        <button class="btn btn-primary" @click="() => fetchBooks()">
          <i class="bi bi-search"></i>
        </button>
        <button class="btn btn-success" @click="openModal()">
          + Thêm sách
        </button>
      </div>
    </div>

    <table class="table table-striped table-hover align-middle">
      <thead class="table-primary">
        <tr>
          <th>Mã sách</th>
          <th>Hình ảnh</th>
          <th>Tên sách</th>
          <th>Tác giả</th>
          <th>NXB</th>
          <th>Số quyển</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in books" :key="b._id">
          <td>{{ b.MaSach }}</td>
          <td>
            <img
              :src="
                b.HinhAnh
                  ? `http://localhost:3000${b.HinhAnh}`
                  : '/book-placeholder.png'
              "
              alt="Bìa sách"
              style="width: 60px; height: 80px; object-fit: cover"
              class="rounded shadow-sm"
            />
          </td>
          <td>{{ b.TenSach }}</td>
          <td>{{ b.TacGia }}</td>
          <td>{{ b.MaNXB?.TenNXB }}</td>
          <td>{{ b.SoQuyen }}</td>
          <td>
            <button class="btn btn-sm btn-primary me-2" @click="openModal(b)">
              Sửa
            </button>
            <button class="btn btn-sm btn-danger" @click="deleteBook(b._id)">
              Xóa
            </button>
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

    <!-- Modal thêm/sửa -->
    <div
      v-if="showModal"
      class="modal fade show d-block"
      style="background: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5>{{ current._id ? "Sửa sách" : "Thêm sách" }}</h5>
            <button class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <input
              v-model="current.MaSach"
              class="form-control mb-2"
              placeholder="Mã sách"
            />
            <input
              v-model="current.TenSach"
              class="form-control mb-2"
              placeholder="Tên sách"
            />
            <input
              v-model="current.TacGia"
              class="form-control mb-2"
              placeholder="Tác giả"
            />
            <input
              v-model="current.NamXuatBan"
              type="number"
              class="form-control mb-2"
              placeholder="Năm XB"
            />
            <input
              v-model="current.SoQuyen"
              type="number"
              class="form-control mb-2"
              placeholder="Số quyển"
            />
            <select v-model="current.MaNXB" class="form-select mb-2">
              <option value="">Chọn NXB</option>
              <option v-for="p in publishers" :key="p._id" :value="p._id">
                {{ p.TenNXB }}
              </option>
            </select>
            <input type="file" @change="onFileChange" class="form-control" />
            <img
              v-if="preview"
              :src="preview"
              class="img-thumbnail mt-2"
              style="max-height: 150px"
            />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">Hủy</button>
            <button class="btn btn-primary" @click="saveBook">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/layouts/AdminLayout.vue";
import adminApi from "@/services/adminApi";

export default {
  components: { AdminLayout },
  data() {
    return {
      books: [],
      publishers: [],
      filters: { q: "", publisher: "" },
      page: 1,
      totalPages: 1,
      showModal: false,
      current: {},
      file: null,
      preview: null,
    };
  },
  async mounted() {
    await this.fetchPublishers();
    await this.fetchBooks();
  },
  methods: {
    async fetchPublishers() {
      const res = await adminApi.get("/publishers");
      this.publishers = res.data;
    },
    async fetchBooks(page = 1) {
      const params = { ...this.filters, page, limit: 6 };
      const res = await adminApi.get("/books", { params });
      this.books = res.data.books;
      this.totalPages = res.data.totalPages;
      this.page = res.data.page;
    },
    changePage(p) {
      if (p < 1 || p > this.totalPages) return;
      this.fetchBooks(p);
    },
    // openModal(book = {}) {
    //   this.current = { ...book };
    //   this.showModal = true;
    // },
    // closeModal() {
    //   this.showModal = false;
    //   this.current = {};
    // },
    openModal(book = {}) {
      this.current = { ...book };
      this.current.MaNXB = book.MaNXB?._id || "";
      this.file = null;
      this.preview = book.HinhAnh
        ? `http://localhost:3000${book.HinhAnh}`
        : null;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.current = {};
      this.file = null;
      this.preview = null;
    },
    onFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.file = file;
        this.preview = URL.createObjectURL(file);
      }
    },
    async saveBook() {
      const formData = new FormData();
      Object.entries(this.current).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
      });
      if (this.file) formData.append("HinhAnh", this.file);

      if (this.current._id) {
        await adminApi.put(`/books/${this.current._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await adminApi.post("/books", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      this.closeModal();
      this.fetchBooks();
    },
    async deleteBook(id) {
      if (confirm("Bạn có chắc muốn xóa sách này?")) {
        await adminApi.delete(`/books/${id}`);
        this.fetchBooks();
      }
    },
  },
};
</script>
