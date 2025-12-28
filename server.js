const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const DATA_FILE = "items.json";

// Read items
function readItems() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

// Save items
function saveItems(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

// GET all items + auto delete after 50 days
app.get("/items", (req, res) => {
  const items = readItems();
  const now = Date.now();

  const filtered = items.filter(item => {
    return now - item.createdAt < 50 * 24 * 60 * 60 * 1000;
  });

  if (filtered.length !== items.length) {
    saveItems(filtered);
  }

  res.json(filtered);
});

// ADD item
app.post("/items", (req, res) => {
  const { name, location, category, desc, image } = req.body;

  if (!name || !location || !category || !image) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const items = readItems();
  items.push({
    id: Date.now(),
    name,
    location,
    category,
    desc: desc || "",
    status: "lost",
    createdAt: Date.now(),
    image
  });

  saveItems(items);
  res.json({ message: "Item added" });
});

// UPDATE item (status)
app.put("/items/:id", (req, res) => {
  const items = readItems();
  const item = items.find(i => i.id == req.params.id);

  if (!item) return res.status(404).json({ message: "Not found" });

  Object.assign(item, req.body);
  saveItems(items);
  res.json({ message: "Item updated" });
});

// DELETE item
app.delete("/items/:id", (req, res) => {
  const items = readItems().filter(i => i.id != req.params.id);
  saveItems(items);
  res.json({ message: "Item deleted" });
});

app.listen(PORT, () => {
  console.log("Server running");
});
