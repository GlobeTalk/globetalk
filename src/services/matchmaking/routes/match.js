import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getRandomMatch } from "../controllers/matchController.js";

const router = express.Router();

// POST /api/match
router.post("/", verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const { language, region, interest } = req.body;

  if (!language || !region || !interest) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const match = await getRandomMatch(userId, { language, region, interest });
    if (!match) {
      return res.status(404).json({ message: "No match found" });
    }
    res.json({ match });
  } catch (err) {
    console.error("Matchmaking error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
