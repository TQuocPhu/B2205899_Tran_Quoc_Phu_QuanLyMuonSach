import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
    {
        MaSach: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        TenSach: {
            type: String,
            required: true,
            trim: true,
        },
        TacGia: {
            type: String,
            required: true,
            trim: true,
        },
        NamXuatBan: { type: Number, min: 1000, max: new Date().getFullYear() },
        SoQuyen: { type: Number, default: 1 },
        MaNXB: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Publisher",
            required: true,
        },
        HinhAnh: { type: String, trim: true },
    },
    { timestamps: true }
);

export default mongoose.model("Book", bookSchema);