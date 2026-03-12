import dbPromise from "./db.js";

export async function initDB() {
    const db = await dbPromise;

    // Drop existing table and recreate with new schema
    await db.exec(`DROP TABLE IF EXISTS users;`);
    
    // Create the users table with the new schema
    await db.exec(`
    CREATE TABLE users (
        username TEXT NOT NULL DEFAULT ' ' PRIMARY KEY,
        password TEXT NOT NULL DEFAULT ' ',
        name TEXT NOT NULL DEFAULT ' ',
        email TEXT NOT NULL DEFAULT ' ',
        home_address TEXT NOT NULL DEFAULT ' '
    );
    `);

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