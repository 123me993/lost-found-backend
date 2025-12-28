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

// Get all items
app.get("/items", (req, res) => {
  res.json(readItems());
});

// Add item
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

// Update item
app.put("/items/:id", (req, res) => {
  const items = readItems();
  const index = items.find(i => i.id == req.params.id);
  if (!index) return res.status(404).json({ message: "Not found" });

  Object.assign(index, req.body);
  saveItems(items);
  res.json({ message: "Item updated" });
});

// Delete item
app.delete("/items/:id", (req, res) => {
  const items = readItems().filter(i => i.id != req.params.id);
  saveItems(items);
  res.json({ message: "Item deleted" });
});

// Start server
app.listen(PORT, () => {
  console.log("Server running");
});