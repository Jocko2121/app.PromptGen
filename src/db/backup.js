const fs = require('fs');
const path = require('path');
const db = require('./database');

// Configuration
const MAX_BACKUPS = 3;
const BACKUP_DIR = path.join(__dirname, '../../data/backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Generate backup filename with timestamp
function generateBackupFilename() {
    const now = new Date();
    return `backup_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}_${String(now.getMinutes()).padStart(2, '0')}.db`;
}

// Verify backup integrity
function verifyBackup(backupPath) {
    try {
        // Try to open the backup file as a database
        const backupDb = new (require('better-sqlite3'))(backupPath, { readonly: true });
        
        // Test basic operations
        backupDb.prepare('SELECT 1').get();
        
        // Check if required tables exist
        const tables = backupDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        const requiredTables = ['user_components', 'app_state', 'migrations'];
        const missingTables = requiredTables.filter(table => 
            !tables.some(t => t.name === table)
        );
        
        backupDb.close();
        
        if (missingTables.length > 0) {
            throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
        }
        
        return true;
    } catch (error) {
        console.error('Backup verification failed:', error);
        return false;
    }
}

// Clean up old backups
function cleanupOldBackups() {
    try {
        const backups = fs.readdirSync(BACKUP_DIR)
            .filter(file => file.startsWith('backup_') && file.endsWith('.db'))
            .map(file => ({
                name: file,
                path: path.join(BACKUP_DIR, file),
                time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);

        // Keep only the most recent MAX_BACKUPS
        for (let i = MAX_BACKUPS; i < backups.length; i++) {
            fs.unlinkSync(backups[i].path);
            console.log(`Deleted old backup: ${backups[i].name}`);
        }
    } catch (error) {
        console.error('Error cleaning up old backups:', error);
    }
}

// Create a new backup
async function createBackup() {
    try {
        console.log('Creating database backup...');
        
        // Generate backup filename
        const backupFilename = generateBackupFilename();
        const backupPath = path.join(BACKUP_DIR, backupFilename);
        
        // Create backup
        fs.copyFileSync(db.name, backupPath);
        console.log(`Backup created: ${backupFilename}`);
        
        // Verify backup
        if (!verifyBackup(backupPath)) {
            throw new Error('Backup verification failed');
        }
        
        // Clean up old backups
        cleanupOldBackups();
        
        return {
            success: true,
            filename: backupFilename,
            path: backupPath
        };
    } catch (error) {
        console.error('Backup creation failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Get list of available backups
function getBackups() {
    try {
        return fs.readdirSync(BACKUP_DIR)
            .filter(file => file.startsWith('backup_') && file.endsWith('.db'))
            .map(file => ({
                name: file,
                path: path.join(BACKUP_DIR, file),
                time: fs.statSync(path.join(BACKUP_DIR, file)).mtime
            }))
            .sort((a, b) => b.time - a.time);
    } catch (error) {
        console.error('Error getting backup list:', error);
        return [];
    }
}

// Restore from backup
async function restoreFromBackup(backupName) {
    try {
        console.log(`Restoring from backup: ${backupName}`);
        
        // Find the backup file
        const backupPath = path.join(BACKUP_DIR, backupName);
        if (!fs.existsSync(backupPath)) {
            throw new Error(`Backup file not found: ${backupName}`);
        }
        
        // Verify backup before restoring
        if (!verifyBackup(backupPath)) {
            throw new Error('Backup verification failed');
        }
        
        // Create a backup of current database before restore
        const currentBackup = await createBackup();
        if (!currentBackup.success) {
            throw new Error('Failed to create backup of current database before restore');
        }
        
        // Close the current database connection
        db.close();
        
        // Copy backup to database file
        fs.copyFileSync(backupPath, db.name);
        console.log(`Database restored from backup: ${backupName}`);
        
        // Reopen database connection
        const newDb = new (require('better-sqlite3'))(db.name, { verbose: console.log });
        
        return {
            success: true,
            message: `Database restored from backup: ${backupName}`,
            preRestoreBackup: currentBackup.filename
        };
    } catch (error) {
        console.error('Restore failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    createBackup,
    getBackups,
    verifyBackup,
    restoreFromBackup
}; 