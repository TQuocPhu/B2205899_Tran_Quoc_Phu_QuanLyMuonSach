<template>
  <AdminLayout>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="fw-bold text-primary">Quản lý Nhà Xuất Bản</h3>
      <button class="btn btn-success" @click="openModal()">+ Thêm NXB</button>
    </div>

    <table class="table table-hover align-middle">
      <thead class="table-primary">
        <tr>
          <th>Mã NXB</th>
          <th>Tên NXB</th>
          <th>Địa chỉ</th>
          <th>Điện thoại</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in publishers" :key="p._id">
          <td>{{ p.MaNXB }}</td>
          <td>{{ p.TenNXB }}</td>
          <td>{{ p.DiaChi }}</td>
          <td>{{ p.DienThoai }}</td>
          <td>
            <button class="btn btn-sm btn-primary me-2" @click="openModal(p)">
              Sửa
            </button>
            <button
              class="btn btn-sm btn-danger"
              @click="deletePublisher(p._id)"
            >
              Xóa
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal thêm/sửa -->
    <div
      v-if="showModal"
      class="modal fade show d-block"
      style="background: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5>{{ current._id ? "Sửa NXB" : "Thêm NXB" }}</h5>
            <button class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <input
              v-model="current.MaNXB"
              class="form-control mb-2"
              placeholder="Mã NXB"
            />
            <input
              v-model="current.TenNXB"
              class="form-control mb-2"
              placeholder="Tên NXB"
            />
            <input
              v-model="current.DiaChi"
              class="form-control mb-2"
              placeholder="Địa chỉ"
            />
            <input
              v-model="current.DienThoai"
              class="form-control"
              placeholder="Điện thoại"
            />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">Hủy</button>
            <button class="btn btn-primary" @click="savePublisher">Lưu</button>
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
      publishers: [],
      showModal: false,
      current: {},
    };
  },
  async mounted() {
    await this.fetchPublishers();
  },
  methods: {
    async fetchPublishers() {
      const res = await adminApi.get("/publishers");
      this.publishers = res.data;
    },
    openModal(pub = {}) {
      this.current = { ...pub };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.current = {};
    },
    // async savePublisher() {
    //   if (this.current._id) {
    //     await adminApi.put(`/publishers/${this.current._id}`, this.current);
    //   } else {
    //     await adminApi.post("/publishers", this.current);
    //   }
    //   this.closeModal();
    //   this.fetchPublishers();
    // },
    async savePublisher() {
      try {
        if (this.current._id) {
          await adminApi.put(`/publishers/${this.current._id}`, this.current);
        } else {
          await adminApi.post("/publishers", this.current);
        }
        this.closeModal();
        this.fetchPublishers();
      } catch (err) {
        console.error("Lỗi khi lưu NXB:", err.response?.data || err.message);
        alert(
          "Lỗi khi lưu NXB: " + (err.response?.data?.message || err.message)
        );
      }
    },

    async deletePublisher(id) {
      if (confirm("Bạn có chắc muốn xóa NXB này?")) {
        await adminApi.delete(`/publishers/${id}`);
        this.fetchPublishers();
      }
    },
  },
};
</script>
