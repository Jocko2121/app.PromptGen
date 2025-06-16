const express = require('express');
const path = require('path');
const db = require('./db/database');
const apiRoutes = require('./routes/api');
const statePersistence = require('./services/state-persistence');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', apiRoutes);

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

// Start the server
app.listen(PORT, async () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    
    try {
        // Initialize state persistence
        await statePersistence.loadState();
        // Start auto-save
        statePersistence.startAutoSave();
        console.log('State persistence initialized');
    } catch (error) {
        console.error('Failed to initialize state persistence:', error);
    }
}); 