import express from "express";
import Borrow from "../models/Borrow.js";
import Book from "../models/Book.js";
import { userAuth, adminAuth } from "../middleware/auth.js";

const router = express.Router();

// Độc giả gửi yêu cầu mượn sách
router.post("/request", userAuth, async (req, res) => {
    try {
        const { sachId, hanTra } = req.body;
        const exist = await Borrow.findOne({
            MaDocGia: req.user._id,
            MaSach: sachId,
            TrangThai: { $in: ["chờ duyệt", "đang mượn"] },
        });
        if (exist) {
            return res.status(400).json({ message: "Bạn đã mượn hoặc đang chờ duyệt sách này" });
        }

        const borrow = await Borrow.create({
            MaDocGia: req.user._id,
            MaSach: sachId,
            HanTra: hanTra || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // mặc định 7 ngày
        });

        res.status(201).json({ message: "Đã gửi yêu cầu mượn sách", borrow });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Admin phê duyệt yêu cầu ---
router.put("/:id/approve", adminAuth, async (req, res) => {
    try {
        const borrow = await Borrow.findById(req.params.id);
        if (!borrow) {
            return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
        }

        borrow.TrangThai = "đang mượn";
        await borrow.save();

        res.json({ message: "Đã phê duyệt yêu cầu mượn sách", borrow });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Admin từ chối yêu cầu ---
router.put("/:id/reject", adminAuth, async (req, res) => {
    try {
        const borrow = await Borrow.findById(req.params.id);
        if (!borrow) {
            return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
        }

        borrow.TrangThai = "từ chối";
        await borrow.save();

        res.json({ message: "Đã từ chối yêu cầu mượn sách", borrow });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Trả sách ---
router.put("/:id/return", adminAuth, async (req, res) => {
    try {
        const borrow = await Borrow.findById(req.params.id).populate("MaSach").populate("MaDocGia");
        if (!borrow) return res.status(404).json({ message: "Không tìm thấy bản ghi mượn" });

        if (borrow.TrangThai !== "đang mượn") {
            return res.status(400).json({ message: "Sách này chưa được mượn hoặc đã trả" });
        }

        //Tính tiền phạt nếu trả sách muộn
        const ngayTra = new Date();
        const soNgayTre = Math.floor((ngayTra - borrow.HanTra) / (1000 * 60 * 60 * 24));
        const mucPhatMoiNgay = 10000;

        let tienPhat = 0;

        if (soNgayTre > 0) {
            tienPhat = soNgayTre * mucPhatMoiNgay;
        }

        borrow.TrangThai = "đã trả";
        borrow.NgayTra = ngayTra;
        borrow.TienPhat = tienPhat;
        await borrow.save();

        res.json({
            message: tienPhat
                ? `Đã trả sách, bị phạt ${tienPhat.toLocaleString()}đ (${soNgayTre} ngày trễ)`
                : "Đã trả sách đúng hạn",
            borrow,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Độc giả xem lịch sử mượn ---
router.get("/history", userAuth, async (req, res) => {
    try {
        const borrows = await Borrow.find({ MaDocGia: req.user._id })
            .populate("MaSach")
            .sort({ createdAt: -1 });
        res.json(borrows)
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Admin xem tất cả yêu cầu ---
router.get("/", adminAuth, async (req, res) => {
    try {
        const borrows = await Borrow.find()
            .populate("MaDocGia")
            .populate("MaSach")
            .sort({ createdAt: -1 });
        res.json(borrows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Đánh dấu đã đóng tiền phạt (Admin) ---
router.put("/:id/payfine", adminAuth, async (req, res) => {
    try {
        const borrow = await Borrow.findById(req.params.id);
        if (!borrow) return res.status(404).json({ message: "Không tìm thấy bản ghi" });
        if (borrow.TienPhat <= 0)
            return res.status(400).json({ message: "Không có tiền phạt để thanh toán" });

        borrow.DaDongPhat = true;
        await borrow.save();

        res.json({ message: "Đã đánh dấu thanh toán tiền phạt", borrow });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;