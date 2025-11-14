<template>
  <UserLayout>
    <div class="container">
      <div class="row g-4 align-items-start">
        <!-- Ảnh bên trái -->
        <div class="col-md-4 text-center">
          <img
            :src="
              book.HinhAnh
                ? `http://localhost:3000${book.HinhAnh}`
                : '/book-placeholder.png'
            "
            alt="Ảnh sách"
            class="img-fluid rounded shadow-sm"
            style="max-height: 400px; object-fit: cover"
          />
        </div>

        <!-- Thông tin bên phải -->
        <div class="col-md-8">
          <h2 class="fw-bold text-primary">{{ book.TenSach }}</h2>
          <p><strong>Tác giả:</strong> {{ book.TacGia }}</p>
          <p><strong>Nhà xuất bản:</strong> {{ book.MaNXB?.TenNXB }}</p>
          <p><strong>Số quyển còn:</strong> {{ book.SoQuyen }}</p>

          <!-- <button class="btn btn-success mt-3" @click="openModal">
            <i class="bi bi-bookmark-check"></i> Đăng ký mượn sách
          </button> -->
          <button
            class="btn mt-3"
            :class="hasBorrowed ? 'btn-secondary' : 'btn-success'"
            :disabled="hasBorrowed"
            @click="!hasBorrowed && openModal()"
          >
            <i class="bi bi-bookmark-check"></i>
            {{
              hasBorrowed
                ? borrowStatus === "chờ duyệt"
                  ? "⏳ Đang chờ phê duyệt"
                  : "📖 Đang mượn sách"
                : "Đăng ký mượn sách"
            }}
          </button>
        </div>
      </div>

      <!-- Modal đăng ký mượn -->
      <div
        v-if="showModal"
        class="modal fade show d-block"
        style="background: rgba(0, 0, 0, 0.5)"
      >
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title text-primary">Đăng ký mượn sách</h5>
              <button class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <h6 class="fw-bold">Thông tin sách</h6>
                  <p><strong>Tên sách:</strong> {{ book.TenSach }}</p>
                  <p><strong>Tác giả:</strong> {{ book.TacGia }}</p>
                  <p><strong>NXB:</strong> {{ book.MaNXB?.TenNXB }}</p>
                </div>
                <div class="col-md-6">
                  <h6 class="fw-bold">Thông tin độc giả</h6>
                  <p>
                    <strong>Họ tên:</strong> {{ user?.HoLot }} {{ user?.Ten }}
                  </p>
                  <p><strong>Email:</strong> {{ user?.Email }}</p>
                  <p><strong>Điện thoại:</strong> {{ user?.SoDienThoai }}</p>
                </div>
              </div>

              <div class="mt-3">
                <label class="form-label fw-bold">Ngày trả dự kiến</label>
                <input
                  type="date"
                  v-model="NgayTraDuKien"
                  class="form-control"
                  :min="minDate"
                  :max="maxDate"
                />
                <span class="text-danger mt-2 d-block"
                  >⚠️ Trễ 1 ngày sẽ bị tính tiền phạt! (Thời gian mượn tối đa 3
                  tuần)</span
                >
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModal">Hủy</button>
              <button class="btn btn-success" @click="registerBorrow">
                Xác nhận mượn
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Phần sách tương tự -->
      <div class="mt-5">
        <h4 class="text-primary fw-bold mb-3">📚 Sách cùng nhà xuất bản</h4>
        <div class="row row-cols-1 row-cols-md-4 g-3">
          <BookCard v-for="b in similarBooks" :key="b._id" :book="b" />
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<script>
import UserLayout from "@/layouts/UserLayout.vue";
import BookCard from "@/components/BookCard.vue";
import api from "@/services/api.service";
import { useAuthStore } from "@/stores/auth.store";

export default {
  name: "BookDetail",
  components: { UserLayout, BookCard },
  data() {
    return {
      book: {},
      similarBooks: [],
      showModal: false,
      user: null,
      NgayTraDuKien: "",
      hasBorrowed: false,
      borrowStatus: null,
    };
  },
  computed: {
    minDate() {
      const today = new Date();
      today.setDate(today.getDate() + 1); //tối thiểu là ngày mai
      return today.toISOString().split("T")[0];
    },
    maxDate() {
      const today = new Date();
      today.setDate(today.getDate() + 21); // tối đa 3 tuần (21 ngày)
      return today.toISOString().split("T")[0];
    },
  },
  async mounted() {
    const id = this.$route.params.id;
    await this.fetchBook(id);
    await this.fetchSimilarBooks();
    const authStore = useAuthStore();
    this.user = authStore.user;

    if (this.user) {
      await this.checkBorrowStatus(id);
    }
  },
  methods: {
    async fetchBook(id) {
      const res = await api.get(`/books/${id}`);
      this.book = res.data;
    },
    async fetchSimilarBooks() {
      if (!this.book.MaNXB?._id) return;
      const res = await api.get(`/books`, {
        params: { publisher: this.book.MaNXB._id, limit: 4 },
      });
      // Loại bỏ chính quyển sách đang xem
      this.similarBooks = res.data.books.filter((b) => b._id !== this.book._id);
    },
    openModal() {
      const authStore = useAuthStore();
      if (!authStore.user) {
        alert("Bạn cần đăng nhập trước khi đăng ký mượn sách!");
        this.$router.push("/login");
        return;
      }
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.NgayTraDuKien = "";
    },
    async registerBorrow() {
      if (!this.NgayTraDuKien) {
        alert("Vui lòng chọn ngày trả dự kiến!");
        return;
      }

      //   const payload = {
      //     sachId: this.book._id,
      //     hanTra: this.NgayTraDuKien,
      //   };
      //   console.log("📦 Payload gửi đi:", payload);

      try {
        await api.post("/borrow/request", {
          sachId: this.book._id,
          hanTra: this.NgayTraDuKien,
        });
        alert("Đăng ký mượn sách thành công!");
        this.closeModal();
        this.$router.push("/history");
      } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra khi đăng ký mượn sách.");
      }
    },

    async checkBorrowStatus(bookId) {
      try {
        const res = await api.get("/borrow/check", {
          params: { sachId: bookId },
        });
        this.hasBorrowed = res.data.exists;
        this.borrowStatus = res.data.status;
      } catch (err) {
        console.error("Lỗi khi kiểm tra trạng thái mượn:", err);
      }
    },
  },
};
</script>

<style scoped>
.modal {
  display: block;
}
.card-img-top {
  transition: transform 0.3s;
}
.card-img-top:hover {
  transform: scale(1.05);
}
</style>
