const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const ROOT_DIR = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT_DIR, "shared", "data");
const CONFIG_DIR = path.join(ROOT_DIR, "shared", "config");
const AUTH_FILE = path.join(__dirname, "config", "auth.json");
const MAIL_FILE = path.join(__dirname, "config", "mail.json");
const UPLOADS_DIR = path.join(ROOT_DIR, "portfolio", "assets", "uploads");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_FILES = [
  "profile.json", "projects.json", "skills.json", "certificates.json",
  "gallery.json", "videos.json", "blog.json", "design-tokens.json",
  "site-settings.json", "feedback.json", "visitors.json", "clicks.json", "visits.json"
];

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`)
});
const uploadDisk = multer({ storage: diskStorage, limits: { fileSize: 50 * 1024 * 1024 } });

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: "amit-portfolio-os-secret-key-change-this-later",
  resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

function isAuthenticated(req) { return req.session && req.session.loggedIn === true; }
function requireAuth(req, res, next) {
  if (isAuthenticated(req)) return next();
  if (req.originalUrl.startsWith("/api/")) return res.status(401).json({ error: "Not authenticated." });
  return res.redirect("/studio/login.html");
}

function readArrayFileSafe(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (Array.isArray(parsed)) return parsed;
    console.warn(`⚠️ ${filePath} did not contain an array (found ${typeof parsed}) — resetting to [].`);
    return [];
  } catch (err) {
    console.warn(`⚠️ ${filePath} had invalid JSON — resetting to [].`);
    return [];
  }
}

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  try {
    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
    if (username !== authData.username) return res.status(401).json({ error: "Invalid username or password." });
    if (!bcrypt.compareSync(password, authData.passwordHash)) return res.status(401).json({ error: "Invalid username or password." });
    req.session.loggedIn = true; req.session.username = username;
    res.json({ success: true });
  } catch (err) { console.error("LOGIN ERROR:", err); res.status(500).json({ error: "Login failed.", details: err.message }); }
});
app.post("/api/auth/logout", (req, res) => { req.session.destroy(() => res.json({ success: true })); });
app.get("/api/auth/status", (req, res) => { res.json({ loggedIn: isAuthenticated(req) }); });

app.post("/api/upload", requireAuth, uploadDisk.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file received." });
  res.json({ success: true, path: `assets/uploads/${req.file.filename}` });
});

app.post("/api/contact/send", upload.single("attachment"), async (req, res) => {
  try {
    const { visitorEmail, subject, message } = req.body;
    if (!visitorEmail || !message) return res.status(400).json({ error: "Email and message are required." });
    if (!fs.existsSync(MAIL_FILE)) return res.status(500).json({ error: "Mail config missing." });
    const mailConfig = JSON.parse(fs.readFileSync(MAIL_FILE, "utf-8"));
    if (!mailConfig.gmailAppPassword || mailConfig.gmailAppPassword.includes("PUT_YOUR")) {
      return res.status(500).json({ error: "Email not configured yet." });
    }
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: mailConfig.gmailUser, pass: mailConfig.gmailAppPassword } });
    const mailOptions = {
      from: mailConfig.gmailUser, to: mailConfig.gmailUser, replyTo: visitorEmail,
      subject: `[Portfolio Contact] ${subject || "New message"}`,
      text: `From: ${visitorEmail}\n\n${message}`, attachments: []
    };
    if (req.file) mailOptions.attachments.push({ filename: req.file.originalname, content: req.file.buffer });
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) { console.error("CONTACT SEND ERROR:", err); res.status(500).json({ error: "Failed to send message.", details: err.message }); }
});

app.post("/api/public/feedback", (req, res) => {
  try {
    const { name, message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required." });
    const filePath = path.join(DATA_DIR, "feedback.json");
    const list = readArrayFileSafe(filePath);
    list.unshift({ id: `feedback-${Date.now()}`, name: name || "Anonymous", message, date: new Date().toISOString() });
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8");
    console.log("✅ Feedback saved:", name || "Anonymous");
    res.json({ success: true });
  } catch (err) {
    console.error("FEEDBACK SAVE ERROR:", err);
    res.status(500).json({ error: "Failed to save feedback.", details: err.message });
  }
});

app.post("/api/public/visitor", (req, res) => {
  try {
    const { name, email, purpose } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email required." });
    const filePath = path.join(DATA_DIR, "visitors.json");
    const list = readArrayFileSafe(filePath);
    list.unshift({ id: `visitor-${Date.now()}`, name, email, purpose: purpose || "", date: new Date().toISOString() });
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8");
    console.log("✅ Visitor saved:", name);
    res.json({ success: true });
  } catch (err) {
    console.error("VISITOR SAVE ERROR:", err);
    res.status(500).json({ error: "Failed to save visitor.", details: err.message });
  }
});

app.post("/api/track/click", (req, res) => {
  try {
    const { type } = req.body;
    if (!type) return res.status(400).json({ error: "type is required." });
    const filePath = path.join(DATA_DIR, "clicks.json");
    const list = readArrayFileSafe(filePath);
    list.push({ type, date: new Date().toISOString() });
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8");
    res.json({ success: true });
  } catch (err) { console.error("CLICK TRACK ERROR:", err); res.status(500).json({ error: "Failed to log click.", details: err.message }); }
});

app.post("/api/track/visit", (req, res) => {
  try {
    const filePath = path.join(DATA_DIR, "visits.json");
    const list = readArrayFileSafe(filePath);
    list.push({ date: new Date().toISOString() });
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8");
    res.json({ success: true });
  } catch (err) { console.error("VISIT TRACK ERROR:", err); res.status(500).json({ error: "Failed to log visit.", details: err.message }); }
});

app.get("/studio/login.html", (req, res) => res.sendFile(path.join(ROOT_DIR, "studio", "login.html")));
app.use("/studio/css", express.static(path.join(ROOT_DIR, "studio", "css")));
app.use("/studio/js", express.static(path.join(ROOT_DIR, "studio", "js")));
app.use("/studio", requireAuth, express.static(path.join(ROOT_DIR, "studio")));
app.use("/api/data", requireAuth);
app.use("/portfolio", express.static(path.join(ROOT_DIR, "portfolio")));
app.use("/shared", express.static(path.join(ROOT_DIR, "shared")));
app.get("/", (req, res) => res.redirect("/portfolio/index.html"));

function isAllowedFile(fileName) { return ALLOWED_FILES.includes(fileName); }
function getFilePath(fileName) { return fileName === "design-tokens.json" ? path.join(CONFIG_DIR, fileName) : path.join(DATA_DIR, fileName); }
function readDataFile(fileName) { return JSON.parse(fs.readFileSync(getFilePath(fileName), "utf-8")); }
function writeDataFile(fileName, data) { fs.writeFileSync(getFilePath(fileName), JSON.stringify(data, null, 2), "utf-8"); }

app.get("/api/data/:file", (req, res) => {
  const { file } = req.params;
  if (!isAllowedFile(file)) return res.status(403).json({ error: "Not accessible." });
  try { res.json(readDataFile(file)); } catch (err) { res.status(500).json({ error: `Read failed`, details: err.message }); }
});
app.put("/api/data/:file", (req, res) => {
  const { file } = req.params;
  if (!isAllowedFile(file)) return res.status(403).json({ error: "Not accessible." });
  try { writeDataFile(file, req.body); res.json({ success: true }); } catch (err) { res.status(500).json({ error: `Write failed`, details: err.message }); }
});
app.post("/api/data/:file/item", (req, res) => {
  const { file } = req.params;
  if (!isAllowedFile(file)) return res.status(403).json({ error: "Not accessible." });
  try {
    const data = readArrayFileSafe(getFilePath(file));
    const newItem = { id: `${file.replace(".json", "")}-${Date.now()}`, ...req.body };
    data.push(newItem); writeDataFile(file, data);
    res.json({ success: true, item: newItem });
  } catch (err) { res.status(500).json({ error: "Add failed", details: err.message }); }
});
app.put("/api/data/:file/item/:id", (req, res) => {
  const { file, id } = req.params;
  if (!isAllowedFile(file)) return res.status(403).json({ error: "Not accessible." });
  try {
    const data = readArrayFileSafe(getFilePath(file));
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) return res.status(404).json({ error: "Not found." });
    data[index] = { ...data[index], ...req.body, id };
    writeDataFile(file, data);
    res.json({ success: true, item: data[index] });
  } catch (err) { res.status(500).json({ error: "Update failed", details: err.message }); }
});
app.delete("/api/data/:file/item/:id", (req, res) => {
  const { file, id } = req.params;
  if (!isAllowedFile(file)) return res.status(403).json({ error: "Not accessible." });
  try {
    const data = readArrayFileSafe(getFilePath(file));
    writeDataFile(file, data.filter((item) => item.id !== id));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Delete failed", details: err.message }); }
});

app.listen(PORT, () => { console.log(`✅ Backend running at http://localhost:${PORT}`); });