-- backend/database/schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Family Groups
CREATE TABLE IF NOT EXISTS groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  owner_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. Group Membership
CREATE TABLE IF NOT EXISTS group_members (
  group_id    UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT CHECK (role IN ('owner','member')) DEFAULT 'member',
  joined_at   TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- 4. Invites
CREATE TABLE IF NOT EXISTS invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID REFERENCES groups(id) ON DELETE CASCADE,
  token       TEXT UNIQUE NOT NULL,
  code        CHAR(6) UNIQUE,
  invited_by  UUID REFERENCES users(id),
  email       TEXT,
  used        BOOLEAN DEFAULT false,
  max_uses    INT DEFAULT 10,
  use_count   INT DEFAULT 0,
  expires_at  TIMESTAMPTZ NOT NULL
);

-- 5. Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID REFERENCES groups(id) ON DELETE CASCADE,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  description TEXT,
  instructions TEXT NOT NULL,
  servings    INT,
  prep_time_min INT,
  cook_time_min INT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 6. Ingredients
CREATE TABLE IF NOT EXISTS ingredients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id   UUID REFERENCES recipes(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  quantity    NUMERIC,
  unit        TEXT
);

-- 7. Weekly Plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID REFERENCES groups(id) ON DELETE CASCADE,
  week_start  DATE NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (group_id, week_start)
);

-- 8. Meal Plan Recipes
CREATE TABLE IF NOT EXISTS meal_plan_recipes (
  plan_id     UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_of_week SMALLINT CHECK (day_of_week BETWEEN 1 AND 7),
  recipe_id   UUID REFERENCES recipes(id) ON DELETE SET NULL,
  PRIMARY KEY (plan_id, day_of_week)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recipes_group_id ON recipes(group_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_recipes_recipe_id ON meal_plan_recipes(recipe_id);
