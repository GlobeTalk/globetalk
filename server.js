import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (adjust if needed)
app.use(cors({ origin: "*", credentials: true }));

// Parse JSON bodies
app.use(express.json());

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your built frontend
const distPath = path.join(__dirname, "dist");

// Serve static files from dist folder
app.use(express.static(distPath));

// Catch-all route to serve index.html for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
