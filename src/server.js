const express = require('express');
const path = require('path');
const db = require('./db/database');
const { runMigrations } = require('./db/migrations');
const apiRoutes = require('./routes/api');
const { initializeDatabaseIfNeeded } = require('./db/initialization');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', apiRoutes);

// Serve database file for SQLite viewer
app.get('/data/promptgen.db', (req, res) => {
    try {
        const dbPath = path.join(__dirname, '../data/promptgen.db');
        res.download(dbPath, 'promptgen.db', (err) => {
            if (err) {
                console.error('Error serving database file:', err);
                res.status(404).json({ error: 'Database file not found' });
            }
        });
    } catch (error) {
        console.error('Error accessing database file:', error);
        res.status(500).json({ error: 'Failed to access database file' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    try {
        // Test database connection
        db.prepare('SELECT 1').get();
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        console.error('Database health check failed:', error);
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 'error', message: 'Something went wrong!' });
});

// Fallback: serve index.html for any unknown route (for SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Main startup sequence
(async () => {
    try {
        // Run migrations before any DB access
        await runMigrations();
        console.log('Migrations completed successfully');

        // Initialize database with starter components if needed
        await initializeDatabaseIfNeeded();
        console.log('Database initialization completed successfully');

        // Start the server only after DB is ready
        app.listen(PORT, async () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Fatal error during startup:', error);
        process.exit(1);
    }
})(); 