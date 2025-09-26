import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { userExists, createUser } from "../controllers/userController.js";

const router = express.Router();

// GET /api/users/:uid/exists - check if user exists
router.get("/:uid/exists", verifyToken, async (req, res) => {
  const { uid } = req.params;
  try {
    const exists = await userExists(uid);
    res.json({ exists });
  } catch (err) {
    console.error("Error checking user existence:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/users - create a new user
router.post("/", verifyToken, async (req, res) => {
  const { uid, email, displayName } = req.body;
  if (!uid || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = await createUser({ uid, email, displayName });
    res.status(201).json({ user });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
