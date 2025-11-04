import express from "express";
import Book from "../models/Book.js";
import { adminAuth } from "../middleware/auth.js";
import e from "express";

const router = express.Router();

/**
 * GET /api/books
 * Query: q, publisher, year, page, limit
 * Public route (user)
 */
router.get("/", async (req, res) => {
    try {
        const { q, publisher, year, page = 1, limit = 6 } = req.query;
        const filter = {};
        if (q) {
            filter.$or = [
                { TenSach: { $regex: q, $options: "i" } },
                { TacGia: { $regex: q, $options: "i" } },
            ];
        }
        if (publisher) filter.MaNXB = publisher;
        if (year) filter.NamXuatBan = year;

        const skip = (page - 1) * limit;
        const total = await Book.countDocuments(filter);
        const books = await Book.find(filter)
            .populate("MaNXB")
            .sort({ TenSach: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            books,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        res.status(500).json({ message: "Đã xảy ra lỗi trong GET api/book của user", err });
    }
});

/**
 * GET /api/books/:id
 * Xem chi tiết 1 sách
 */
router.get("/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate("MaNXB");
        if (!book) {
            return res.status(404).json({ message: "Không tìm thấy sách!" });
        }
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: "Đã xảy ra lỗi trong GET api/books/:id của user", err });
    }
});

/**
 * POST /api/books
 * Thêm sách mới (admin)
 */
router.post("/", adminAuth, async (req, res) => {
    try {
        const { MaSach, TenSach, TacGia, NamXuatBan, SoQuyen, MaNXB, HinhAnh } = req.body;

        const exist = await Book.findOne({ MaSach });
        if (exist) {
            return res.status(400).json({ message: "Mã Sách Đã Tồn Tại" });
        }

        const book = await Book.create({
            MaSach,
            TenSach,
            TacGia,
            NamXuatBan,
            SoQuyen,
            MaNXB,
            HinhAnh,
        });

        res.status(201).json({ message: "Đã thêm sách", book });
    } catch (err) {
        res.status(500).json({ message: "Đã xảy ra lỗi trong POST /api/books của admin", err });
    }
});

/**
 * PUT /api/books/:id
 * Cập nhật sách (admin)
 */
router.put("/:id", adminAuth, async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!book) {
            return res.status(404).json({ message: "Không tìm thấy sách!" });
        }
        res.json({ message: "Đã cập nhật sách ", book });
    } catch (err) {
        res.status(500).json({ message: "Đã xảy ra lỗi trong PUT /api/books/:id trong admin", err });
    }
});

/**
 * DELETE /api/books/:id
 * Xóa sách (admin)
 */
router.delete("/:id", adminAuth, async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });
        res.json({ message: "Đã xóa sách" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;