import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import fs from "fs/promises";
import path from "path";
import cookieParser from "cookie-parser";
import admin from "firebase-admin";
import { fileURLToPath } from "url";

// Setup for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static assets
app.use(express.static('public'));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Firebase Admin SDK
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Verify token middleware
const verifyToken = async (req, res, next) => {
  const idToken = req.cookies?.token;

  if (!idToken) return res.redirect("/");

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.clearCookie("token");
    return res.redirect("/");
  }
};

// Routes
app.get('/info', (req, res) => res.render('info'));
app.get('/about', (req, res) => res.render('about'));
app.get('/shop', (req, res) => res.render('shop'));
app.get("/", (req, res) => res.render("login"));

app.post("/verify-token", async (req, res) => {
  try {
    const decoded = await admin.auth().verifyIdToken(req.body.idToken);

    res.cookie("token", req.body.idToken, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: "Lax",
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("verify-token error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

app.get("/dashboard", verifyToken, (req, res) => {
  res.render("dashboard", { user: req.user });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ UV Control running on port ${PORT}`);
});