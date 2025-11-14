// seedAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import NhanVien from "./models/NhanVien.js"; // sửa đường dẫn nếu khác

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quanlymuonsach";

mongoose.connect(MONGO_URI)
    .then(() => console.log("Kết nối MongoDB thành công"))
    .catch((err) => console.error("Lỗi kết nối MongoDB:", err));

const createAdmin = async () => {
    try {
        const exist = await NhanVien.findOne({ Email: "admin@gmail.com" });
        if (exist) {
            console.log("Admin đã tồn tại:", exist.Email);
            return process.exit();
        }

        const admin = new NhanVien({
            MSNV: "ADMIN001",
            HoTen: "Quản Trị",
            Email: "admin@gmail.com",
            MatKhau: "admin123", // hash tự động nhờ pre-save
            ChucVu: "admin",
        });

        await admin.save();
        console.log("Admin tạo thành công:", admin.Email);
        process.exit();
    } catch (err) {
        console.error("Lỗi tạo admin:", err);
        process.exit(1);
    }
};

createAdmin();
