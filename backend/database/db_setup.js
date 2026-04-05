import dbPromise from "./db.js";

export async function initDB() {
    const db = await dbPromise;

    //Book Details:

    //Publisher
    await db.exec(`
    CREATE TABLE IF NOT EXISTS Publisher (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    );
    `);


    //Genre
    await db.exec(`
    CREATE TABLE IF NOT EXISTS Genre (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    );
    `);


    //Author
    await db.exec(`
    CREATE TABLE IF NOT EXISTS Author (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        biography TEXT,
        publisher_id INTEGER,
        UNIQUE(first_name, last_name, publisher_id)
    );
    `);


    // Migration: if the on-disk Author table was created earlier without `publisher_id`, add it.
    // Use PRAGMA to inspect columns so this is safe to run repeatedly.
    const authorCols = await db.all("PRAGMA table_info('Author')");
    const hasPublisherId = authorCols.some(col => col.name === 'publisher_id');
    if (!hasPublisherId) {
        await db.exec(`ALTER TABLE Author ADD COLUMN publisher_id INTEGER;`);
    }


    //Book
    await db.exec(`
    CREATE TABLE IF NOT EXISTS Book (
        isbn TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        year_published INTEGER,
        copies_sold INTEGER DEFAULT 0,
        publisher_id INTEGER,
        genre_id INTEGER
    );
    `);


    //Link books and authors
    await db.exec(`
    CREATE TABLE IF NOT EXISTS BookAuthor (
        isbn TEXT NOT NULL,
        author_id INTEGER NOT NULL,
        PRIMARY KEY (isbn, author_id)
    );
    `);


    //Seed for no duplicates
    await db.exec(`
    INSERT OR IGNORE INTO Publisher (name) VALUES ('OReilly');
    INSERT OR IGNORE INTO Genre (name) VALUES ('Technology');


    INSERT OR IGNORE INTO Author (first_name, last_name, biography, publisher_id)
    VALUES (
        'Martin', 'Fowler', 'Software engineer and programming author.',
        (SELECT id FROM Publisher WHERE name='OReilly')
    );


    INSERT OR IGNORE INTO Book (isbn, title, description, price, year_published, copies_sold, publisher_id, genre_id)
    VALUES (
        '12345', 'Refactoring', 'Improving code design', 39.99, 1999, 500000,
        (SELECT id FROM Publisher WHERE name='OReilly'),
        (SELECT id FROM Genre WHERE name='Technology')
    );


    INSERT OR IGNORE INTO BookAuthor (isbn, author_id)
    VALUES (
        '12345',
        (SELECT id FROM Author WHERE first_name='Martin' AND last_name='Fowler')
    );
    `);

  // Wishlist and Wishlist book Tables
    await db.exec(`
    CREATE TABLE IF NOT EXISTS wishlist (
      wishlist_id INTEGER PRIMARY KEY AUTOINCREMENT,
      id INTEGER NOT NULL,
      name TEXT NOT NULL,
      UNIQUE(id, name),
      FOREIGN KEY (id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS wishlist_books (
      wishlist_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      PRIMARY KEY (wishlist_id, book_id),
      FOREIGN KEY (wishlist_id) REFERENCES wishlist(wishlist_id)
        ON DELETE CASCADE
    );
  `); 

  //Shopping Cart
    await db.exec(`
    CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        bookname TEXT NOT NULL,
        bookdetails TEXT NOT NULL,
        price REAL NOT NULL,
        userdetails TEXT NOT NULL
    );
    `);
    
    // User Table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        username TEXT NOT NULL DEFAULT ' ' PRIMARY KEY,
        password TEXT NOT NULL DEFAULT ' ',
        name TEXT NOT NULL DEFAULT ' ',
        email TEXT NOT NULL DEFAULT ' ',
        home_address TEXT NOT NULL DEFAULT ' '
    );
    `);

    // Recreate Credit Card Table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS credit_cards (
        username TEXT NOT NULL DEFAULT ' ' PRIMARY KEY,
        cardholder_name TEXT NOT NULL DEFAULT ' ',
        card_number INTEGER NOT NULL DEFAULT 0,
        expiry_date DATE NOT NULL DEFAULT ' ',
        cvv INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (username) REFERENCES users(username)
    );
    `);
}