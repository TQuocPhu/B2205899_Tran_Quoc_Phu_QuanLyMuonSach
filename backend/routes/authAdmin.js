import express from "express";
import jwt from "jsonwebtoken";
import NhanVien from "../models/NhanVien.js";

const router = express.Router();
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

//Đăng nhập nhân viên
router.post("/login", async (req, res) => {
    try {
        const { Email, MatKhau } = req.body;

        // Kiểm tra đầu vào
        if (!Email || !MatKhau) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ Email và Mật khẩu!" });
        }

        // Tìm nhân viên theo email
        const admin = await admin.findOne({ Email });
        if (!admin) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        // Kiểm tra mật khẩu
        const isMatch = await admin.matchPassword(MatKhau);
        if (!isMatch) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        const token = generateToken(admin._id);
        const { MatKhau: _, ...adminData } = admin._doc; //ẩn trường mật khẩu
        res.json({ token, staff: adminData });
    } catch (err) {
        console.error("Lỗi đăng nhập:", err);
        res.status(500).json({ message: "Đã xảy ra lỗi khi đăng nhập tài khoản quản lý", err });
    }
})