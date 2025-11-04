import mongoose from "mongoose";

const borrowSchema = new mongoose.Schema(
    {
        MaDocGia: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DocGia",
            required: true,
        },
        MaSach: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true,
        },
        NgayMuon: { type: Date, default: Date.now },
        HanTra: { type: Date, required: true }, // thêm bắt buộc hạn trả
        NgayTra: { type: Date, default: null },
        TrangThai: {
            type: String,
            enum: ["chờ duyệt", "đang mượn", "đã trả", "từ chối"],
            default: "chờ duyệt",
        },
        TienPhat: { type: Number, default: 0 }, // số tiền phạt
        DaDongPhat: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model("Borrow", borrowSchema);
