// routes/chat.js
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { sendMessage, fetchMessages, fetchLatestChats } from "../controllers/messageController.js";

const router = express.Router();

// Send a message to another user
router.post("/send", verifyToken, sendMessage);

// Fetch messages with a specific user (penpal delay + pagination)
router.get("/fetch/:otherUserId", verifyToken, fetchMessages);

// Fetch latest chats for the current user (with pagination)
router.get("/latest", verifyToken, fetchLatestChats);

export default router;
