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

  // INSERT user
  app.post("/users", async (req, res) => {
    const { username, password, name, email, home_address } = req.body;

    const result = await db.run(
      "INSERT INTO users (username, password, name, email, home_address) VALUES (?, ?, ?, ?, ?)",
      [username, password, name, email, home_address]
    );
    res.json();
  });

  // READ users
  app.get("/users", async (req, res) => {
    const users = await db.all("SELECT * FROM users");
    res.json(users);
  });

  // READ single user by username
  app.get("/users/:username", async (req, res) => {
    const { username } = req.params;
    const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  // PATCH any user info by username, except email
  app.patch("/users/:username", async (req, res) => {
    const { username } = req.params;
    const { username: newUsername, password, name, home_address } = req.body;
    const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    if (!user) return res.status(404).json({ error: "User not found" });
    await db.run(
      "UPDATE users SET username = ?, password = ?, name = ?, home_address = ? WHERE username = ?",
      [newUsername ?? user.username, password ?? user.password, name ?? user.name, home_address ?? user.home_address, username]
    );
    res.json();
  });

  // INSERT credit card info for a user only if user exists
  app.post("/credit-cards", async (req, res) => {
    const { username, cardholder_name, card_number, expiry_date, cvv} = req.body;

    // Check if user exists
    const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await db.run(
      "INSERT INTO credit_cards (username, cardholder_name, card_number, expiry_date, cvv) VALUES (?, ?, ?, ?, ?)",
      [username, cardholder_name, card_number, expiry_date, cvv]
    );
    res.json();
  });

  //DELETE user by username
  app.delete("/users/:username", async (req, res) => {
    const { username } = req.params;
    const result = await db.run("DELETE FROM users WHERE username = ?", [username]);
    res.json({ message: "User deleted successfully" });
  });
  
  //DELETE credit card info by username
  app.delete("/credit-cards/:username", async (req, res) => {
    const { username } = req.params;
    const result = await db.run("DELETE FROM credit_cards WHERE username = ?", [username]);
    res.json({ message: "Credit card info deleted successfully" });
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

  // Endpoints for wishlist 
  app.post("/wishlists", async (req, res) => {
  const { id, name } = req.body;

  try {
    const result = await db.run(
      "INSERT INTO wishlist (id, name) VALUES (?, ?)",
      [id, name]
    );

    res.json({
            message: "Wishlist Created",
            wishlist_id: result.lastID 
            });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(400).json({
        error: "Wishlist with this name already exists for this user"
      });
    }
    res.status(500).json({ error: err.message });
  }
  });

  app.post("/wishlist-books", async (req, res) => {
    const { wishlist_id, book_id } = req.body;

    try {
      await db.run(
        "INSERT INTO wishlist_books (wishlist_id, book_id) VALUES (?, ?)",
        [wishlist_id, book_id]
      );

      res.json({ message: "Book added to wishlist"
      });
    } catch (err) {
      if (err.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "Book already in wishlist" });
    }
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/moveBookFromWishlist", async(req, res) =>{
    const {wishlist_id, book_id} = req.body;
    try{
    const delete_book_from_wishlist = await db.run(
      "DELETE FROM wishlist_books WHERE wishlist_id = ? AND book_id = ?",
      [wishlist_id, book_id]
    )
    const add_book_to_cart = await db.run(
      "INSERT INTO cart (book_id, bookname, bookdetails, price, userdetails) VALUES (?, ?, ?, ?, ?)",
      [book_id, "bookname", "bookdetails", "price", "userdetails"]
    );

    res.json({ message: "Book added to Shopping Cart"
    });
    } catch(err) {
      console.log(err.message)
      return res.status(400).json({ error: "Operation Failed" });
    }
  }
);

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