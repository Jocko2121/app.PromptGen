const express = require('express');
const router = express.Router();
const dbOps = require('../db/operations');
const backup = require('../db/backup');
const maintenance = require('../db/maintenance');
const cleanup = require('../db/cleanup');

// =================================================================================
// Components API
// =================================================================================

// GET all component data (types, prompts, sets, and visibility)
router.get('/components', (req, res) => {
    try {
        const types = dbOps.getAllComponentTypes();
        const components = dbOps.getAllUserComponents();
        const promptSets = dbOps.getAllPromptSets();
        const visibility = dbOps.getPromptSetVisibility();

        res.json({
            types,
            components,
            promptSets,
            visibility
        });
    } catch (error) {
        console.error('Error fetching all component data:', error);
        res.status(500).json({ error: 'Failed to fetch component data', details: error.message });
    }
});

// PUT to rename a component type
router.put('/component-types/:typeKey', (req, res) => {
    try {
        const { typeKey } = req.params;
        const { displayName } = req.body;

        if (!displayName) {
            return res.status(400).json({ error: 'displayName is required' });
        }

        const success = dbOps.renameComponentType(typeKey, displayName);

        if (success) {
            res.json({ message: 'Component type renamed successfully' });
        } else {
            res.status(404).json({ error: 'Component type not found' });
        }
    } catch (error) {
        console.error(`Error renaming component type ${req.params.typeKey}:`, error);
        res.status(500).json({ error: 'Failed to rename component type', details: error.message });
    }
});

// PUT to update prompt set visibility
router.put('/prompt-set-visibility', (req, res) => {
    try {
        const { promptSetId, componentTypeId, isVisible } = req.body;

        if (promptSetId == null || componentTypeId == null || typeof isVisible !== 'boolean') {
            return res.status(400).json({ error: 'promptSetId, componentTypeId, and isVisible (boolean) are required' });
        }

        const success = dbOps.updatePromptSetVisibility(promptSetId, componentTypeId, isVisible);

        // The UPSERT operation in the DB means this will always reflect the desired state.
        // We can confidently return success.
        res.json({ message: 'Visibility updated successfully' });

    } catch (error) {
        console.error(`Error updating prompt set visibility:`, error);
        res.status(500).json({ error: 'Failed to update visibility', details: error.message });
    }
});

// POST to create a new user component (prompt)
router.post('/user-components', (req, res) => {
    try {
        const id = dbOps.createUserComponent(req.body);
        res.status(201).json({ id });
    } catch (error) {
        console.error('Error creating user component:', error);
        res.status(500).json({
            error: 'Failed to create user component',
            details: error.message,
        });
    }
});

// PUT to update a user component
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

// DELETE a user component
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


// =================================================================================
// Database Maintenance & Backup API (Largely Unchanged)
// =================================================================================

// Create a new backup
router.post('/backup', async (req, res) => {
    try {
        const result = await backup.createBackup();
        if (result.success) {
            res.json({
                status: 'ok',
                message: 'Backup created successfully',
                backup: {
                    filename: result.filename,
                    path: result.path
                }
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Backup creation failed',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Backup creation failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Backup creation failed',
            error: error.message
        });
    }
});

// List available backups
router.get('/backups', (req, res) => {
    try {
        const backups = backup.getBackups();
        res.json({
            status: 'ok',
            backups: backups.map(b => ({
                name: b.name,
                time: b.time,
                path: b.path
            }))
        });
    } catch (error) {
        console.error('Error listing backups:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to list backups',
            error: error.message
        });
    }
});

// Restore from backup
router.post('/restore/:backupName', async (req, res) => {
    try {
        const result = await backup.restoreFromBackup(req.params.backupName);
        if (result.success) {
            res.json({
                status: 'ok',
                message: result.message,
                preRestoreBackup: result.preRestoreBackup
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Restore failed',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Restore failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Restore failed',
            error: error.message
        });
    }
});

// Database maintenance endpoints
router.get('/db/integrity', async (req, res) => {
    try {
        const results = maintenance.runIntegrityChecks();
        res.json({
            status: 'success',
            data: results
        });
    } catch (error) {
        console.error('Error running integrity checks:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to run integrity checks',
            error: error.message
        });
    }
});

router.post('/db/optimize', async (req, res) => {
    try {
        const result = maintenance.optimizeDatabase();
        if (result.success) {
            res.json({
                status: 'success',
                message: 'Database optimization completed successfully'
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Database optimization failed',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Error optimizing database:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to optimize database',
            error: error.message
        });
    }
});

// Database cleanup endpoint
router.post('/db/cleanup', async (req, res) => {
    try {
        const result = await cleanup.cleanupDatabase();
        if (result.success) {
            res.json({
                status: 'success',
                message: result.message,
                data: result.data
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: result.error
            });
        }
    } catch (error) {
        console.error('Error in cleanup endpoint:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to clean up database'
        });
    }
});

// Get database size endpoint
router.get('/db/size', (req, res) => {
    try {
        const result = cleanup.getDatabaseSize();
        if (result.success) {
            res.json({
                status: 'success',
                data: result.data
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: result.error
            });
        }
    } catch (error) {
        console.error('Error in size endpoint:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get database size'
        });
    }
});

// Create test components endpoint
router.post('/db/test-components', async (req, res) => {
    try {
        const result = await cleanup.createTestComponents();
        if (result.success) {
            res.json({
                status: 'success',
                message: result.message,
                data: result.data
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: result.error
            });
        }
    } catch (error) {
        console.error('Error in test components endpoint:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create test components'
        });
    }
});

module.exports = router; 