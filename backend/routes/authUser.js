import express from "express";
import jwt from "jsonwebtoken";
import DocGia from "../models/DocGia.js";

const router = express.Router();
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

//Đăng ký
router.post("/register", async (req, res) => {
    try {
        const { MaDocGia, HoLot, Ten, Email, MatKhau, SoDienThoai } = req.body
        const existEmail = await DocGia.findOne({ Email });
        if (existEmail) return res.status(400).json({ message: "Email đã tồn tại!" });
        const existPhone = await DocGia.findOne({ SoDienThoai });
        if (existPhone) return res.status(400).json({ message: "Số điện thoại đã tồn tại!" });

        const user = await DocGia.create({ MaDocGia, HoLot, Ten, Email, MatKhau });
        res.status(201).json({ message: "Đăng ký thành công", user });
    } catch (err) {
        res.status(500).json({ message: "Đã xảy ra lỗi trong đăng ký độc giả ", err })
    }
});

//Đăng nhập
router.post("/login", async (req, res) => {
    try {
        const { Email, MatKhau } = req.body;
        const user = await DocGia.findOne({ Email });
        if (!user || !(await user.matchPassword(MatKhau))) {
            return res.status(400).json({ message: "Email hoặc mật không không đúng!" });
        }

        const token = generateToken(user._id);
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ message: "Đã có lỗi trong quá trình đăng nhập độc giả ", err });
    }
});

export default router;