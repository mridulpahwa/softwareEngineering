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

    // Author table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS Author (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    biography TEXT
    );
    `);

    // Dummy author data
    await db.exec(`
    INSERT INTO Author (first_name, last_name, biography)
    VALUES
    ('Martin', 'Fowler', 'Software engineer and programming author.'),
    ('J.R.R.', 'Tolkien', 'Author of The Lord of the Rings.'),
    ('George', 'Orwell', 'Writer of dystopian fiction.');
    `);
    
    console.log("Database setup complete");

}