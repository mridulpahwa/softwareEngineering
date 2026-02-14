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

    // Book Genre Table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS book_genres (
        name TEXT NOT NULL,
        author TEXT NOT NULL,
        genre TEXT NOT NULL
    );
    `);

    // Dummy data for book genres
    await db.exec(`
    INSERT INTO book_genres (name, author, genre) VALUES
    ('The Great Gatsby', 'F. Scott Fitzgerald', 'Classic'),
    ('To Kill a Mockingbird', 'Harper Lee', 'Classic'),
    ('1984', 'George Orwell', 'Dystopian'),
    ('The Catcher in the Rye', 'J.D. Salinger', 'Classic'),
    ('Brave New World', 'Aldous Huxley', 'Dystopian'),
    ('The Hobbit', 'J.R.R. Tolkien', 'Fantasy'),
    ('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'Fantasy'),
    ('The Name of the Wind', 'Patrick Rothfuss', 'Fantasy');
    `);
    console.log("Database setup complete");
    


}
