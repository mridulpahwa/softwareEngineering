import dbPromise from "./db.js";

export async function initDB() {
    const db = await dbPromise;

    // Ensure users table exists (minimal columns)
    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT
    );
    `);

    // Ensure expected columns exist; add any missing columns safely
    const existing = await db.all(`PRAGMA table_info(users);`);
    const cols = existing.map(c => c.name);

    const ensureColumn = async (name, definition) => {
        if (!cols.includes(name)) {
            await db.exec(`ALTER TABLE users ADD COLUMN ${name} ${definition};`);
        }
    };

    await ensureColumn('username', "TEXT NOT NULL DEFAULT ''");
    await ensureColumn('password', "TEXT NOT NULL DEFAULT ''");
    await ensureColumn('home_address', "TEXT NOT NULL DEFAULT ''");
    // Make sure name and email exist (in case of very old schema)
    await ensureColumn('name', "TEXT NOT NULL DEFAULT ''");
    await ensureColumn('email', "TEXT NOT NULL DEFAULT ''");

    // Insert dummy data only if table is empty
    const row = await db.get(`SELECT COUNT(*) AS count FROM users;`);
    if (row && row.count === 0) {
        await db.exec(`
        INSERT INTO users (username, password, name, email, home_address) VALUES
            ('john_doe', 'password123', 'John Doe', 'john@example.com', '123 Main St'),
            ('jane_smith', 'password456', 'Jane Smith', 'jane@example.com', '456 Oak Ave'),
            ('bob_johnson', 'password789', 'Bob Johnson', 'bob@example.com', '789 Pine Rd');
        `);
    }

    console.log("Database setup complete");
}