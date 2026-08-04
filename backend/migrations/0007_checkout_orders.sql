CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES users(id) ON DELETE RESTRICT,

  cart_id UUID
    REFERENCES carts(id) ON DELETE SET NULL,

  status VARCHAR(20) NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'cancelled')),

  total_amount NUMERIC(10, 2) NOT NULL
    CHECK (total_amount >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_user_id_index
  ON orders (user_id);

CREATE INDEX IF NOT EXISTS orders_status_index
  ON orders (status);

CREATE INDEX IF NOT EXISTS orders_created_at_index
  ON orders (created_at);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID NOT NULL
    REFERENCES orders(id) ON DELETE CASCADE,

  product_id UUID
    REFERENCES products(id) ON DELETE SET NULL,

  product_variant_id UUID
    REFERENCES product_variants(id) ON DELETE SET NULL,

  product_title VARCHAR(255) NOT NULL,
  variant_name VARCHAR(255) NOT NULL,
  variant_code VARCHAR(100) NOT NULL,

  unit_price NUMERIC(10, 2) NOT NULL
    CHECK (unit_price >= 0),

  quantity INTEGER NOT NULL
    CHECK (quantity > 0),

  line_total NUMERIC(10, 2) NOT NULL
    CHECK (line_total >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS order_items_order_id_index
  ON order_items (order_id);

CREATE INDEX IF NOT EXISTS order_items_product_variant_id_index
  ON order_items (product_variant_id);
