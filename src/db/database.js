const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Human-readable SQL logging function
function logSQL(sql) {
    const cleanSQL = sql.trim();
    
    if (cleanSQL.includes('SELECT')) {
        // Parse SELECT queries for details
        if (cleanSQL.includes('component_types')) {
            if (cleanSQL.includes('COUNT(*)')) {
                console.log('[DB] Counting component types...');
            } else {
                console.log('[DB] Loading component types (id, type_key, display_name)...');
            }

        } else if (cleanSQL.includes('sqlite_master')) {
            console.log('[DB] Checking database schema/tables...');
        } else if (cleanSQL.includes('migrations')) {
            console.log('[DB] Checking migration status...');
        } else {
            console.log('[DB] Reading data from database...');
        }
    } else if (cleanSQL.includes('UPDATE')) {
        // Parse UPDATE queries with detailed extraction
        if (cleanSQL.includes('component_types')) {
            // Extract component type info
            let field = 'unknown field';
            let whereInfo = '';
            
            if (cleanSQL.includes('display_name =')) {
                field = 'display_name';
            }
            
            const typeMatch = cleanSQL.match(/WHERE type_key = ['"]?(\w+)['"]?/i);
            if (typeMatch) {
                whereInfo = ` (type: ${typeMatch[1]})`;
            }
            
            console.log(`[DB] ✏️  Updating component_types${whereInfo}: ${field}`);
            
        } else {
            // Extract table name for unknown updates
            const tableMatch = cleanSQL.match(/UPDATE (\w+)/i);
            const tableName = tableMatch ? tableMatch[1] : 'unknown_table';
            
            console.log(`[DB] ✏️  Updating ${tableName} record...`);
        }
         } else if (cleanSQL.includes('INSERT')) {
        // Parse INSERT queries with details
        if (cleanSQL.includes('component_types')) {
            console.log('[DB] ➕ Creating new component_types record...');
        } else if (cleanSQL.includes('migrations')) {
            // Extract migration name if possible
            const nameMatch = cleanSQL.match(/VALUES\s*\([^,]*,\s*['"]([^'"]+)['"]/i);
            const migrationName = nameMatch ? nameMatch[1] : 'unknown';
            console.log(`[DB] ➕ Recording migration: ${migrationName}...`);
        } else {
            // Extract table name
            const tableMatch = cleanSQL.match(/INSERT INTO (\w+)/i);
            const tableName = tableMatch ? tableMatch[1] : 'unknown_table';
            console.log(`[DB] ➕ Creating new ${tableName} record...`);
        }
    } else if (cleanSQL.includes('DELETE')) {
        // Parse DELETE queries
        console.log('[DB] 🗑️  Deleting database record...');
    } else if (cleanSQL.includes('CREATE TABLE')) {
        console.log('[DB] 🔨 Creating database table...');
    } else if (cleanSQL.includes('ALTER TABLE')) {
        console.log('[DB] 🔨 Modifying table structure...');
    } else if (cleanSQL.includes('DROP')) {
        console.log('[DB] 🔨 Dropping database object...');
    } else if (cleanSQL.includes('PRAGMA')) {
        console.log('[DB] ⚙️  Setting database configuration...');
    } else if (cleanSQL.includes('BEGIN') || cleanSQL.includes('COMMIT') || cleanSQL.includes('ROLLBACK')) {
        console.log('[DB] 📦 Managing transaction...');
    } else {
        console.log(`[DB] Executing SQL: ${cleanSQL.substring(0, 50)}...`);
    }
}

// Initialize database
const db = new Database(path.join(dataDir, 'promptgen.db'), {
    verbose: logSQL
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create migrations table if it doesn't exist
db.prepare(`
    CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`).run();

module.exports = db;
module.exports.logSQL = logSQL; 