-- Update subscription plans prices to FCFA
UPDATE subscription_plans 
SET 
  price_monthly = 11500,
  price_yearly = 115000,
  currency = 'XOF'
WHERE name = 'Professional';

UPDATE subscription_plans 
SET 
  price_monthly = 28500,
  price_yearly = 285000,
  currency = 'XOF'
WHERE name = 'Enterprise';

-- Also update Starter plan to FCFA for consistency
UPDATE subscription_plans 
SET 
  currency = 'XOF'
WHERE name = 'Starter';