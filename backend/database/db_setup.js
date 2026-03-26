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

    // Creates the book_genres table if it doesn't exist
    await db.exec(`
    CREATE TABLE IF NOT EXISTS book_genres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        author TEXT NOT NULL,
        genre TEXT NOT NULL,
        publisher TEXT NOT NULL,
        price REAL NOT NULL,
        rating INTEGER NOT NULL,
        sales INTEGER DEFAULT 0
    );
    `);

    // Books
    await db.exec(`
    INSERT INTO book_genres (name, author, genre, publisher, price, rating, sales) VALUES
    ('The Great Gatsby', 'F. Scott Fitzgerald', 'Classic', 'Scribner', 9.99, 8, 5000),
    ('To Kill a Mockingbird', 'Harper Lee', 'Classic', 'J.B. Lippincott', 11.99, 9, 8500),
    ('1984', 'George Orwell', 'Dystopian', 'Secker & Warburg', 10.99, 8, 7200),
    ('The Catcher in the Rye', 'J.D. Salinger', 'Classic', 'Little, Brown', 10.49, 6, 4300),
    ('Brave New World', 'Aldous Huxley', 'Dystopian', 'Chatto & Windus', 11.49, 2, 6100),
    ('The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 'Allen & Unwin', 12.99, 9, 9200),
    ('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'Fantasy', 'Bloomsbury', 13.99, 7, 12500),
    ('The Name of the Wind', 'Patrick Rothfuss', 'Fantasy', 'DAW Books', 14.99, 9, 3800),
    ('Demon Slayer', 'Koyoharu Gotouge', 'Manga', 'Shueisha', 12.49, 8, 15300),
    ('One Piece', 'Eiichiro Oda', 'Manga', 'Weekly Shonen Jump', 13.49, 9, 18700),
    ('Dune', 'Frank Herbert', 'Science Fiction', 'Ace Books', 13.99, 8, 11200),
    ('The Lord of the Rings', 'J.R.R. Tolkien', 'Fantasy', 'Houghton Mifflin', 14.99, 10, 14600),
    ('Sapiens', 'Yuval Noah Harari', 'Non-Fiction', 'Harvill Secker', 12.99, 3, 9850),
    ('The Silent Patient', 'Alex Michaelides', 'Thriller', 'Celadon Books', 11.49, 5, 6750),
    ('Educated', 'Tara Westover', 'Memoir', 'Random House', 12.99, 4, 8200);
    `);
    console.log("Database setup complete");
}

// gets the top 10 books based on sales

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

// Updates book prices by discount percent for all publishers or a specific publisher.
export async function updateBookPricesByDiscount(discountPercent, publisher) {
    const db = await dbPromise;

    const discountFactor = 1 - discountPercent / 100;

    if (publisher) {
        await db.run(
            `UPDATE book_genres
             SET price = ROUND(price * ?, 2)
             WHERE LOWER(publisher) = LOWER(?)`,
            [discountFactor, publisher]
        );
        return;
    }

    await db.run(
        `UPDATE book_genres
         SET price = ROUND(price * ?, 2)`,
        [discountFactor]
    );
}
