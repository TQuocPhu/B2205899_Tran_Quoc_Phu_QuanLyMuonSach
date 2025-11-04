import jwt from "jsonwebtoken";
import DocGia from "../models/DocGia.js";
import NhanVien from "../models/NhanVien.js";

export const userAuth = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await DocGia.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "Không tìm thấy độc giả" });
        req.user = user;
        next();
    } catch {
        res.status(401).json({ message: "Token không hợp lệ" });
    }
};

export const adminAuth = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Chưa đăng nhập admin" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await NhanVien.findById(decoded.id);
        if (!admin) return res.status(404).json({ message: "Không tìm thấy nhân viên" });
        req.admin = admin;
        next();
    } catch {
        res.status(401).json({ message: "Token admin không hợp lệ" });
    }
};
