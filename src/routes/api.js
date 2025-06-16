const express = require('express');
const router = express.Router();
const dbOps = require('../db/operations');
const starterComponents = require('../db/starter-components');

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
        res.status(500).json({ error: 'Failed to fetch user components' });
    }
});

// Create a new user component
router.post('/user-components', (req, res) => {
    try {
        const id = dbOps.createUserComponent(req.body);
        res.status(201).json({ id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user component' });
    }
});

// Update a user component
router.put('/user-components/:id', (req, res) => {
    try {
        const success = dbOps.updateUserComponent(req.params.id, req.body);
        if (success) {
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
            res.json({ message: 'Component deleted successfully' });
        } else {
            res.status(404).json({ error: 'Component not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user component' });
    }
});

// Save application state
router.post('/state', (req, res) => {
    try {
        const success = dbOps.saveAppState(req.body);
        res.json({ success });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save application state' });
    }
});

// Load application state
router.get('/state', (req, res) => {
    try {
        const state = dbOps.loadAppState();
        res.json(state || {});
    } catch (error) {
        res.status(500).json({ error: 'Failed to load application state' });
    }
});

module.exports = router; 