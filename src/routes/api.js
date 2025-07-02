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
// Now uses project-based data from Default Project (ID=1)
router.get('/components', (req, res) => {
    try {
        const DEFAULT_PROJECT_ID = 1;
        
        const types = dbOps.getAllComponentTypes();
        const components = dbOps.getAllProjectComponents(DEFAULT_PROJECT_ID);
        const promptSets = dbOps.getAllProjectPromptSets(DEFAULT_PROJECT_ID);
        const visibility = dbOps.getProjectPromptSetVisibility(DEFAULT_PROJECT_ID);

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

// =================================================================================
// Test API - Verify Project Structure
// =================================================================================

// GET test endpoint to verify Default Project creation
router.get('/test/default-project', (req, res) => {
    try {
        const db = require('../db/database');
        
        // Get Default Project info
        const defaultProject = db.prepare(`
            SELECT id, name, description, created_at, modified_at 
            FROM projects WHERE id = 1
        `).get();

        if (!defaultProject) {
            return res.status(404).json({
                status: 'error',
                message: 'Default Project not found'
            });
        }

        // Count project components by type
        const componentCounts = db.prepare(`
            SELECT ct.type_key, ct.display_name, COUNT(pc.id) as count
            FROM component_types ct
            LEFT JOIN project_components pc ON ct.id = pc.component_type_id AND pc.project_id = 1
            GROUP BY ct.id, ct.type_key, ct.display_name
            ORDER BY ct.type_key
        `).all();

        const totalComponents = componentCounts.reduce((sum, type) => sum + type.count, 0);

        // Get project prompt sets
        const promptSets = db.prepare(`
            SELECT set_key, display_name, is_active, created_at
            FROM project_prompt_sets 
            WHERE project_id = 1
            ORDER BY set_key
        `).all();

        // Get content blocks
        const contentBlocks = db.prepare(`
            SELECT block_type, active_draft_id, created_at
            FROM project_content_blocks 
            WHERE project_id = 1
            ORDER BY block_type
        `).all();

        // Count drafts per content block
        const draftCounts = db.prepare(`
            SELECT pcb.block_type, COUNT(pd.id) as draft_count
            FROM project_content_blocks pcb
            LEFT JOIN project_drafts pd ON pcb.id = pd.content_block_id
            WHERE pcb.project_id = 1
            GROUP BY pcb.id, pcb.block_type
            ORDER BY pcb.block_type
        `).all();

        // Get project settings
        const settings = db.prepare(`
            SELECT text_transformer_active_action, text_transformer_options, ui_settings
            FROM project_settings 
            WHERE project_id = 1
        `).get();

        // Get visibility count
        const visibilityCount = db.prepare(`
            SELECT COUNT(*) as count
            FROM project_prompt_set_visibility 
            WHERE project_id = 1
        `).get();

        // Sample of actual components to verify data integrity
        const sampleComponents = db.prepare(`
            SELECT ct.type_key, pc.selection, pc.prompt_value, pc.is_active, pc.is_starter
            FROM project_components pc
            JOIN component_types ct ON pc.component_type_id = ct.id
            WHERE pc.project_id = 1
            ORDER BY ct.type_key, pc.selection
            LIMIT 10
        `).all();

        res.json({
            status: 'success',
            message: 'Default Project verification complete',
            defaultProject: {
                id: defaultProject.id,
                name: defaultProject.name,
                description: defaultProject.description,
                created_at: defaultProject.created_at,
                modified_at: defaultProject.modified_at
            },
            components: {
                total: totalComponents,
                byType: componentCounts.reduce((acc, type) => {
                    acc[type.type_key] = type.count;
                    return acc;
                }, {}),
                details: componentCounts,
                sample: sampleComponents
            },
            promptSets: promptSets.map(ps => ({
                set_key: ps.set_key,
                display_name: ps.display_name,
                is_active: !!ps.is_active,
                created_at: ps.created_at
            })),
            contentBlocks: {
                blocks: contentBlocks.map(cb => ({
                    type: cb.block_type,
                    active_draft_id: cb.active_draft_id,
                    created_at: cb.created_at
                })),
                drafts: draftCounts
            },
            settings: settings ? {
                text_transformer_active_action: settings.text_transformer_active_action,
                text_transformer_options: settings.text_transformer_options,
                ui_settings: settings.ui_settings
            } : null,
            visibility: {
                total_rules: visibilityCount.count
            },
            database_info: {
                tables_created: true,
                project_structure: 'complete'
            }
        });
    } catch (error) {
        console.error('Error verifying Default Project:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to verify Default Project',
            error: error.message
        });
    }
});

// =================================================================================
// Components API (continued)
// =================================================================================

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
// Now uses project-scoped visibility for Default Project (ID=1)
router.put('/prompt-set-visibility', (req, res) => {
    try {
        const DEFAULT_PROJECT_ID = 1;
        const { promptSetId, componentTypeId, isVisible } = req.body;

        if (promptSetId == null || componentTypeId == null || typeof isVisible !== 'boolean') {
            return res.status(400).json({ error: 'promptSetId, componentTypeId, and isVisible (boolean) are required' });
        }

        const success = dbOps.updateProjectPromptSetVisibility(DEFAULT_PROJECT_ID, promptSetId, componentTypeId, isVisible);

        // The UPSERT operation in the DB means this will always reflect the desired state.
        // We can confidently return success.
        res.json({ message: 'Visibility updated successfully' });

    } catch (error) {
        console.error(`Error updating prompt set visibility:`, error);
        res.status(500).json({ error: 'Failed to update visibility', details: error.message });
    }
});

// PUT to update project settings
// Now uses project-scoped settings for Default Project (ID=1)
router.put('/project-settings', (req, res) => {
    try {
        const DEFAULT_PROJECT_ID = 1;
        const settings = req.body;

        if (!settings || Object.keys(settings).length === 0) {
            return res.status(400).json({ error: 'Settings object is required' });
        }

        const success = dbOps.updateProjectSettings(DEFAULT_PROJECT_ID, settings);

        if (success) {
            res.json({ message: 'Project settings updated successfully' });
        } else {
            res.status(400).json({ error: 'No valid settings fields provided' });
        }

    } catch (error) {
        console.error(`Error updating project settings:`, error);
        res.status(500).json({ error: 'Failed to update project settings', details: error.message });
    }
});

// POST to create a new user component (prompt)
// Now creates components in Default Project (ID=1)
router.post('/user-components', (req, res) => {
    try {
        const DEFAULT_PROJECT_ID = 1;
        const id = dbOps.createProjectComponent(DEFAULT_PROJECT_ID, req.body);
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
// Now updates components in Default Project (ID=1)
router.put('/user-components/:id', (req, res) => {
    try {
        const DEFAULT_PROJECT_ID = 1;
        const success = dbOps.updateProjectComponent(DEFAULT_PROJECT_ID, req.params.id, req.body);
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
// Now deletes components from Default Project (ID=1)
router.delete('/user-components/:id', (req, res) => {
    try {
        const DEFAULT_PROJECT_ID = 1;
        const success = dbOps.deleteProjectComponent(DEFAULT_PROJECT_ID, req.params.id);
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
// Project Management API
// =================================================================================

// GET all projects
router.get('/projects', (req, res) => {
    try {
        const projects = dbOps.getAllProjects();
        res.json({
            status: 'success',
            projects: projects.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                created_at: p.created_at,
                modified_at: p.modified_at
            }))
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ 
            status: 'error',
            error: 'Failed to fetch projects', 
            details: error.message 
        });
    }
});

// GET specific project details
router.get('/projects/:id', (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        
        if (isNaN(projectId)) {
            return res.status(400).json({ 
                status: 'error',
                error: 'Invalid project ID' 
            });
        }

        const project = dbOps.getProject(projectId);
        
        if (!project) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Project not found' 
            });
        }

        // Get component count for this project
        const components = dbOps.getAllProjectComponents(projectId);
        const promptSets = dbOps.getAllProjectPromptSets(projectId);
        const contentBlocks = dbOps.getProjectContentBlocks(projectId);
        const settings = dbOps.getProjectSettings(projectId);

        res.json({
            status: 'success',
            project: {
                id: project.id,
                name: project.name,
                description: project.description,
                created_at: project.created_at,
                modified_at: project.modified_at,
                settings: settings,
                stats: {
                    component_count: components.length,
                    prompt_set_count: promptSets.length,
                    content_block_count: contentBlocks.length,
                    has_settings: !!settings
                }
            }
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ 
            status: 'error',
            error: 'Failed to fetch project', 
            details: error.message 
        });
    }
});

// POST create new project
router.post('/projects', (req, res) => {
    try {
        const { name, description = '', copyFromProjectId = null } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ 
                status: 'error',
                error: 'Project name is required' 
            });
        }

        // Create the new project
        const newProjectId = dbOps.createProject(name.trim(), description.trim());
        
        // Initialize the new project with required structure
        try {
            dbOps.initializeNewProject(newProjectId);
        } catch (initError) {
            console.error('Error initializing new project:', initError);
            // Project was created but initialization failed
            return res.status(201).json({
                status: 'partial_success',
                message: 'Project created but initialization failed',
                project: {
                    id: newProjectId,
                    name: name.trim(),
                    description: description.trim()
                },
                warning: 'Project structure may be incomplete',
                init_error: initError.message
            });
        }

        if (copyFromProjectId) {
            // Copy data from existing project
            try {
                const sourceProjectId = parseInt(copyFromProjectId);
                
                if (isNaN(sourceProjectId)) {
                    return res.status(400).json({ 
                        status: 'error',
                        error: 'Invalid source project ID' 
                    });
                }

                // Verify source project exists
                const sourceProject = dbOps.getProject(sourceProjectId);
                if (!sourceProject) {
                    return res.status(404).json({ 
                        status: 'error',
                        error: 'Source project not found' 
                    });
                }

                // Copy components
                const sourceComponents = dbOps.getAllProjectComponents(sourceProjectId);
                for (const component of sourceComponents) {
                    dbOps.createProjectComponent(newProjectId, {
                        component_type_id: component.component_type_id,
                        is_active: component.is_active,
                        selection: component.selection,
                        prompt_value: component.prompt_value,
                        user_value: component.user_value,
                        is_starter: component.is_starter
                    });
                }

                // Copy prompt sets (update existing ones from initialization)
                const sourcePromptSets = dbOps.getAllProjectPromptSets(sourceProjectId);
                const existingPromptSets = dbOps.getAllProjectPromptSets(newProjectId);
                const promptSetMapping = {}; // old ID -> new ID
                
                for (const promptSet of sourcePromptSets) {
                    // Check if prompt set already exists (from initialization)
                    const existing = existingPromptSets.find(ps => ps.set_key === promptSet.set_key);
                    if (existing) {
                        // Use existing prompt set and update its properties to match source
                        promptSetMapping[promptSet.id] = existing.id;
                        dbOps.updateProjectPromptSet(newProjectId, existing.id, {
                            display_name: promptSet.display_name,
                            is_active: promptSet.is_active
                        });
                    } else {
                        // Create new prompt set (shouldn't happen with standard sets, but handle edge cases)
                        try {
                            const newPromptSetId = dbOps.createProjectPromptSet(newProjectId, {
                                set_key: promptSet.set_key,
                                display_name: promptSet.display_name,
                                is_active: promptSet.is_active
                            });
                            promptSetMapping[promptSet.id] = newPromptSetId;
                        } catch (createError) {
                            // If creation fails due to UNIQUE constraint, find the existing one
                            const refreshedExisting = dbOps.getAllProjectPromptSets(newProjectId);
                            const foundExisting = refreshedExisting.find(ps => ps.set_key === promptSet.set_key);
                            if (foundExisting) {
                                promptSetMapping[promptSet.id] = foundExisting.id;
                            } else {
                                console.error('Failed to create or find prompt set:', createError);
                            }
                        }
                    }
                }

                // Copy visibility settings
                const sourceVisibility = dbOps.getProjectPromptSetVisibility(sourceProjectId);
                for (const visibility of sourceVisibility) {
                    const newPromptSetId = promptSetMapping[visibility.prompt_set_id];
                    if (newPromptSetId) {
                        dbOps.updateProjectPromptSetVisibility(
                            newProjectId, 
                            newPromptSetId, 
                            visibility.component_type_id, 
                            visibility.is_visible
                        );
                    }
                }

                // Copy content blocks and their active drafts
                const sourceContentBlocks = dbOps.getProjectContentBlocks(sourceProjectId);
                for (const block of sourceContentBlocks) {
                    // Content blocks are created automatically during project creation
                    // We just need to copy the active draft content if it exists
                    if (block.active_draft_id) {
                        const sourceDrafts = dbOps.getProjectDrafts(sourceProjectId, block.block_type);
                        const activeDraft = sourceDrafts.find(d => d.id === block.active_draft_id);
                        
                        if (activeDraft && activeDraft.content) {
                            // Create new draft with the same content
                            const newDraftId = `${block.block_type}_${newProjectId}_${Date.now()}`;
                            dbOps.createProjectDraft(newProjectId, block.block_type, newDraftId, activeDraft.content);
                        }
                    }
                }

                // Copy settings
                const sourceSettings = dbOps.getProjectSettings(sourceProjectId);
                if (sourceSettings) {
                    dbOps.updateProjectSettings(newProjectId, {
                        text_transformer_active_action: sourceSettings.text_transformer_active_action,
                        text_transformer_options: sourceSettings.text_transformer_options,
                        ui_settings: sourceSettings.ui_settings
                    });
                }

                res.status(201).json({
                    status: 'success',
                    message: 'Project created and copied successfully',
                    project: {
                        id: newProjectId,
                        name: name.trim(),
                        description: description.trim(),
                        copied_from: sourceProjectId,
                        copied_from_name: sourceProject.name
                    }
                });

            } catch (copyError) {
                console.error('Error copying project data:', copyError);
                // Project was created but copying failed
                res.status(201).json({
                    status: 'partial_success',
                    message: 'Project created but copying failed',
                    project: {
                        id: newProjectId,
                        name: name.trim(),
                        description: description.trim()
                    },
                    warning: 'Project was created empty due to copy error',
                    copy_error: copyError.message
                });
            }
        } else {
            // Create empty project (content blocks, settings, etc. are created automatically by initialization)
            res.status(201).json({
                status: 'success',
                message: 'Empty project created successfully',
                project: {
                    id: newProjectId,
                    name: name.trim(),
                    description: description.trim()
                }
            });
        }

    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ 
            status: 'error',
            error: 'Failed to create project', 
            details: error.message 
        });
    }
});

