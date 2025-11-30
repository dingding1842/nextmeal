/*
  # NextMeal Hostel Meal Management System Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `display_name` (text, required)
      - `phone` (text, optional)
      - `role` (text, default 'tenant', values: admin, accountant, tenant, chef)
      - `room_number` (text, optional)
      - `balance` (numeric, default 0)
      - `is_approved` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `menu_items`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `meal_type` (text, required, values: lunch, dinner)
      - `is_available` (boolean, default true)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `menu_item_id` (uuid, references menu_items)
      - `order_date` (date, required)
      - `meal_type` (text, required, values: lunch, dinner)
      - `quantity` (integer, default 1)
      - `amount_paid` (numeric, default 100)
      - `created_at` (timestamptz)
    
  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Tenants can only view/manage their own orders
    - Chefs can view all orders and manage menu items
    - Accountants can view all orders and user balances
    - Admins have full access to all data

  3. Important Notes
    - Balance is deducted automatically per meal (100 per meal)
    - New users require admin/accountant approval
    - Time constraints enforced at application level
    - GMT+6 timezone considerations handled in app logic
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'tenant' CHECK (role IN ('admin', 'accountant', 'tenant', 'chef')),
  room_number text,
  balance numeric DEFAULT 0 CHECK (balance >= 0),
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('lunch', 'dinner')),
  is_available boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  order_date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('lunch', 'dinner')),
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  amount_paid numeric DEFAULT 100 CHECK (amount_paid >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, order_date, meal_type)
);

CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_meal_type ON orders(meal_type);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_approved ON profiles(is_approved);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile display name and phone"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = role AND
    (SELECT is_approved FROM profiles WHERE id = auth.uid()) = is_approved AND
    (SELECT balance FROM profiles WHERE id = auth.uid()) = balance AND
    (SELECT room_number FROM profiles WHERE id = auth.uid()) = room_number
  );

CREATE POLICY "Admins and accountants can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'accountant')
      AND profiles.is_approved = true
    )
  );

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_approved = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.is_approved = true
    )
  );

CREATE POLICY "Accountants can update user balance and approval"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'accountant'
      AND profiles.is_approved = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'accountant'
      AND profiles.is_approved = true
    ) AND
    (SELECT role FROM profiles WHERE id = profiles.id) = role
  );

CREATE POLICY "Everyone can view available menu items"
  ON menu_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Chefs can insert menu items"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'chef'
      AND profiles.is_approved = true
    )
  );

CREATE POLICY "Chefs can update menu items"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'chef'
      AND profiles.is_approved = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'chef'
      AND profiles.is_approved = true
    )
  );

CREATE POLICY "Chefs can delete menu items"
  ON menu_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'chef'
      AND profiles.is_approved = true
    )
  );

CREATE POLICY "Tenants can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'accountant', 'chef')
      AND profiles.is_approved = true
    )
  );

CREATE POLICY "Tenants can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tenant'
      AND profiles.is_approved = true
    )
  );

CREATE POLICY "Tenants can delete own orders"
  ON orders FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tenant'
      AND profiles.is_approved = true
    )
  );

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone, role, is_approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone'),
    'tenant',
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS menu_items_updated_at ON menu_items;
CREATE TRIGGER menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();