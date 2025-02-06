-- Add region column
ALTER TABLE search_criteria ADD COLUMN region TEXT NOT NULL DEFAULT 'Rīga';

-- Remove default after adding the column
ALTER TABLE search_criteria ALTER COLUMN region DROP DEFAULT; 