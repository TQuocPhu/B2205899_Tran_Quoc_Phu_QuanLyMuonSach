import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const nhanVienSchema = new mongoose.Schema(
    {
        MSNV: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        HoTen: {
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
        ChucVu: {
            type: String,
            enum: ["thuthu", "quanly", "admin"],
            default: "thuthu",
        },
    },
    { timestamps: true }
);

nhanVienSchema.pre("save", async function (next) {
    if (!this.isModified("MatKhau")) return next();
    const salt = await bcrypt.genSalt(10);
    this.MatKhau = await bcrypt.hash(this.MatKhau, salt);
    next();
});

nhanVienSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.MatKhau);
};

export default mongoose.model("NhanVien", nhanVienSchema);
