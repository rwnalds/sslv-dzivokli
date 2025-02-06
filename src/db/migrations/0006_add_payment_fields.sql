-- Add payment fields
ALTER TABLE "user" ADD COLUMN has_paid BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user" ADD COLUMN paid_at TIMESTAMP;

-- Migrate existing paid users
UPDATE "user" 
SET has_paid = true, 
    paid_at = CURRENT_TIMESTAMP 
WHERE stripe_product_id IS NOT NULL;

-- Remove old stripe fields
ALTER TABLE "user" DROP COLUMN stripe_customer_id;
ALTER TABLE "user" DROP COLUMN stripe_product_id; 