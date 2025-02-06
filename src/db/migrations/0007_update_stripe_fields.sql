-- Add new stripe_price_id column
ALTER TABLE "user" ADD COLUMN stripe_price_id TEXT;

-- Migrate existing paid users (if any still have stripe_product_id)
UPDATE "user" 
SET stripe_price_id = stripe_product_id 
WHERE stripe_product_id IS NOT NULL;

-- Drop old stripe_product_id column if it still exists
ALTER TABLE "user" DROP COLUMN IF EXISTS stripe_product_id; 