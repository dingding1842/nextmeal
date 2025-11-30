/*
  # Add Sample Menu Items

  1. New Data
    - Insert sample menu items for lunch and dinner
    - Creates default menu options for the hostel meal system
  
  2. Menu Items
    - Lunch options: Rice with Chicken Curry, Vegetable Biryani, Fried Rice, Dal with Roti
    - Dinner options: Rice with Fish Curry, Chicken Biryani, Khichuri, Noodles with Vegetables
  
  3. Important Notes
    - These are sample menu items to get the system started
    - Chefs can add more items or modify availability later
    - All items are set as available by default
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM menu_items LIMIT 1) THEN
    INSERT INTO menu_items (name, meal_type, is_available) VALUES
      ('Rice with Chicken Curry', 'lunch', true),
      ('Vegetable Biryani', 'lunch', true),
      ('Fried Rice', 'lunch', true),
      ('Dal with Roti', 'lunch', true),
      ('Rice with Fish Curry', 'dinner', true),
      ('Chicken Biryani', 'dinner', true),
      ('Khichuri', 'dinner', true),
      ('Noodles with Vegetables', 'dinner', true);
  END IF;
END $$;
