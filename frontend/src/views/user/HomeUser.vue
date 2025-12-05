<template>
  <UserLayout>
    <div
      class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2"
    >
      <h3 class="fw-bold text-primary">Danh sách Sách</h3>
      <div class="d-flex flex-wrap align-items-center gap-2">
        <input
          v-model="filters.q"
          class="form-control"
          placeholder="Tìm theo tên hoặc tác giả"
          style="max-width: 588px"
          @keyup.enter="fetchBooks"
        />
        <select
          v-model="filters.publisher"
          @change="fetchBooks"
          class="form-select"
        >
          <option value="">Tất cả NXB</option>
          <option v-for="p in publishers" :key="p._id" :value="p._id">
            {{ p.TenNXB }}
          </option>
        </select>
        <button class="btn btn-primary" @click="fetchBooks">
          <i class="bi bi-search"></i> Tìm
        </button>
      </div>
    </div>

    <div class="row g-3">
      <BookCard
        v-for="book in books"
        :key="book._id"
        :book="book"
        class="col-md-4"
      />
    </div>

    <nav v-if="totalPages > 1" class="mt-4">
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
import UserLayout from "@/layouts/UserLayout.vue";
import BookCard from "@/components/BookCard.vue";
import api from "@/services/api.service";

export default {
  components: { UserLayout, BookCard },
  data() {
    return {
      books: [],
      publishers: [],
      filters: { q: "", publisher: "" },
      page: 1,
      totalPages: 1,
    };
  },
  async mounted() {
    await this.fetchPublishers();
    await this.fetchBooks();
  },
  methods: {
    async fetchPublishers() {
      const res = await api.get("/publishers");
      this.publishers = res.data;
    },
    async fetchBooks(page = 1) {
      const params = { ...this.filters, page };
      const res = await api.get("/books", { params });
      this.books = res.data.books;
      this.page = res.data.page;
      this.totalPages = res.data.totalPages;
    },
    changePage(p) {
      if (p < 1 || p > this.totalPages) return;
      this.fetchBooks(p);
    },
  },
};
</script>
