UPDATE users
SET
  password = '415ac3328fe05e724366930af344ca36:8038eb2a179ab7a2a615185fe9b2d8ac86a283ba77ddccbf5c1f2cfb57f5c1ea505ec8e92935db0f9f609f530fb266a3bd0e731e9103a7389f620a167eb50618',
  updated_at = NOW()
WHERE email = 'customer@email.com';
