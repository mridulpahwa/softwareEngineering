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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        author TEXT NOT NULL,
        genre TEXT NOT NULL,
        sales INTEGER DEFAULT 0
    );
    `);

    // Dummy data for book genres
    await db.exec(`
    INSERT INTO book_genres (name, author, genre, sales) VALUES
    ('The Great Gatsby', 'F. Scott Fitzgerald', 'Classic', 5000),
    ('To Kill a Mockingbird', 'Harper Lee', 'Classic', 8500),
    ('1984', 'George Orwell', 'Dystopian', 7200),
    ('The Catcher in the Rye', 'J.D. Salinger', 'Classic', 4300),
    ('Brave New World', 'Aldous Huxley', 'Dystopian', 6100),
    ('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 9200),
    ('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'Fantasy', 12500),
    ('The Name of the Wind', 'Patrick Rothfuss', 'Fantasy', 3800);
    `);
    console.log("Database setup complete");
}

export async function getTop10Books() {
    const db = await dbPromise;
    const topBooks = await db.all(`
        SELECT name, author, genre, sales 
        FROM book_genres 
        ORDER BY sales DESC 
        LIMIT 10
    `);
    return topBooks;
}
