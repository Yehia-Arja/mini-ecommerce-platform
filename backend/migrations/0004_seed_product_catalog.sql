INSERT INTO products
  (
  id,
  title,
  description,
  base_price,
  image_url,
  status
  )
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Classic T-Shirt',
    'Soft everyday cotton t-shirt designed for casual wear and easy layering.',
    20.00,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Everyday Hoodie',
    'Midweight fleece hoodie with a relaxed fit for daily comfort.',
    48.00,
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
    'active'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Wireless Earbuds',
    'Compact Bluetooth earbuds with balanced sound and pocketable charging case.',
    79.00,
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80',
    'active'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Stainless Steel Bottle',
    'Double-wall insulated bottle that keeps drinks cold or hot for hours.',
    24.00,
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80',
    'active'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Running Shoes',
    'Lightweight running shoes built for all-day support and responsive cushioning.',
    96.00,
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    'active'
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'Ceramic Coffee Mug',
    'Minimal ceramic mug with a comfortable handle and matte finish.',
    14.00,
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    'active'
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    'Desk Lamp',
    'Adjustable LED desk lamp with warm task lighting for focused work.',
    42.00,
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    'active'
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    'Canvas Backpack',
    'Durable canvas backpack with a padded laptop sleeve and organizer pockets.',
    58.00,
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    'active'
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    'Scented Soy Candle',
    'Clean-burning soy candle with a subtle cedar and vanilla scent.',
    19.00,
    'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80',
    'active'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Portable Bluetooth Speaker',
    'Water-resistant speaker with rich bass and a full weekend battery life.',
    89.00,
    'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80',
    'active'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Yoga Mat',
    'Non-slip yoga mat with cushioned support for home and studio sessions.',
    34.00,
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    'active'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Mechanical Keyboard',
    'Compact mechanical keyboard with tactile switches and clean desk footprint.',
    110.00,
    'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80',
    'active'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Leather Wallet',
    'Slim leather wallet with card slots and a minimal cash sleeve.',
    36.00,
    'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80',
    'active'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Smartphone Stand',
    'Foldable aluminum stand for phones and small tablets on any desk.',
    18.00,
    'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=900&q=80',
    'active'
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'Travel Pouch',
    'Organized travel pouch for cables, chargers, and daily carry essentials.',
    26.00,
    'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=900&q=80',
    'active'
  );

INSERT INTO product_variants
  (
  id,
  product_id,
  name,
  code,
  override_price,
  stock_quantity,
  is_active
  )
