-- Update some jobs to be featured for testing recommendations
UPDATE jobs SET is_featured = TRUE WHERE id IN (1, 2, 3);
