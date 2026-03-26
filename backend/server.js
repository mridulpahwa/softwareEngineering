import express from "express";
import cors from "cors";
import dbPromise from "./database/db.js";
import { initDB } from "./database/db_setup.js";

// My Code for the top 10 books and price update
import { getTop10Books } from "./database/db_setup.js";
import { updateBookPricesByDiscount } from "./database/db_setup.js";

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

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // READ book genres
  app.get("/book_genres", async (req, res) => {
    const genres = await db.all("SELECT * FROM book_genres");
    res.json(genres);
  });

  // READ books by specific genre
  app.get("/book_genres/:genre", async (req, res) => {
    const { genre } = req.params;
    const books = await db.all(
      "SELECT * FROM book_genres WHERE LOWER(genre) = LOWER(?)",
      [genre]
    );
    res.json(books);
  });

  // READ top 10 books by sales
  app.get("/getTop10Books", async (req, res) => {
  const topBooks = await getTop10Books();
  res.json(topBooks);
});

  // READ books by rating or higher
  app.get("/books/rating", async (req, res) => {
    const { rating } = req.query;

    // Validate rating parameter
    if (!rating || isNaN(rating)) {
      return res.status(400).json({ error: "Rating parameter is required and must be a number" });
    }

    const ratingValue = parseInt(rating);
    const books = await db.all(
      "SELECT * FROM book_genres WHERE rating >= ? ORDER BY rating ASC",
      [ratingValue]
    );
    res.json(books);
  });

  // UPDATE book prices by discount, optionally by publisher
  const applyDiscountHandler = async (req, res) => {
    const discountRaw = req.query.discountPercent ?? req.body.discountPercent;
    const publisher = req.query.publisher ?? req.body.publisher;

    if (discountRaw === undefined) {
      return res.status(400).json({ error: "discountPercent is required" });
    }

    const discountPercent = Number(discountRaw);

    if (Number.isNaN(discountPercent) || discountPercent < 10 || discountPercent > 20) {
      return res.status(400).json({ error: "discountPercent must be a number between 10 and 20" });
    }

    await updateBookPricesByDiscount(discountPercent, publisher);
    return res.status(204).send();
  };

  app.patch("/books/prices/discount", applyDiscountHandler);
  app.put("/books/prices/discount", applyDiscountHandler);

}

startServer();