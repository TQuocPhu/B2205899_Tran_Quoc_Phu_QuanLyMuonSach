import mongoose from "mongoose";

const publisherSchema = new mongoose.Schema(
    {
        MaNXB: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        TenNXB: {
            type: String,
            required: true,
            trim: true,
        },
        DiaChi: String,
        DienThoai: String,
    },
    { timestamps: true }
);

export default mongoose.model("Publisher", publisherSchema);