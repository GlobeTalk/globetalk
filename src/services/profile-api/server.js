import express from "express";
import cors from "cors";  // ✅ ADD THIS!
import profileRoutes from "./routes/profileRoutes.js";

const app = express();
app.use(express.json()); // parse JSON bodies

// ✅ ADD CORS MIDDLEWARE:
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Mount profile routes
app.use("/api/profile", profileRoutes);

//test route
app.get("/", (req, res) => res.send("Server is running"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));