CREATE TABLE
IF NOT EXISTS carts
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  user_id UUID NOT NULL
    REFERENCES users
(id) ON
DELETE CASCADE,
  status VARCHAR(20)
NOT NULL DEFAULT 'active'
    CHECK
(status IN
('active', 'converted', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW
(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW
()
);

CREATE INDEX
IF NOT EXISTS carts_user_id_index
  ON carts
(user_id);

CREATE UNIQUE INDEX
IF NOT EXISTS carts_one_active_cart_per_user_index
  ON carts
(user_id)
  WHERE status = 'active';

CREATE TABLE
IF NOT EXISTS cart_items
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
  cart_id UUID NOT NULL
    REFERENCES carts
(id) ON
DELETE CASCADE,
  product_variant_id UUID
NOT NULL
    REFERENCES product_variants
(id) ON
DELETE CASCADE,
  quantity INTEGER
NOT NULL DEFAULT 1
    CHECK
(quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW
(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW
(),

  UNIQUE
(cart_id, product_variant_id)
);

CREATE INDEX
IF NOT EXISTS cart_items_cart_id_index
  ON cart_items
(cart_id);

CREATE INDEX
IF NOT EXISTS cart_items_product_variant_id_index
  ON cart_items
(product_variant_id);
