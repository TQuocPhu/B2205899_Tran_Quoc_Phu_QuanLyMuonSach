<template>
  <div class="col">
    <div class="card shadow-sm h-100">
      <!-- <img
        :src="book.HinhAnh || 'https://via.placeholder.com/200x250?text=No+Image'"
        class="card-img-top"
        style="height: 250px; object-fit: cover;"
        alt="Book Image"
      /> -->
      <img
        :src="
          book.HinhAnh
            ? `http://localhost:3000${book.HinhAnh}`
            : '/book-placeholder.png'
        "
        alt="Bìa sách"
        style="height: 350px; object-fit: cover"
        class="rounded shadow-sm"
      />
      <div class="card-body">
        <h5 class="card-title text-primary">{{ book.TenSach }}</h5>
        <p class="card-text mb-1">
          <strong>Tác giả:</strong> {{ book.TacGia }}
        </p>
        <p class="text-muted mb-2">
          <small>NXB: {{ book.MaNXB?.TenNXB || "Chưa rõ" }}</small>
        </p>
        <router-link
          :to="`/book/${book._id}`"
          class="btn btn-outline-primary btn-sm w-100"
        >
          <i class="bi bi-book"></i> Xem chi tiết
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    book: Object,
  },
};
</script>
