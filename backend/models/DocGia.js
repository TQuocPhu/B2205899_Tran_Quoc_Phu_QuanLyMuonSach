import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const docGiaSchema = new mongoose.Schema(
    {
        MaDocGia: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        HoLot: {
            type: String,
            required: true,
            trim: true,
        },
        Ten: {
            type: String,
            required: true,
            trim: true,
        },
        Email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        MatKhau: {
            type: String,
            required: true,
            minlength: 6,
        },
        NgaySinh: Date,
        DiaChi: String,
        SoDienThoai: String,
    },
    { timestamps: true }
);

// Mã hóa mật khẩu trước khi lưu
docGiaSchema.pre("save", async function (next) {
    if (!this.isModified("MatKhau")) return next();
    const salt = await bcrypt.genSalt(10);
    this.MatKhau = await bcrypt.hash(this.MatKhau, salt);
    next();
});

// So khớp mật khẩu khi đăng nhập
docGiaSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.MatKhau);
};

export default mongoose.model("DocGia", docGiaSchema);
