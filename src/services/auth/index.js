import express from "express";
import admin from "../FirebaseAdmin.js";

// ✅ Make sure you initialize admin in a separate file (see below)
const router = express.Router();

router.post("/login", async (req, res) => {
  const { idToken } = req.body || {};

  if (!idToken) {
    return res.status(400).json({ error: "Missing idToken" });
  }

  try {
    // ✅ Verify token with Firebase Admin
    const decoded = await admin.auth().verifyIdToken(idToken);

    // For now, just return the decoded info
    return res.status(200).json({
      uid: decoded.uid,
      email: decoded.email || null,
    });
  } catch (err) {
    // If verification fails, respond with 401
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
