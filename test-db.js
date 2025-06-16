const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Test database connection and basic operations
try {
    console.log('Node.js version:', process.version);
    console.log('Testing better-sqlite3 compatibility...');
    
    // Create a test database
    const db = new Database(':memory:');
    
    // Test basic SQLite operations
    db.exec(`
        CREATE TABLE test (
            id INTEGER PRIMARY KEY,
            data TEXT
        );
        INSERT INTO test (data) VALUES ('test data');
    `);
    
    const result = db.prepare('SELECT * FROM test').get();
    console.log('Test query result:', result);
    
    // Test JSON operations
    const testState = {
        test: 'data',
        timestamp: new Date().toISOString()
    };
    
    db.exec(`
        CREATE TABLE app_state (
            id INTEGER PRIMARY KEY,
            state_data TEXT,
            last_modified TIMESTAMP
        );
    `);
    
    const insert = db.prepare('INSERT INTO app_state (state_data, last_modified) VALUES (?, ?)');
    insert.run(JSON.stringify(testState), new Date().toISOString());
    
    const state = db.prepare('SELECT * FROM app_state').get();
    console.log('State test result:', JSON.parse(state.state_data));
    
    console.log('All tests passed successfully!');
    db.close();
} catch (error) {
    console.error('Error during compatibility test:', error);
    process.exit(1);
} 