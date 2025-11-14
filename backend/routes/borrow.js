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

        const book = await Book.findById(sachId);
        if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });

        if (book.SoQuyen <= 0) {
            return res.status(400).json({ message: "Sách đã hết, không thể gửi yêu cầu mượn" });
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

        // Giảm số lượng sách ngay trong DB
        // const book = await Book.findByIdAndUpdate(
        //     borrow.MaSach,
        //     { $inc: { SoQuyen: -1 } },
        //     { new: true }
        // );

        // console.log("Kết quả cập nhật sách:", book);

        // if (!book) return res.status(404).json({ message: "Sách đã hết" });

        const updateResult = await Book.updateOne(
            { _id: borrow.MaSach }, // Dùng ID của sách từ bản ghi mượn
            { $inc: { SoQuyen: -1 } }
        );

        if (updateResult.modifiedCount === 0) {
            const currentBook = await Book.findById(borrow.MaSach);

            if (currentBook && currentBook.SoQuyen <= 0) {
                return res.status(400).json({ message: "Sách đã hết, không thể mượn" });
            }

            return res.status(404).json({ message: "Không tìm thấy tài liệu sách để cập nhật" });
        }

        borrow.TrangThai = "đang mượn";
        await borrow.save();

        const book = await Book.findById(borrow.MaSach);

        res.json({ message: "Đã phê duyệt yêu cầu mượn sách", borrow, book });
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

        // Tăng số lượng sách
        const updatedBook = await Book.findByIdAndUpdate(
            borrow.MaSach._id,
            { $inc: { SoQuyen: 1 } },
            { new: true }
        );

        borrow.TrangThai = "đã trả";
        borrow.NgayTra = ngayTra;
        borrow.TienPhat = tienPhat;
        await borrow.save();

        borrow.MaSach = updatedBook;

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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;
        const q = req.query.q?.trim() || "";

        // Lọc theo người dùng hiện tại
        const match = { MaDocGia: req.user._id };

        // Nếu có từ khóa tìm kiếm => lọc theo tên sách
        if (q) {
            const books = await Book.find({
                TenSach: { $regex: q, $options: "i" },
            }).select("_id");
            const bookIds = books.map((b) => b._id);
            match.MaSach = { $in: bookIds };
        }

        // Tổng số bản ghi thỏa mãn điều kiện
        const total = await Borrow.countDocuments(match);

        const borrows = await Borrow.find(match)
            .populate("MaSach")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            items: borrows,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Admin xem tất cả yêu cầu ---
// router.get("/", adminAuth, async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;
//         const q = req.query.q?.trim() || "";

//         // Nếu có tìm kiếm theo tên sách hoặc tên độc giả
//         const filter = q
//             ? {
//                 $or: [
//                     { TrangThai: { $regex: q, $options: "i" } },
//                     { "MaSach.TenSach": { $regex: q, $options: "i" } },
//                     { "MaDocGia.Ten": { $regex: q, $options: "i" } },
//                     { "MaDocGia.HoLot": { $regex: q, $options: "i" } },
//                 ],
//             }
//             : {};

//         // Tổng số bản ghi
//         const total = await Borrow.countDocuments();

//         const borrows = await Borrow.find()
//             .populate("MaDocGia")
//             .populate("MaSach")
//             .sort({ createdAt: -1 })
//             .sort({ createdAt: -1 })
//             .skip(skip)
//             .limit(limit);

//         // res.json(borrows);

//         res.json({
//             items: borrows,
//             total,
//             page,
//             totalPages: Math.ceil(total / limit),
//         });
//     } catch (err) {
//         console.error("Lỗi khi lấy danh sách borrow:", err);
//         res.status(500).json({ message: err.message });
//     }
// });
// --- Admin xem tất cả yêu cầu (phân trang + tìm kiếm) ---
router.get("/", adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const q = req.query.q?.trim() || "";

        // Pipeline cho aggregate
        const pipeline = [
            {
                $lookup: {
                    from: "docgias", // tên collection của DocGia
                    localField: "MaDocGia",
                    foreignField: "_id",
                    as: "MaDocGia",
                },
            },
            { $unwind: "$MaDocGia" },
            {
                $lookup: {
                    from: "books", // tên collection của Book
                    localField: "MaSach",
                    foreignField: "_id",
                    as: "MaSach",
                },
            },
            { $unwind: "$MaSach" },
        ];

        // Nếu có từ khóa tìm kiếm
        if (q) {
            pipeline.push({
                $match: {
                    $or: [
                        { "MaDocGia.Ten": { $regex: q, $options: "i" } },
                        { "MaDocGia.HoLot": { $regex: q, $options: "i" } },
                        { "MaSach.TenSach": { $regex: q, $options: "i" } },
                        { TrangThai: { $regex: q, $options: "i" } },
                    ],
                },
            });
        }

        // Tổng số bản ghi
        const totalResult = await Borrow.aggregate([
            ...pipeline,
            { $count: "total" },
        ]);
        const total = totalResult[0]?.total || 0;

        // Lấy danh sách có phân trang
        const borrows = await Borrow.aggregate([
            ...pipeline,
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ]);

        res.json({
            items: borrows,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        console.error("Lỗi khi lấy danh sách borrow:", err);
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

// Kiểm tra xem user đã mượn hoặc đang chờ duyệt sách này chưa
router.get("/check", userAuth, async (req, res) => {
    try {
        const { sachId } = req.query;

        // Tìm trong bảng Borrow theo người dùng hiện tại và sách
        const borrow = await Borrow.findOne({
            MaDocGia: req.user._id,
            MaSach: sachId,
            TrangThai: { $in: ["chờ duyệt", "đang mượn"] },
        });

        if (borrow) {
            return res.json({
                exists: true,
                status: borrow.TrangThai,
                borrowId: borrow._id,
            });
        } else {
            return res.json({ exists: false });
        }
    } catch (err) {
        console.error("Lỗi khi kiểm tra trạng thái mượn:", err);
        res.status(500).json({ message: err.message });
    }
});

export default router;