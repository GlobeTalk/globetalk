import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initFirebaseAdmin } from "../firebaseAdmin.js";
import userRoutes from "./routes/users.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Initialize Firebase Admin SDK
initFirebaseAdmin();

// Simple health check
app.get("/", (req, res) => {
  res.send("Globetalk Auth API is live ✅");
});

// API routes
app.use("/api/users", userRoutes);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Auth API running on port ${PORT}`));
