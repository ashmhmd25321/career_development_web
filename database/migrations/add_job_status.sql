-- Migration: Add status column to jobs table
-- This migration adds job status management functionality

USE career_development;

-- Add status column to jobs table
ALTER TABLE jobs 
ADD COLUMN status ENUM('draft', 'active', 'paused', 'closed', 'expired') DEFAULT 'draft' AFTER is_featured;

-- Add index for status column for better query performance
ALTER TABLE jobs 
ADD INDEX idx_status (status);

-- Update existing jobs to have 'active' status if they are currently active
UPDATE jobs 
SET status = 'active' 
WHERE is_active = TRUE;

-- Update existing jobs to have 'closed' status if they are currently inactive
UPDATE jobs 
SET status = 'closed' 
WHERE is_active = FALSE;
