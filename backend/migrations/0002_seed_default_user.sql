WITH customer_user_type AS (
  SELECT id
  FROM user_types
  WHERE name = 'customer'
)
INSERT INTO users (
  first_name,
  last_name,
  email,
  password,
  status,
  email_verified_at,
  user_type_id,
  language,
  created_at,
  updated_at
)
SELECT
  'Demo',
  'Customer',
  'customer@email.com',
  'aaeec7886ab586b039e3566d85d97611:228ca36bee955a15edb29b720a8b134f471b72f2c7f32469fe6b6e61c69bae00add315aea78e7317ca0912f405bcb90e1e5e774bb6d62b48a639d953e38e7931',
  'active',
  NOW(),
  customer_user_type.id,
  'en',
  NOW(),
  NOW()
FROM customer_user_type
ON CONFLICT (email) DO NOTHING;
