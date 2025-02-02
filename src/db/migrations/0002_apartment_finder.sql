-- Drop old tables
DROP TABLE IF EXISTS reminder;
DROP TABLE IF EXISTS pet;

-- Create new tables
CREATE TABLE search_criteria (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  district TEXT,
  min_rooms INTEGER,
  max_rooms INTEGER,
  min_price NUMERIC,
  max_price NUMERIC,
  min_area NUMERIC,
  max_area NUMERIC,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  last_checked TIMESTAMP
);

CREATE TABLE found_listings (
  id SERIAL PRIMARY KEY,
  criteria_id INTEGER NOT NULL REFERENCES search_criteria(id) ON DELETE CASCADE,
  ss_url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  price NUMERIC,
  rooms INTEGER,
  area NUMERIC,
  district TEXT,
  description TEXT,
  found_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  notified BOOLEAN DEFAULT false NOT NULL
); 