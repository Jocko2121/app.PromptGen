-- Add a test column to user_components
ALTER TABLE user_components ADD COLUMN test_column TEXT DEFAULT 'test_value';

-- Verify the column was added
SELECT test_column FROM user_components LIMIT 1; 