// === index.js ===
import express from "express";
import bodyParser from "body-parser";
import fs from "fs/promises";
import path from "path";
import cookieParser from "cookie-parser";
import admin from "firebase-admin";
import { fileURLToPath } from "url";

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// EJS config
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Firebase Admin init
const serviceAccountRaw = await fs.readFile(path.join(__dirname, "serviceAccountKey.json"), "utf-8");
const serviceAccount = JSON.parse(serviceAccountRaw);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware to verify Firebase token for protected routes
const verifyToken = async (req, res, next) => {
  const idToken = req.cookies?.token;
  if (!idToken) return res.redirect('/');

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.redirect('/');
  }
};

// Routes

// Login page
app.get("/", (req, res) => {
  res.render("login");
});

// Token verification
app.post("/verify-token", async (req, res) => {
  try {
    const decoded = await admin.auth().verifyIdToken(req.body.idToken);

    res.cookie("token", req.body.idToken, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: "Lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Token verification failed", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

// Dashboard (protected)
app.get("/dashboard", verifyToken, (req, res) => {
  res.render("dashboard", { user: req.user });
});

// Logout

app.get("/logout", (req, res) => {
  res.clearCookie("token", {
    path: "/",
  });
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`UV Control running on http://localhost:${PORT}`);
});