const express = require('express');
const router = express.Router();
const dbOps = require('../db/operations');
const starterComponents = require('../db/starter-components');
const statePersistence = require('../services/state-persistence');
const db = require('../db/database');

// Test database connection and structure
router.get('/test-db', (req, res) => {
    try {
        // Test basic connection
        db.prepare('SELECT 1').get();
        
        // Get table structure
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        
        // Get user_components table structure
        const userComponentsColumns = db.prepare("PRAGMA table_info(user_components)").all();
        
        res.json({
            status: 'ok',
            tables,
            userComponentsColumns,
            message: 'Database connection and structure verified'
        });
    } catch (error) {
        console.error('Database test failed:', error);
        res.status(500).json({
            status: 'error',
            error: error.message,
            stack: error.stack
        });
    }
});

// Test insert operation
router.post('/test-insert', (req, res) => {
    try {
        console.log('Testing direct insert...');
        
        // First verify the table exists
        const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_components'").get();
        console.log('Table check result:', tableCheck);
        
        if (!tableCheck) {
            throw new Error('user_components table does not exist');
        }

        // Verify we can read from the table
        const readTest = db.prepare('SELECT COUNT(*) as count FROM user_components').get();
        console.log('Read test result:', readTest);

        const stmt = db.prepare(`
            INSERT INTO user_components (
                original_starter_id,
                component_type,
                is_active,
                selection,
                prompt_value,
                user_value
            ) VALUES (?, ?, ?, ?, ?, ?)
        `);

        console.log('Executing insert with values:', {
            original_starter_id: 'role_starter',
            component_type: 'role',
            is_active: 1,
            selection: 'custom',
            prompt_value: 'You are a specialized AI assistant.',
            user_value: 'Custom role description'
        });

        const result = stmt.run(
            'role_starter',
            'role',
            1,
            'custom',
            'You are a specialized AI assistant.',
            'Custom role description'
        );

        console.log('Test insert result:', result);
        res.json({
            status: 'ok',
            id: result.lastInsertRowid,
            changes: result.changes,
            message: 'Test insert successful'
        });
    } catch (error) {
        console.error('Test insert failed:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            status: 'error',
            error: error.message,
            stack: error.stack,
            details: 'Check server logs for more information'
        });
    }
});

// Get all starter components
router.get('/starter-components', (req, res) => {
    res.json(starterComponents);
});

// Get all user components
router.get('/user-components', (req, res) => {
    try {
        const components = dbOps.getAllUserComponents();
        res.json(components);
    } catch (error) {
        console.error('Error fetching user components:', error);
        res.status(500).json({ error: 'Failed to fetch user components', details: error.message });
    }
});

// Create a new user component
router.post('/user-components', (req, res) => {
    try {
        console.log('Received component data:', req.body);
        
        // Validate required fields
        const requiredFields = ['original_starter_id', 'component_type', 'selection', 'prompt_value', 'user_value'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            return res.status(400).json({ 
                error: 'Missing required fields', 
                missingFields 
            });
        }

        // First verify the table exists
        const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user_components'").get();
        console.log('Table check result:', tableCheck);
        
        if (!tableCheck) {
            throw new Error('user_components table does not exist');
        }

        // Verify we can read from the table
        const readTest = db.prepare('SELECT COUNT(*) as count FROM user_components').get();
        console.log('Read test result:', readTest);

        const id = dbOps.createUserComponent(req.body);
        console.log('Component created successfully with ID:', id);
        
        // Mark state as dirty after creating a component
        statePersistence.markDirty();
        res.status(201).json({ id });
    } catch (error) {
        console.error('Error creating user component:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Failed to create user component', 
            details: error.message,
            stack: error.stack
        });
    }
});

// Update a user component
router.put('/user-components/:id', (req, res) => {
    try {
        const success = dbOps.updateUserComponent(req.params.id, req.body);
        if (success) {
            // Mark state as dirty after updating a component
            statePersistence.markDirty();
            res.json({ message: 'Component updated successfully' });
        } else {
            res.status(404).json({ error: 'Component not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user component' });
    }
});

// Delete a user component
router.delete('/user-components/:id', (req, res) => {
    try {
        const success = dbOps.deleteUserComponent(req.params.id);
        if (success) {
            // Mark state as dirty after deleting a component
            statePersistence.markDirty();
            res.json({ message: 'Component deleted successfully' });
        } else {
            res.status(404).json({ error: 'Component not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user component' });
    }
});

// Save application state
router.post('/state', async (req, res) => {
    try {
        const success = await statePersistence.saveState(req.body);
        if (success) {
            res.json({ message: 'State saved successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save state' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to save application state' });
    }
});

// Load application state
router.get('/state', async (req, res) => {
    try {
        const state = await statePersistence.loadState();
        res.json(state || {});
    } catch (error) {
        res.status(500).json({ error: 'Failed to load application state' });
    }
});

// Start auto-save
router.post('/state/auto-save/start', (req, res) => {
    try {
        const interval = req.body.interval || 30000;
        statePersistence.startAutoSave(interval);
        res.json({ message: 'Auto-save started' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to start auto-save' });
    }
});

// Stop auto-save
router.post('/state/auto-save/stop', (req, res) => {
    try {
        statePersistence.stopAutoSave();
        res.json({ message: 'Auto-save stopped' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to stop auto-save' });
    }
});

// Test transaction support
router.post('/test-transaction', async (req, res) => {
    try {
        console.log('Testing transaction support...');
        
        // Create a test component
        const component = {
            original_starter_id: 'test_starter',
            component_type: 'role',
            is_active: true,
            selection: 'custom',
            prompt_value: 'Test transaction',
            user_value: 'Test transaction'
        };

        // Simulate concurrent operations
        const results = await Promise.all([
            dbOps.createUserComponent(component),
            dbOps.createUserComponent(component)
        ]);

        res.json({
            status: 'ok',
            results,
            message: 'Transaction test completed'
        });
    } catch (error) {
        console.error('Transaction test failed:', error);
        res.status(500).json({
            status: 'error',
            error: error.message,
            stack: error.stack
        });
    }
});

module.exports = router; 