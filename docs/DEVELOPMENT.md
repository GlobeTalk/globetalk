# 🛠️ GlobeTalk Development Guide

## 1. Setting up the Development Database
GlobeTalk uses **Firebase Firestore**, so no local DB is needed.
Steps:
1. Ask the project admin for the Firebase **config object**.
2. Create `src/firebase.js` with this content:
   ```js
   import { initializeApp } from "firebase/app";
   import { getFirestore } from "firebase/firestore";

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };

   const app = initializeApp(firebaseConfig);
   export const db = getFirestore(app);
    ```
3. Verify connection by running the app locally.

---

## 2. Running the Development API Locally
- **Current setup**: No dedicated backend API. Frontend talks directly to Firebase.

---
## 3. Running the Frontend Locally
 1. **Clone repo**:
    ``` bash
    git clone https://github.com/your-org/globetalk.git
    cd globetalk
    ```
 2. **Install dependencies:**
    ``` bash
    npm install
    ```
 3. **Start dev server:**
    ``` bash
    npm run dev
    ```
---
# 4. Running Tests (Jest)
We use **Jest** for unit testing.

**Setup:**
- Install Jest (if not installed):
    ``` bash
    npm install --save-dev jest
    ```
- Add to **package.json**:
    ```json
    "scripts": {
    "test": "jest"
    }
    ```
- Running Tests
    ```bash
    npm test
    ```
    

