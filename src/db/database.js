const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
console.log('Data directory path:', dataDir);

if (!fs.existsSync(dataDir)) {
    console.log('Creating data directory...');
    fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dataDir, 'promptgen.db');
console.log('Database file path:', dbPath);

// Check if database file exists
if (fs.existsSync(dbPath)) {
    console.log('Database file exists');
    // Check if file is readable
    try {
        fs.accessSync(dbPath, fs.constants.R_OK);
        console.log('Database file is readable');
    } catch (error) {
        console.error('Database file is not readable:', error);
        process.exit(1);
    }
} else {
    console.log('Database file does not exist - will be created');
}

// Create database connection
let db;
try {
    db = new Database(dbPath, { verbose: console.log });
    console.log('Database connection established at:', dbPath);
} catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
}

// Initialize database schema
async function initializeDatabase() {
    try {
        console.log('Starting database schema initialization...');
        
        // Create migrations table first
        const stmt = db.prepare(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        stmt.run();
        
        // Now we can safely require migrations
        const migrations = require('./migrations');
        migrations.runMigrations(db);
        
        console.log('Database schema initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database schema:', error);
        process.exit(1);
    }
}

// Initialize the database
initializeDatabase();

module.exports = db; 