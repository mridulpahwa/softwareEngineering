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

  // INSERT user
  app.post("/users", async (req, res) => {
    const { name, email } = req.body;

    const result = await db.run(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email]
    );

    res.json({ id: result.lastID });
  });

  // READ users
  app.get("/users", async (req, res) => {
    const users = await db.all("SELECT * FROM users");
    res.json(users);
  });

  // READ authors
  app.get("/authors", async (req, res) => {
    const authors = await db.all("SELECT * FROM Author");
    res.json(authors);
  });

  // READ single author by id
  app.get("/authors/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const author = await db.get("SELECT * FROM Author WHERE id = ?", [id]);
      if (author) {
        res.json(author);
      } else {
        res.status(404).json({ error: "Author not found" });
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