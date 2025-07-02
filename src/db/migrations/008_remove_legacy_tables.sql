-- 008_remove_legacy_tables.sql
-- Remove legacy tables that are no longer used after project-based migration

-- Drop the legacy user_components table
-- All functionality has been moved to project_components
DROP TABLE IF EXISTS user_components;

-- Drop the legacy prompt_sets table  
-- All functionality has been moved to project_prompt_sets
DROP TABLE IF EXISTS prompt_sets;

-- Drop the legacy prompt_set_component_visibility table
-- All functionality has been moved to project_prompt_set_visibility  
DROP TABLE IF EXISTS prompt_set_component_visibility; 