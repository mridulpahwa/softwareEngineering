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

    //Book Details

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

    console.log("Database setup complete");

}