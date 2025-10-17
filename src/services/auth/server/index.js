
// import express and other necessary modules
import express from "express";
import cors from "cors";
import userRouter from "./routes/users.js";


const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Auth API is live" });
});

app.use("/api/users", userRouter);

export default app;