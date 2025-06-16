const fs = require('fs').promises;
const path = require('path');
const db = require('./database');

async function initializeMigrations() {
    try {
        // Create migrations table if it doesn't exist
        db.prepare(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY NOT NULL,
                name TEXT NOT NULL UNIQUE,
                applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `).run();
    } catch (error) {
        console.error('Error initializing migrations:', error);
        throw error;
    }
}

async function getAppliedMigrations() {
    try {
        return db.prepare('SELECT name FROM migrations ORDER BY id').all();
    } catch (error) {
        console.error('Error getting applied migrations:', error);
        throw error;
    }
}

function splitSQLStatements(sql) {
    const statements = [];
    let currentStatement = '';
    let inTrigger = false;
    let braceCount = 0;
    
    // Split by semicolons, but preserve them in the statements
    const lines = sql.split('\n');
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('--')) {
            continue;
        }
        
        currentStatement += line + '\n';
        
        // Track trigger blocks
        if (trimmedLine.toUpperCase().includes('CREATE TRIGGER')) {
            inTrigger = true;
        }
        
        if (inTrigger) {
            if (trimmedLine.includes('BEGIN')) {
                braceCount++;
            }
            if (trimmedLine.includes('END')) {
                braceCount--;
                if (braceCount === 0) {
                    inTrigger = false;
                    if (trimmedLine.endsWith(';')) {
                        statements.push(currentStatement.trim());
                        currentStatement = '';
                    }
                }
            }
        } else if (trimmedLine.endsWith(';')) {
            statements.push(currentStatement.trim());
            currentStatement = '';
        }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
    }
    
    return statements;
}

async function applyMigration(migrationName) {
    const migrationPath = path.join(__dirname, 'migrations', migrationName);
    
    try {
        // Read migration file
        const sql = await fs.readFile(migrationPath, 'utf8');
        
        // Split SQL into individual statements
        const statements = splitSQLStatements(sql);
        
        console.log(`Processing migration ${migrationName} with ${statements.length} statements`);
        
        // Start transaction
        db.prepare('BEGIN').run();
        
        try {
            // Execute each statement separately
            for (const statement of statements) {
                try {
                    console.log('Executing statement:', statement.substring(0, 100) + '...');
                    db.prepare(statement).run();
                } catch (error) {
                    console.error('Error executing statement:', statement);
                    throw error;
                }
            }
            
            // Record migration
            db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migrationName);
            
            // Commit transaction
            db.prepare('COMMIT').run();
            
            console.log(`Applied migration: ${migrationName}`);
        } catch (error) {
            // Rollback on error
            db.prepare('ROLLBACK').run();
            throw error;
        }
    } catch (error) {
        console.error(`Error applying migration ${migrationName}:`, error);
        throw error;
    }
}

async function runMigrations() {
    try {
        // Initialize migrations table
        await initializeMigrations();
        
        // Get list of migration files
        const migrationFiles = await fs.readdir(path.join(__dirname, 'migrations'));
        const sqlFiles = migrationFiles.filter(f => f.endsWith('.sql')).sort();
        
        // Get applied migrations
        const appliedMigrations = await getAppliedMigrations();
        const appliedNames = appliedMigrations.map(m => m.name);
        
        // Find pending migrations
        const pendingMigrations = sqlFiles.filter(f => !appliedNames.includes(f));
        
        if (pendingMigrations.length === 0) {
            console.log('No pending migrations');
            return;
        }
        
        console.log('Running pending migrations:', pendingMigrations);
        
        // Apply each pending migration
        for (const migration of pendingMigrations) {
            await applyMigration(migration);
        }
        
        console.log('All migrations completed successfully');
    } catch (error) {
        console.error('Error running migrations:', error);
        throw error;
    }
}

module.exports = {
    runMigrations,
    getAppliedMigrations
}; 