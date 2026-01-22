-- PickMyLab - Sample Data Script
-- Run this to add sample categories, tests, and lab partners

-- 1. Insert Test Categories
INSERT INTO test_categories (name, slug, description, display_order, is_active) VALUES
('Blood Tests', 'blood-tests', 'Complete blood count and related tests', 1, true),
('Heart Health', 'heart-health', 'Cardiovascular and heart health tests', 2, true),
('Diabetes', 'diabetes', 'Diabetes screening and monitoring tests', 3, true),
('General Health', 'general-health', 'General health screening tests', 4, true),
('Women''s Health', 'womens-health', 'Women specific health tests', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Lab Partners
INSERT INTO lab_partners (name, code, contact_email, contact_phone, address, city, service_zones, is_active, rating, total_reviews) VALUES
('City Lab', 'CITYLAB', 'info@citylab.com', '+97141234567', '123 Main Street, Dubai', 'Dubai', ARRAY['Dubai', 'Abu Dhabi', 'Sharjah'], true, 4.5, 120),
('Advanced Diagnostics', 'AD001', 'info@advanceddiagnostics.com', '+97141234568', '456 Business Bay, Dubai', 'Dubai', ARRAY['Dubai'], true, 4.2, 85),
('MedLab', 'ML001', 'info@medlab.com', '+97141234569', '789 Marina, Dubai', 'Dubai', ARRAY['Dubai', 'Abu Dhabi'], true, 4.7, 200)
ON CONFLICT (code) DO NOTHING;

-- 3. Insert Tests
INSERT INTO tests (name, code, category_id, description, sample_type, fasting_required, special_instructions, is_active) VALUES
('Complete Blood Count', 'CBC', (SELECT id FROM test_categories WHERE slug = 'blood-tests' LIMIT 1), 'Full blood count test including red cells, white cells, and platelets', 'blood', false, 'No special preparation required', true),
('Lipid Profile', 'LIPID', (SELECT id FROM test_categories WHERE slug = 'heart-health' LIMIT 1), 'Cholesterol and lipid panel test', 'blood', true, 'Fasting required for 12 hours', true),
('HbA1c', 'HBA1C', (SELECT id FROM test_categories WHERE slug = 'diabetes' LIMIT 1), 'Hemoglobin A1c test for diabetes monitoring', 'blood', false, 'No fasting required', true),
('Thyroid Function Test', 'TFT', (SELECT id FROM test_categories WHERE slug = 'general-health' LIMIT 1), 'Complete thyroid function panel', 'blood', false, 'No special preparation', true),
('Vitamin D', 'VITD', (SELECT id FROM test_categories WHERE slug = 'general-health' LIMIT 1), 'Vitamin D level test', 'blood', false, 'No special preparation', true),
('Urine Analysis', 'UA', (SELECT id FROM test_categories WHERE slug = 'general-health' LIMIT 1), 'Complete urine analysis', 'urine', false, 'Mid-stream sample preferred', true),
('Pregnancy Test', 'PREGNANT', (SELECT id FROM test_categories WHERE slug = 'womens-health' LIMIT 1), 'Pregnancy detection test', 'urine', false, 'First morning urine preferred', true)
ON CONFLICT (code) DO NOTHING;

-- 4. Insert Test Pricing
INSERT INTO lab_test_pricing (lab_partner_id, test_id, price, turnaround_time_hours, is_available)
SELECT 
  lp.id as lab_partner_id,
  t.id as test_id,
  CASE 
    WHEN lp.code = 'CITYLAB' THEN 150.00
    WHEN lp.code = 'AD001' THEN 145.00
    WHEN lp.code = 'ML001' THEN 155.00
  END as price,
  24 as turnaround_time_hours,
  true as is_available
FROM lab_partners lp
CROSS JOIN tests t
WHERE lp.code IN ('CITYLAB', 'AD001', 'ML001')
ON CONFLICT (lab_partner_id, test_id) DO UPDATE SET
  price = EXCLUDED.price,
  turnaround_time_hours = EXCLUDED.turnaround_time_hours,
  is_available = EXCLUDED.is_available;

-- 5. Verify Data
SELECT 'Categories' as type, COUNT(*) as count FROM test_categories
UNION ALL
SELECT 'Tests', COUNT(*) FROM tests
UNION ALL
SELECT 'Lab Partners', COUNT(*) FROM lab_partners
UNION ALL
SELECT 'Pricing', COUNT(*) FROM lab_test_pricing;
