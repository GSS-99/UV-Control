import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDw-cQW1UQp9Qom0R4nFnksx66xlghgTy8",
  authDomain: "uv-control.firebaseapp.com",
  projectId: "uv-control",
  storageBucket: "uv-control.appspot.com",
  messagingSenderId: "1066833623282",
  appId: "1:1066833623282:web:b65c79cb811a9ace36386b",
  measurementId: "G-NTKJD6LLN0"
};

// ✅ Check if Firebase app already exists
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "/logout";
  });
}