VALUES
  (
    '11111111-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Black / Small',
    'TSHIRT-BLK-S',
    NULL,
    10,
    TRUE
  ),
  (
    '11111111-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Black / Medium',
    'TSHIRT-BLK-M',
    NULL,
    8,
    TRUE
  ),
  (
    '11111111-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'White / Large',
    'TSHIRT-WHT-L',
    22.00,
    5,
    TRUE
  ),
  (
    '22222222-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'Heather Gray / Medium',
    'HOODIE-HGRY-M',
    NULL,
    6,
    TRUE
  ),
  (
    '22222222-0000-0000-0000-000000000002',
    '22222222-2222-2222-2222-222222222222',
    'Heather Gray / Large',
    'HOODIE-HGRY-L',
    NULL,
    4,
    TRUE
  ),
  (
    '22222222-0000-0000-0000-000000000003',
    '22222222-2222-2222-2222-222222222222',
    'Black / XL',
    'HOODIE-BLK-XL',
    52.00,
    3,
    TRUE
  ),
  (
    '33333333-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'White',
    'EARBUDS-WHT',
    NULL,
    12,
    TRUE
  ),
  (
    '33333333-0000-0000-0000-000000000002',
    '33333333-3333-3333-3333-333333333333',
    'Black',
    'EARBUDS-BLK',
    NULL,
    9,
    TRUE
  ),
  (
    '33333333-0000-0000-0000-000000000003',
    '33333333-3333-3333-3333-333333333333',
    'Black / Wireless Charging Case',
    'EARBUDS-BLK-WC',
    89.00,
    5,
    TRUE
  ),
  (
    '44444444-0000-0000-0000-000000000001',
    '44444444-4444-4444-4444-444444444444',
    'Matte Black / 500ml',
    'BOTTLE-BLK-500',
    NULL,
    14,
    TRUE
  ),
  (
    '44444444-0000-0000-0000-000000000002',
    '44444444-4444-4444-4444-444444444444',
    'Ocean Blue / 750ml',
    'BOTTLE-BLU-750',
    27.00,
    10,
    TRUE
  ),
  (
    '44444444-0000-0000-0000-000000000003',
    '44444444-4444-4444-4444-444444444444',
    'Sand / 1L',
    'BOTTLE-SND-1L',
    29.00,
    6,
    TRUE
  ),
  (
    '55555555-0000-0000-0000-000000000001',
    '55555555-5555-5555-5555-555555555555',
    'Gray / 41',
    'RUNSHOE-GRY-41',
    NULL,
    7,
    TRUE
  ),
  (
    '55555555-0000-0000-0000-000000000002',
    '55555555-5555-5555-5555-555555555555',
    'Gray / 42',
    'RUNSHOE-GRY-42',
    NULL,
    5,
    TRUE
  ),
  (
    '55555555-0000-0000-0000-000000000003',
    '55555555-5555-5555-5555-555555555555',
    'Navy / 43',
    'RUNSHOE-NVY-43',
    102.00,
    4,
    TRUE
  ),
  (
    '66666666-0000-0000-0000-000000000001',
    '66666666-6666-6666-6666-666666666666',
    'Default',
    'MUG-DEFAULT',
    NULL,
    20,
    TRUE
  ),
  (
    '77777777-0000-0000-0000-000000000001',
    '77777777-7777-7777-7777-777777777777',
    'Default',
    'LAMP-DEFAULT',
    NULL,
    11,
    TRUE
  ),
  (
    '88888888-0000-0000-0000-000000000001',
    '88888888-8888-8888-8888-888888888888',
    'Default',
    'BACKPACK-DEFAULT',
    NULL,
    9,
    TRUE
  ),
  (
    '99999999-0000-0000-0000-000000000001',
    '99999999-9999-9999-9999-999999999999',
    'Default',
    'CANDLE-DEFAULT',
    NULL,
    18,
    TRUE
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Default',
    'SPEAKER-DEFAULT',
    NULL,
    7,
    TRUE
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Default',
    'YOGAMAT-DEFAULT',
    NULL,
    16,
    TRUE
  ),
  (
    'cccccccc-0000-0000-0000-000000000001',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Default',
    'KEYBOARD-DEFAULT',
    NULL,
    8,
    TRUE
  ),
  (
    'dddddddd-0000-0000-0000-000000000001',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Default',
    'WALLET-DEFAULT',
    NULL,
    13,
    TRUE
  ),
  (
    'eeeeeeee-0000-0000-0000-000000000001',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Default',
    'STAND-DEFAULT',
    NULL,
    25,
    TRUE
  ),
  (
    'ffffffff-0000-0000-0000-000000000001',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'Default',
    'POUCH-DEFAULT',
    NULL,
    17,
    TRUE
  );

INSERT INTO product_images
  (
  id,
  product_id,
  image_url,
  display_order,
  is_primary
  )
VALUES
  (
    '11111111-9999-9999-9999-999999999991',
    '11111111-1111-1111-1111-111111111111',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    0,
    TRUE
  ),
  (
    '22222222-9999-9999-9999-999999999992',
    '22222222-2222-2222-2222-222222222222',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
    0,
    TRUE
  ),
  (
    '33333333-9999-9999-9999-999999999993',
    '33333333-3333-3333-3333-333333333333',
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80',
    0,
    TRUE
  ),
  (
    '44444444-9999-9999-9999-999999999994',
    '44444444-4444-4444-4444-444444444444',
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80',
    0,
    TRUE
  ),
  (
    '55555555-9999-9999-9999-999999999995',
    '55555555-5555-5555-5555-555555555555',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    0,
    TRUE
  ),
  (
    '66666666-9999-9999-9999-999999999996',
    '66666666-6666-6666-6666-666666666666',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    0,
    TRUE
  ),
  (
    '77777777-9999-9999-9999-999999999997',
    '77777777-7777-7777-7777-777777777777',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    0,
    TRUE
  ),
  (
    '88888888-9999-9999-9999-999999999998',
    '88888888-8888-8888-8888-888888888888',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    0,
    TRUE
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    '99999999-9999-9999-9999-999999999999',
    'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80',
    0,
    TRUE
  ),
  (
    'aaaaaaaa-9999-9999-9999-99999999999a',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=900&q=80',
    0,
    TRUE
  ),
  (
    'bbbbbbbb-9999-9999-9999-99999999999b',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    0,
    TRUE
  ),
  (
    'cccccccc-9999-9999-9999-99999999999c',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80',
    0,
    TRUE
  ),
  (
    'dddddddd-9999-9999-9999-99999999999d',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80',
    0,
    TRUE
  ),
  (
    'eeeeeeee-9999-9999-9999-99999999999e',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=900&q=80',
    0,
    TRUE
  ),
  (
    'ffffffff-9999-9999-9999-99999999999f',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=900&q=80',
    0,
    TRUE
  );
