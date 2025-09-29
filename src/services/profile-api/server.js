import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });
import express from "express";
import profileRoutes from "./routes/profileRoutes.js";

const app = express();
app.use(express.json()); // parse JSON bodies

// Mount profile routes
app.use("/api/profile", profileRoutes);

//test route
app.get("/", (req, res) => res.send("Server is running"));

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
