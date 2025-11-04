import express from "express";
import jwt from "jsonwebtoken";
import NhanVien from "../models/NhanVien.js";

const router = express.Router();
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

//Đăng nhập nhân viên
router.post("/login", async (req, res) => {
    try {
        const { Email, MatKhau } = req.body;

        const admin = await NhanVien.findOne({ Email });
        if (!admin || !(await admin.matchPassword(MatKhau))) {
            return res.status(400).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        const token = generateToken(admin._id);
        res.json({ token, staff: admin });
    } catch (err) {
        res.status(500).json({ message: "Đã xảy ra lỗi khi đăng nhập tài khoản quản lý", err });
    }
})