// PUT update project
router.put('/projects/:id', (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const { name, description } = req.body;

        if (isNaN(projectId)) {
            return res.status(400).json({ 
                status: 'error',
                error: 'Invalid project ID' 
            });
        }

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ 
                status: 'error',
                error: 'Project name is required' 
            });
        }

        const updates = {
            name: name.trim()
        };

        if (description !== undefined) {
            updates.description = description.trim();
        }

        const success = dbOps.updateProject(projectId, updates);

        if (success) {
            res.json({
                status: 'success',
                message: 'Project updated successfully'
            });
        } else {
            res.status(404).json({ 
                status: 'error',
                error: 'Project not found' 
            });
        }
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ 
            status: 'error',
            error: 'Failed to update project', 
            details: error.message 
        });
    }
});

// DELETE project
router.delete('/projects/:id', (req, res) => {
    try {
        const projectId = parseInt(req.params.id);

        if (isNaN(projectId)) {
            return res.status(400).json({ 
                status: 'error',
                error: 'Invalid project ID' 
            });
        }

        // Prevent deletion of Default Project
        if (projectId === 1) {
            return res.status(403).json({ 
                status: 'error',
                error: 'Cannot delete the Default Project' 
            });
        }

        // Verify project exists
        const project = dbOps.getProject(projectId);
        if (!project) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Project not found' 
            });
        }

        const success = dbOps.deleteProject(projectId);

        if (success) {
            res.json({
                status: 'success',
                message: `Project "${project.name}" deleted successfully`
            });
        } else {
            res.status(500).json({ 
                status: 'error',
                error: 'Failed to delete project' 
            });
        }
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ 
            status: 'error',
            error: 'Failed to delete project', 
            details: error.message 
        });
    }
});

