import express from "express";
import cors from "cors";
import dbPromise from "./database/db.js";
import { initDB } from "./database/db_setup.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5173;

async function startServer() {
  await initDB();
  const db = await dbPromise;

  // Test route
  app.get("/", (req, res) => {
    res.send("API is running");
  });

  // INSERT cart
  app.post("/cart", async (req, res) => {
    const { bookname, bookdetails, price, userdetails } = req.body;

    const result = await db.run(
      "INSERT INTO cart (bookname, bookdetails, price, userdetails) VALUES (?, ?, ?, ?)",
      [bookname, bookdetails, price, userdetails]
    );

    res.json({ id: result.lastID });
  });

  // READ cart items
  app.get("/cart", async (req, res) => {
    const cartItems = await db.all("SELECT * FROM cart");
    res.json(cartItems);
  });

  // GET total price of all cart items
  app.get("/cart/subtotal", async (req, res) => {
    try {
      const result = await db.get("SELECT SUM(price) AS subtotal FROM cart");
      res.json({ subtotal: (result.subtotal || 0).toFixed(2) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // READ single cart item by id
  app.get("/cart/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const item = await db.get("SELECT * FROM cart WHERE id = ?", [id]);
      if (item) {
        res.json(item);
      } else {
        res.status(404).json({ error: "Item not found" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE cart item by id
  app.delete("/cart/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const result = await db.run("DELETE FROM cart WHERE id = ?", [id]);
      if (result.changes > 0) {
        // Reset autoincrement counter to MAX(id) + 1
        await db.run("DELETE FROM sqlite_sequence WHERE name = 'cart'");
        const maxId = await db.get("SELECT MAX(id) as maxId FROM cart");
        if (maxId.maxId) {
          await db.run("INSERT INTO sqlite_sequence (name, seq) VALUES ('cart', ?)", [maxId.maxId]);
        }
        res.json({ status: "Item removed successfully" });
      } else {
        res.status(404).json({ error: "Item not found" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();