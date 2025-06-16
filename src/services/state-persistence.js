const dbOps = require('../db/operations');

class StatePersistenceService {
    constructor() {
        this.autoSaveInterval = null;
        this.lastSavedState = null;
        this.isDirty = false;
    }

    // Start auto-save with specified interval (default 30 seconds)
    startAutoSave(interval = 30000) {
        if (this.autoSaveInterval) {
            this.stopAutoSave();
        }

        this.autoSaveInterval = setInterval(() => {
            if (this.isDirty) {
                this.saveState();
            }
        }, interval);

        console.log(`Auto-save started with ${interval/1000} second interval`);
    }

    // Stop auto-save
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('Auto-save stopped');
        }
    }

    // Save current state
    async saveState(state) {
        try {
            // If no state provided, use the last known state
            const stateToSave = state || this.lastSavedState;
            
            if (!stateToSave) {
                console.log('No state to save');
                return false;
            }

            const success = await dbOps.saveAppState(stateToSave);
            
            if (success) {
                this.lastSavedState = stateToSave;
                this.isDirty = false;
                console.log('State saved successfully');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error saving state:', error);
            return false;
        }
    }

    // Load saved state
    async loadState() {
        try {
            const state = await dbOps.loadAppState();
            if (state) {
                this.lastSavedState = state;
                this.isDirty = false;
                console.log('State loaded successfully');
            }
            return state;
        } catch (error) {
            console.error('Error loading state:', error);
            return null;
        }
    }

    // Mark state as dirty (needs saving)
    markDirty() {
        this.isDirty = true;
    }

    // Check if state needs saving
    needsSaving() {
        return this.isDirty;
    }
}

// Create singleton instance
const statePersistence = new StatePersistenceService();

module.exports = statePersistence; 