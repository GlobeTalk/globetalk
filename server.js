import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import userRoutes from "./src/services/auth/server/routes/users.js"; 

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ✅ MIDDLEWARE:
app.use(cors());
app.use(express.json());

// ✅ SERVE BUILT FILES FROM dist/ (NOT src/):
app.use(express.static(path.join(__dirname, "dist")));

// ✅ SERVE SCRIPTS/STYLES FROM dist/:
app.use("/scripts", express.static(path.join(__dirname, "dist/scripts")));
app.use("/styles", express.static(path.join(__dirname, "dist/styles")));

// ✅ ROOT = dist/index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

// ✅ API (unchanged):
app.use("/api/users", userRoutes);

// ✅ Health check
app.get("/health", (req, res) => res.send("🚀 Frontend + Auth API LIVE!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT} with dist/`));