// GET project-specific component data
router.get('/projects/:id/components', (req, res) => {
    try {
        const projectId = parseInt(req.params.id);

        if (isNaN(projectId)) {
            return res.status(400).json({ 
                status: 'error',
                error: 'Invalid project ID' 
            });
        }

        // Verify project exists
        const project = dbOps.getProject(projectId);
        if (!project) {
            return res.status(404).json({ 
                status: 'error',
                error: 'Project not found' 
            });
        }

        const types = dbOps.getAllComponentTypes();
        const components = dbOps.getAllProjectComponents(projectId);
        const promptSets = dbOps.getAllProjectPromptSets(projectId);
        const visibility = dbOps.getProjectPromptSetVisibility(projectId);
        const contentBlocks = dbOps.getProjectContentBlocks(projectId);
        const settings = dbOps.getProjectSettings(projectId);

        // Transform content blocks into the expected format
        const contentBlocksMap = {};
        contentBlocks.forEach(block => {
            contentBlocksMap[block.block_key] = {
                id: block.id,
                content: block.content,
                block_key: block.block_key,
                project_id: block.project_id
            };
        });

        res.json({
            status: 'success',
            project: {
                id: project.id,
                name: project.name
            },
            data: {
                types,
                components,
                promptSets,
                visibility,
                contentBlocks: contentBlocksMap,
                settings: settings || {}
            }
        });
    } catch (error) {
        console.error('Error fetching project components:', error);
        res.status(500).json({ 
            status: 'error',
            error: 'Failed to fetch project components', 
            details: error.message 
        });
    }
});

