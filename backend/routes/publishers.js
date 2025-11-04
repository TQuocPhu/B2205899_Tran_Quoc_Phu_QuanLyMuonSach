import express from "express";
import Publisher from "../models/Publisher.js";
import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/publishers
 * Lấy danh sách tất cả NXB (public)
 */
router.get("/", async (req, res) => {
    try {
        const publishers = await Publisher.find().sort({ TenNXB: 1 });
        res.json(publishers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * GET /api/publishers/:id
 * Lấy chi tiết NXB
 */
router.get("/:id", async (req, res) => {
    try {
        const publisher = await Publisher.findById(req.params.id);
        if (!publisher) return res.status(404).json({ message: "Không tìm thấy NXB" });
        res.json(publisher);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * POST /api/publishers
 * Thêm NXB (admin)
 */
router.post("/", adminAuth, async (req, res) => {
    try {
        const { MaNXB, TenNXB, DiaChi, DienThoai } = req.body;

        if (!MaNXB || !TenNXB) {
            return res.status(400).json({ message: "Mã NXB và Tên NXB là bắt buộc" });
        }

        const exist = await Publisher.findOne({ MaNXB });
        if (exist) return res.status(400).json({ message: "Mã NXB đã tồn tại" });

        const publisher = await Publisher.create({ MaNXB, TenNXB, DiaChi, DienThoai });
        res.status(201).json({ message: "Đã thêm NXB", publisher });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Mã NXB đã tồn tại" });
        }
        res.status(500).json({ message: err.message });
    }
});

/**
 * PUT /api/publishers/:id
 * Cập nhật NXB (admin)
 */
router.put("/:id", adminAuth, async (req, res) => {
    try {
        if (!MaNXB || !TenNXB) {
            return res.status(400).json({ message: "Mã NXB và Tên NXB là bắt buộc" });
        }
        const publisher = await Publisher.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!publisher) return res.status(404).json({ message: "Không tìm thấy NXB" });
        res.json({ message: "Đã cập nhật NXB", publisher });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * DELETE /api/publishers/:id
 * Xóa NXB (admin)
 */
router.delete("/:id", adminAuth, async (req, res) => {
    try {
        const publisher = await Publisher.findByIdAndDelete(req.params.id);
        if (!publisher) return res.status(404).json({ message: "Không tìm thấy NXB" });
        res.json({ message: "Đã xóa NXB" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
