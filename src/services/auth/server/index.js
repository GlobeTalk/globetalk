import express from "express";
import cors from "cors";
//import admin from "../../firebaseAdmin.js"; // Import initialized admin
import userRouter from "./routes/users.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from project root
const envPath = path.resolve(__dirname, "../../../.env");
console.log("Attempting to load .env from:", envPath);
dotenv.config({ path: envPath });

console.log("FIREBASE_SERVICE_ACCOUNT:", !!process.env.FIREBASE_SERVICE_ACCOUNT);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Auth API is live" });
});

app.use("/api/users", userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});