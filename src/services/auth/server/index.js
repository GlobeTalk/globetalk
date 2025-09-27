//first ensure  you import dotenv at the very top because it needs to load env variables before anything else
import dotenv from "dotenv";
dotenv.config();

// import express and other necessary modules
import express from "express";
import cors from "cors";  
import { initFirebaseAdmin } from "../../../firebaseAdmin.js"; 
// Initialize Firebase Admin
initFirebaseAdmin();
import userRouter from "./routes/users.js"; 



//console.log("Has service account?", !!process.env.FIREBASE_SERVICE_ACCOUNT);




const app = express();
app.use(cors()); // enable CORS for all routes
app.use(express.json());

//Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Auth Api is live" });
});

// Mount routes
app.use("/api/users", userRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});