import { admin } from "../firebaseAdmin.js";

// Penpal delay in milliseconds
const PENPAL_DELAY = 60 * 1000; // 1 minute for demo

// Default pagination values
const DEFAULT_PAGE_SIZE = 20;

const db = admin.firestore();

// Helper to find or create chat between two users
async function getOrCreateChat(uid1, uid2) {
  // Find existing chat
  const chatQuery = await db
    .collection("chats")
    .where("participants", "array-contains", uid1)
    .get();

  let chatDoc = chatQuery.docs.find(doc => {
    const participants = doc.data().participants;
    return participants.length === 2 && participants.includes(uid2);
  });

  if (chatDoc) {
    return chatDoc;
  }

  // Create new chat
  const newChatRef = await db.collection("chats").add({
    participants: [uid1, uid2],
    lastUpdated: new Date(),
  });
  return await newChatRef.get();
}

// Send message
export async function sendMessage(req, res) {
  console.log("sendMessage called");
  const { recipientId, text } = req.body;
  const senderId = req.user.uid;

  if (!recipientId || !text) {
    return res.status(400).json({ error: "recipientId and text are required" });
  }

  try {
    const chatDoc = await getOrCreateChat(senderId, recipientId);

    const message = {
      senderId,
      text,
      timestamp: new Date(),
    };
    console.log(senderId, "sending message to", recipientId, "in chat", chatDoc.id, ":", text);
    await db.collection("chats")
      .doc(chatDoc.id)
      .collection("messages")
      .add(message);

    // Update lastUpdated for chat
    await db.collection("chats").doc(chatDoc.id).update({
      lastUpdated: new Date(),
    });

    res.json({ success: true, message, chatId: chatDoc.id });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
}

// Fetch messages with penpal delay and pagination
export async function fetchMessages(req, res) {
  console.log("fetchMessages called");
  const { otherUserId } = req.params; // the user you want to chat with
  const currentUserId = req.user.uid;
  const pageSize = parseInt(req.query.pageSize) || DEFAULT_PAGE_SIZE;
  const pageToken = req.query.pageToken || null; // message timestamp to start after

  try {
    const chatQuery = await db
      .collection("chats")
      .where("participants", "array-contains", currentUserId)
      .get();

    const chatDoc = chatQuery.docs.find(doc => doc.data().participants.includes(otherUserId));
    if (!chatDoc) return res.json({ success: true, messages: [], nextPageToken: null });

    let messagesRef = db
      .collection("chats")
      .doc(chatDoc.id)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .limit(pageSize + 1); // fetch one extra for pagination

    if (pageToken) {
      messagesRef = messagesRef.startAfter(new Date(Number(pageToken)));
    }

    const snapshot = await messagesRef.get();
    const now = Date.now();
    let docs = snapshot.docs;

    // Only apply penpal delay to messages received by the current user
    let messages = docs
      .map(doc => doc.data())
      .filter(msg => {
        // If the message was sent by the current user, always show it
        if (msg.senderId === currentUserId) return true;
        // Otherwise, apply the penpal delay
        return now - msg.timestamp.toMillis() >= PENPAL_DELAY;
      });

    let nextPageToken = null;
    if (messages.length > pageSize) {
      // There is another page
      const lastMsg = messages[pageSize - 1];
      nextPageToken = lastMsg.timestamp.toMillis();
      messages = messages.slice(0, pageSize);
    }

    // Return messages in ascending order (oldest first)
    messages = messages.reverse();

    res.json({ success: true, messages, nextPageToken });
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}

// Fetch latest chats for a user (with pagination)
export async function fetchLatestChats(req, res) {
  console.log("fetchLatestChats called");
  const currentUserId = req.user.uid;
  const pageSize = parseInt(req.query.pageSize) || DEFAULT_PAGE_SIZE;
  const pageToken = req.query.pageToken || null; // lastUpdated timestamp to start after

  console.log("[fetchLatestChats] currentUserId:", currentUserId);
  console.log("[fetchLatestChats] pageSize:", pageSize);
  console.log("[fetchLatestChats] pageToken:", pageToken);

  try {
    let chatsRef = db
      .collection("chats")
      .where("participants", "array-contains", currentUserId)
      .orderBy("lastUpdated", "desc")
      .limit(pageSize + 1); // fetch one extra for pagination

    if (pageToken) {
      console.log("[fetchLatestChats] Using startAfter with:", new Date(Number(pageToken)));
      chatsRef = chatsRef.startAfter(new Date(Number(pageToken)));
    }

    const snapshot = await chatsRef.get();
    console.log("[fetchLatestChats] Query returned", snapshot.docs.length, "docs");
    let docs = snapshot.docs;
    let nextPageToken = null;
    if (docs.length > pageSize) {
      const lastChat = docs[pageSize - 1];
      nextPageToken = lastChat.data().lastUpdated.toMillis();
      console.log("[fetchLatestChats] More pages available, nextPageToken:", nextPageToken);
      docs = docs.slice(0, pageSize);
    }

    // For each chat, get the latest message (if any)
    const chats = await Promise.all(
      docs.map(async doc => {
        const chatData = doc.data();
        console.log(`[fetchLatestChats] Chat doc: id=${doc.id}, participants=`, chatData.participants, ', lastUpdated=', chatData.lastUpdated);
        const messagesSnap = await db
          .collection("chats")
          .doc(doc.id)
          .collection("messages")
          .orderBy("timestamp", "desc")
          .limit(1)
          .get();
        const lastMessage = messagesSnap.docs.length > 0 ? messagesSnap.docs[0].data() : null;
        if (lastMessage) {
          console.log(`[fetchLatestChats] Last message for chat ${doc.id}:`, lastMessage);
        } else {
          console.log(`[fetchLatestChats] No messages for chat ${doc.id}`);
        }
        return {
          chatId: doc.id,
          participants: chatData.participants,
          lastUpdated: chatData.lastUpdated,
          lastMessage,
        };
      })
    );

    console.log("[fetchLatestChats] Final chats array:", chats);
    res.json({ success: true, chats, nextPageToken });
  } catch (err) {
    console.error("[fetchLatestChats] Error:", err);
    res.status(500).json({ error: "Failed to fetch latest chats" });
  }
}
