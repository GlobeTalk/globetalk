 // import express and other necessary modules
import express from "express";
import cors from "cors";
import userRouter from "./routes/users.js";

const app = express();

// ✅ Configure CORS properly
app.use(cors({
  origin: [
    "https://globetalk.github.io/globetalk/",  // our Azure-deployed frontend
    "http://localhost:5173"                 // optional: for local testing
  ],
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

export default app;
