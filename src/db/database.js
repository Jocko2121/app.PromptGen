const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dataDir, 'promptgen.db');

// Create database connection
const db = new Database(dbPath);

// Initialize database schema
function initializeDatabase() {
    // Create user_components table
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_components (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_starter_id TEXT,
            component_type TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true,
            selection TEXT,
            prompt_value TEXT,
            user_value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create app_state table for general application state
    db.exec(`
        CREATE TABLE IF NOT EXISTS app_state (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            state_data TEXT NOT NULL,
            last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

// Initialize the database
initializeDatabase();

module.exports = db; 