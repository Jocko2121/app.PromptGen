const fs = require('fs');
const path = require('path');

// Create migrations table if it doesn't exist
function initializeMigrations(db) {
    const stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    stmt.run();
}

// Get list of applied migrations
function getAppliedMigrations(db) {
    const stmt = db.prepare('SELECT name FROM migrations ORDER BY id');
    return stmt.all().map(m => m.name);
}

// Apply a single migration
function applyMigration(db, migrationName, sql) {
    return db.transaction(() => {
        // Check if migration was already applied
        const stmt = db.prepare('SELECT name FROM migrations WHERE name = ?');
        const existing = stmt.get(migrationName);
        
        if (existing) {
            console.log(`Migration ${migrationName} already applied`);
            return;
        }

        // Apply the migration
        console.log(`Applying migration ${migrationName}...`);
        const statements = sql.split(';').filter(s => s.trim());
        for (const statement of statements) {
            if (statement.trim()) {
                db.prepare(statement).run();
            }
        }

        // Record the migration
        const insertStmt = db.prepare('INSERT INTO migrations (name) VALUES (?)');
        insertStmt.run(migrationName);
        
        console.log(`Migration ${migrationName} applied successfully`);
    });
}

// Run all pending migrations
function runMigrations(db) {
    try {
        console.log('Running migrations...');

        // Get list of applied migrations
        const appliedMigrations = getAppliedMigrations(db);
        console.log('Applied migrations:', appliedMigrations);

        // Get list of migration files
        const migrationsDir = path.join(__dirname, 'migrations');
        if (!fs.existsSync(migrationsDir)) {
            console.log('No migrations directory found, creating...');
            fs.mkdirSync(migrationsDir, { recursive: true });
            return;
        }

        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        // Apply pending migrations
        for (const file of migrationFiles) {
            const migrationName = path.basename(file, '.sql');
            if (!appliedMigrations.includes(migrationName)) {
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                applyMigration(db, migrationName, sql);
            }
        }

        console.log('All migrations completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
}

module.exports = {
    runMigrations,
    applyMigration
}; 