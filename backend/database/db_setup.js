import dbPromise from "./db.js";

export async function initDB() {
    const db = await dbPromise;

    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL
    );
    `);

    console.log("Database setup complete");
}