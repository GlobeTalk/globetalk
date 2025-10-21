 // import express and other necessary modules
import express from "express";
import cors from "cors";
import userRouter from "./routes/users.js";

const app = express();

// ✅ Configure CORS properly
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "Auth API is live" });
});

// Main API routes
app.use("/api/users", userRouter);

// ✅ Optional: default route for Render testing
app.get("/", (req, res) => {
  res.send("GlobeTalk Auth API running successfully!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});