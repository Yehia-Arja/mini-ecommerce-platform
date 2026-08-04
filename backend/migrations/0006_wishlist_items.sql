CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,

  product_id UUID NOT NULL
    REFERENCES products(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS wishlist_items_product_id_index
  ON wishlist_items (product_id);
