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

  // Book Details: Create Author (POST)
  app.post("/authors", async (req, res) => {
    const { first_name, last_name, biography, publisher } = req.body;

    if (!first_name || !last_name || !publisher) {
      return res.status(400).json({ error: "first_name, last_name, publisher are required" });
    }

    //Publisher exists
    await db.run(`INSERT OR IGNORE INTO Publisher (name) VALUES (?)`, [publisher]);

    //Create author
    await db.run(
      `INSERT INTO Author (first_name, last_name, biography, publisher_id)
      VALUES (?, ?, ?, (SELECT id FROM Publisher WHERE name = ?))`,
      [first_name, last_name, biography ?? null, publisher]
    );

    res.status(201).end();
  });

  //Book Details: Create Book (POST)
  app.post("/books", async (req, res) => {
    const {
      isbn,
      title,
      description,
      price,
      author_id,
      genre,
      publisher,
      year_published,
      copies_sold
    } = req.body;

    if (!isbn || !title || price == null || !author_id || !genre || !publisher) {
      return res.status(400).json({
        error: "isbn, title, price, author_id, genre, publisher are required"
      });
    }

    //Publisher and Genre exist
    await db.run(`INSERT OR IGNORE INTO Publisher (name) VALUES (?)`, [publisher]);
    await db.run(`INSERT OR IGNORE INTO Genre (name) VALUES (?)`, [genre]);

    //Insert book
    await db.run(
      `INSERT INTO Book (isbn, title, description, price, year_published, copies_sold, publisher_id, genre_id)
      VALUES (
        ?, ?, ?, ?, ?, ?,
        (SELECT id FROM Publisher WHERE name = ?),
        (SELECT id FROM Genre WHERE name = ?)
      )`,
      [
        isbn,
        title,
        description ?? null,
        price,
        year_published ?? null,
        copies_sold ?? 0,
        publisher,
        genre
      ]
    );

  //Link book and author
    await db.run(
      `INSERT OR IGNORE INTO BookAuthor (isbn, author_id) VALUES (?, ?)`,
      [isbn, author_id]
    );

    res.status(201).end();
  });

  //Book Details: Get Book by ISBN (GET)
  app.get("/books/:isbn", async (req, res) => {
    const { isbn } = req.params;

    const book = await db.get(
      `SELECT
        b.isbn,
        b.title,
        b.description,
        b.price,
        b.year_published,
        b.copies_sold,
        p.name AS publisher,
        g.name AS genre
      FROM Book b
      LEFT JOIN Publisher p ON b.publisher_id = p.id
      LEFT JOIN Genre g ON b.genre_id = g.id
      WHERE b.isbn = ?`,
      [isbn]
    );

    if (!book) return res.status(404).json({ error: "Book not found" });

    const authors = await db.all(
      `SELECT a.id, a.first_name, a.last_name, a.biography
      FROM Author a
      JOIN BookAuthor ba ON ba.author_id = a.id
      WHERE ba.isbn = ?`,
      [isbn]
    );

    book.authors = authors;
    res.json(book);
  });

  //Book Details: Get Books by AuthorId (GET)
  app.get("/authors/:authorId/books", async (req, res) => {
    const authorId = Number(req.params.authorId);
    if (Number.isNaN(authorId)) return res.status(400).json({ error: "authorId must be a number" });

    const books = await db.all(
      `SELECT
        b.isbn,
        b.title,
        b.description,
        b.price,
        b.year_published,
        b.copies_sold,
        p.name AS publisher,
        g.name AS genre
      FROM Book b
      JOIN BookAuthor ba ON ba.isbn = b.isbn
      LEFT JOIN Publisher p ON b.publisher_id = p.id
      LEFT JOIN Genre g ON b.genre_id = g.id
      WHERE ba.author_id = ?
      ORDER BY b.title`,
      [authorId]
    );

    res.json(books);
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();