// =================================================================================
// Test API - Project Management
// =================================================================================

// GET test endpoint to verify project management functionality
router.get('/test/project-management', (req, res) => {
    try {
        const projects = dbOps.getAllProjects();
        
        const projectDetails = projects.map(project => {
            const components = dbOps.getAllProjectComponents(project.id);
            const promptSets = dbOps.getAllProjectPromptSets(project.id);
            const contentBlocks = dbOps.getProjectContentBlocks(project.id);
            const settings = dbOps.getProjectSettings(project.id);
            
            return {
                id: project.id,
                name: project.name,
                description: project.description,
                created_at: project.created_at,
                modified_at: project.modified_at,
                stats: {
                    components: components.length,
                    prompt_sets: promptSets.length,
                    content_blocks: contentBlocks.length,
                    has_settings: !!settings
                }
            };
        });

        res.json({
            status: 'success',
            message: 'Project management test complete',
            total_projects: projects.length,
            projects: projectDetails,
            infrastructure_status: {
                project_operations: 'ready',
                component_operations: 'ready',
                content_management: 'ready',
                settings_management: 'ready'
            }
        });
    } catch (error) {
        console.error('Error in project management test:', error);
        res.status(500).json({
            status: 'error',
            message: 'Project management test failed',
            error: error.message
        });
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