import express from "express";
import cors from "cors";
import admin from "firebase-admin";

// ---------------------
// Initialize Firebase Admin using environment variable
// ---------------------
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("Missing FIREBASE_SERVICE_ACCOUNT environment variable");
  process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ---------------------
// Express app setup
// ---------------------
const app = express();
const PORT = process.env.PORT || 5000; // Render assigns port automatically

app.use(cors());
app.use(express.json());

// ---------------------
// /report endpoint
// ---------------------
app.post("/report", async (req, res) => {
  const { reporterUid, reportedUid, reason } = req.body;
  if (!reporterUid || !reportedUid || !reason) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const docRef = await db.collection("reports").add({
      reporterUid,
      reportedUid,
      reason,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ ok: true, id: docRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save report" });
  }
});

// ---------------------
// /block endpoint
// ---------------------
app.post("/block", async (req, res) => {
  const { uid, targetUid } = req.body;
  if (!uid || !targetUid) return res.status(400).json({ error: "Missing fields" });

  try {
    await db.collection("users").doc(uid).set({
      blocked: admin.firestore.FieldValue.arrayUnion(targetUid)
    }, { merge: true });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to block user" });
  }
});

// ---------------------
// /unblock endpoint
// ---------------------
app.post("/unblock", async (req, res) => {
  const { uid, targetUid } = req.body;
  if (!uid || !targetUid) return res.status(400).json({ error: "Missing fields" });

  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      await userRef.set({ blocked: [] });
    }

    await userRef.update({
      blocked: admin.firestore.FieldValue.arrayRemove(targetUid)
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to unblock user" });
  }
});

// ---------------------
// /listBlocked endpoint
// ---------------------
app.get("/listBlocked/:uid", async (req, res) => {
  const { uid } = req.params;
  if (!uid) return res.status(400).json({ error: "Missing uid" });

  try {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      await userRef.set({ blocked: [] });
      return res.json({ blocked: [] });
    }

    const blocked = userDoc.data().blocked || [];
    res.json({ blocked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch blocked users" });
  }
});

// ---------------------
// Start server
// ---------------------
app.listen(PORT, () => {
  console.log(`Moderation API running on port ${PORT}`);
});
