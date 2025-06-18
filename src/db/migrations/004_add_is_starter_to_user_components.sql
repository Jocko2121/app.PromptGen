-- Migration: Add is_starter column to user_components
ALTER TABLE user_components ADD COLUMN is_starter INTEGER NOT NULL DEFAULT 0; 