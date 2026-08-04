CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS user_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone_number VARCHAR(30),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  email_verified_at TIMESTAMPTZ,
  user_type_id UUID NOT NULL REFERENCES user_types(id) ON DELETE RESTRICT,
  login_count INTEGER NOT NULL DEFAULT 0,
  last_login_ip VARCHAR(45),
  last_login_at TIMESTAMPTZ,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  country_code VARCHAR(2),
  registration_ip VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_user_type_id_index
  ON users (user_type_id);

CREATE INDEX IF NOT EXISTS users_phone_number_index
  ON users (phone_number);

CREATE INDEX IF NOT EXISTS users_country_code_index
  ON users (country_code);

CREATE INDEX IF NOT EXISTS users_status_index
  ON users (status);

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  payload TEXT NOT NULL,
  token_type VARCHAR(20) NOT NULL CHECK (token_type IN ('access', 'refresh')),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  replaced_by_session_id VARCHAR(255) REFERENCES sessions(id) ON DELETE SET NULL,
  last_activity INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_id_index
  ON sessions (user_id);

CREATE INDEX IF NOT EXISTS sessions_last_activity_index
  ON sessions (last_activity);

CREATE INDEX IF NOT EXISTS sessions_token_type_index
  ON sessions (token_type);

CREATE INDEX IF NOT EXISTS sessions_expires_at_index
  ON sessions (expires_at);

INSERT INTO user_types (name)
VALUES ('customer'), ('admin')
ON CONFLICT (name) DO NOTHING;
