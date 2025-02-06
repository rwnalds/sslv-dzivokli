-- Add category column with default 'sell'
ALTER TABLE search_criteria ADD COLUMN category TEXT NOT NULL DEFAULT 'sell';

-- Remove default after adding the column
ALTER TABLE search_criteria ALTER COLUMN category DROP DEFAULT; 