import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import userRoutes from "./src/services/auth/server/routes/users.js"; // ✅ ADD THIS!

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ✅ MIDDLEWARE:
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ✅ SERVE FRONTEND:
app.use("/scripts", express.static(path.join(__dirname, "src/frontend/scripts")));
app.use("/styles", express.static(path.join(__dirname, "src/frontend/styles")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ ADD ONLY AUTH API:
app.use("/api/users", userRoutes);

// ✅ Health check
app.get("/health", (req, res) => res.send("🚀 Frontend + Auth API LIVE!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT} with Auth API`));