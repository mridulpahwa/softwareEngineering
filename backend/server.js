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

  //INSERT rating
  app.post("/ratings", async (req, res) => {

    const {bookId, userId, comment, starScore} = req.body;

    //Gets current date
    const currentDate = new Date()

    const date = JSON.stringify(new String((currentDate.getMonth() + 1) + "/" + (currentDate.getDate()) + "/" + (currentDate.getFullYear())));

    const rating = await db.run(

      "INSERT INTO ratings (bookId, userId, comment, starScore, date) VALUES (?, ?, ?, ?, ?)",
      [bookId, userId, comment, starScore, date]
    );

    res.json({bookId: rating.lastID});
  })

  //READ ratings
  app.get("/ratings", async (req, res) => {

    const ratings = await db.all("SELECT * FROM ratings");
    res.json(ratings);
  })

  //GET average rating
  app.get("/ratings/score-average/:id", async (req, res) => {

    const book = req.params.id;

    const average = await db.all("SELECT AVG(starScore) FROM ratings WHERE bookId = ?", [book])

    res.send(average);
  })

  //GET comments
  app.get("/ratings/comments/:id", async (req, res) => {

    const book = req.params.id;

    const comments = await db.all("SELECT comment FROM ratings WHERE bookId = ?", [book])

    res.json(comments);
  })

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

}

startServer();