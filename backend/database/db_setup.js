import dbPromise from "./db.js";

export async function initDB() {
    const db = await dbPromise;

    await db.exec(`
    CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bookname TEXT NOT NULL,
        bookdetails TEXT NOT NULL,
        price REAL NOT NULL,
        userdetails TEXT NOT NULL
    );
    `);

    console.log("Database setup complete");
}