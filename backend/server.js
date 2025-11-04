import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authUserRoutes from "./routes/authUser.js";
import authAdminRoutes from "./routes/authAdmin.js";
import bookRoutes from "./routes/books.js";
import publisherRoutes from "./routes/publishers.js";
import borrowRoutes from "./routes/borrow.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use("/api/auth", authUserRoutes);
app.use("/api/admin/auth", authAdminRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/publishers", publisherRoutes);
app.use("/api/borrow", borrowRoutes);

// --- MongoDB Connection ---
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error(err));

// --- Run Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
