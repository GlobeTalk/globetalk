import express from "express";
import { saveUserProfile, getUserProfile, updateUserProfile } from "../services/profile.js";
import admin from "../services/FirebaseAdmin.js";

const router = express.Router();

// Middleware to verify Firebase ID token
async function authMiddleware(req, res, next) {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.uid = decoded.uid;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Apply middleware to all profile routes
router.use(authMiddleware);

// GET /api/profile
router.get("/", async (req, res) => {
  const profile = await getUserProfile(req.uid);
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  res.json(profile);
});

// POST /api/profile
router.post("/", async (req, res) => {
  const success = await saveUserProfile(req.uid, req.body);
  if (success) return res.json({ message: "Profile saved" });
  res.status(500).json({ error: "Failed to save profile" });
});

// PATCH /api/profile
router.patch("/", async (req, res) => {
  const success = await updateUserProfile(req.uid, req.body);
  if (success) return res.json({ message: "Profile updated" });
  res.status(500).json({ error: "Failed to update profile" });
});

export default router;
