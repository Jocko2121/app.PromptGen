const db = require('../src/db/database');

function clearUserComponents() {
    try {
        const count = db.prepare('SELECT COUNT(*) as count FROM user_components').get().count;
        db.prepare('DELETE FROM user_components').run();
        console.log(`Deleted ${count} rows from user_components table.`);
    } catch (error) {
        console.error('Error clearing user_components table:', error);
        process.exit(1);
    }
}

clearUserComponents(); 