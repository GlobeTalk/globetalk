import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import authAPI from "./src/services/auth/server/index.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));


//Auth API
app.use("/api/auth", authAPI);

// Serve static assets from dist
app.use(express.static(path.join(__dirname, "dist")));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Frontend + API running on port ${PORT}`));
