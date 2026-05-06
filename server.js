const express = require("express");
const fs = require("fs");
const path = require("path");
const session = require("express-session");

const app = express();

const PORT = process.env.PORT || 80;
const OWNER_USER = "ptuser";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "winkleperi123";

const DB_PATH = path.join(__dirname, "database.json");

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ requests: [] }, null, 2));
}

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "periwinkle-secret",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(express.static(__dirname));

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

app.post("/api/login-owner", (req, res) => {
  const { username, password } = req.body;

  if (username === OWNER_USER && password === OWNER_PASSWORD) {
    req.session.owner = true;
    return res.json({ success: true });
  }

  res.status(401).json({ success: false });
});

app.post("/api/login-viewer", (req, res) => {
  const { ign, discord } = req.body;

  if (!ign || !discord) {
    return res
      .status(400)
      .json({ error: "Minecraft IGN and Discord are required" });
  }

  req.session.viewer = { ign, discord };
  res.json({ success: true });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.get("/api/session", (req, res) => {
  if (req.session.owner) {
    return res.json({ mode: "owner" });
  }

  if (req.session.viewer) {
    return res.json({
      mode: "viewer",
      ign: req.session.viewer.ign,
      discord: req.session.viewer.discord,
    });
  }

  res.json({ mode: "guest" });
});

app.get("/api/requests", (req, res) => {
  const db = readDB();
  res.json(db.requests);
});

app.post("/api/requests", (req, res) => {
  if (!req.session.viewer) {
    return res.status(403).json({ error: "Viewer login required" });
  }

  const db = readDB();

  const request = {
    ign: req.session.viewer.ign,
    discord: req.session.viewer.discord,
    type: req.body.type,
    item: req.body.item,
    offer: req.body.offer,
    date: req.body.date,
    note: req.body.note,
    status: "Pending",
    handledBy: "",
  };

  db.requests.unshift(request);
  saveDB(db);

  res.json({ success: true });
});

app.post("/api/requests/:index/:action", (req, res) => {
  if (!req.session.owner) {
    return res.status(403).json({ error: "Owner only" });
  }

  const db = readDB();
  const index = Number(req.params.index);
  const action = req.params.action;

  if (!db.requests[index]) {
    return res.status(404).json({ error: "Request not found" });
  }

  if (action === "accept") {
    db.requests[index].status = "Accepted";
  } else if (action === "decline") {
    db.requests[index].status = "Declined";
  } else if (action === "done") {
    db.requests[index].status = "Done";
  } else {
    return res.status(400).json({ error: "Invalid action" });
  }

  db.requests[index].handledBy = "Periwinkle Team";
  saveDB(db);

  res.json({ success: true });
});

app.delete("/api/requests/:index", (req, res) => {
  if (!req.session.owner) {
    return res.status(403).json({ error: "Owner only" });
  }

  const db = readDB();
  const index = Number(req.params.index);

  if (!db.requests[index]) {
    return res.status(404).json({ error: "Request not found" });
  }

  db.requests.splice(index, 1);
  saveDB(db);

  res.json({ success: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Periwinkle server running on port " + PORT);
});
