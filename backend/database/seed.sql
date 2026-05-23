-- SlotPay Database Seed Data
-- Sample data for testing and development

-- =====================================================
-- SEED USERS
-- =====================================================

-- Admin user
INSERT INTO users (id, email, name, phone, role, created_at) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@slotpay.co.za', 'Admin User', '0821234567', 'admin', NOW()),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'john.doe@example.com', 'John Doe', '0827654321', 'customer', NOW()),
  ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'jane.smith@example.com', 'Jane Smith', '0823456789', 'customer', NOW()),
  ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'provider@slotpay.co.za', 'Service Provider', '0829876543', 'service_provider', NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED SERVICES
-- =====================================================

INSERT INTO services (id, name, description, price, duration, category, image_url, features, active, created_at) VALUES
  (
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    'Haircut & Styling',
    'Professional haircut and styling service for men and women. Includes consultation, wash, cut, and style.',
    250.00,
    60,
    'Hair & Beauty',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    '["Professional stylist", "Premium products", "Wash included", "Style consultation"]'::jsonb,
    true,
    NOW()
  ),
  (
    'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
    'Manicure & Pedicure',
    'Complete nail care service including manicure and pedicure with gel polish option.',
    350.00,
    90,
    'Hair & Beauty',
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800',
    '["Nail shaping", "Cuticle care", "Polish application", "Hand & foot massage"]'::jsonb,
    true,
    NOW()
  ),
  (
    'g6eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
    'Deep Tissue Massage',
    'Therapeutic deep tissue massage to relieve muscle tension and stress. 60-minute session.',
    450.00,
    60,
    'Wellness',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
    '["Licensed therapist", "Aromatherapy oils", "Relaxing environment", "Stress relief"]'::jsonb,
    true,
    NOW()
  ),
  (
    'h7eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
    'Personal Training Session',
    'One-on-one personal training session with certified fitness trainer. Customized workout plan.',
    300.00,
    60,
    'Fitness',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    '["Certified trainer", "Custom workout plan", "Nutrition advice", "Progress tracking"]'::jsonb,
    true,
    NOW()
  ),
  (
    'i8eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
    'Facial Treatment',
    'Rejuvenating facial treatment with deep cleansing, exfoliation, and moisturizing.',
    400.00,
    75,
    'Hair & Beauty',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
    '["Deep cleansing", "Exfoliation", "Face mask", "Moisturizing", "Relaxing"]'::jsonb,
    true,
    NOW()
  ),
  (
    'j9eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
    'Car Wash & Detailing',
    'Complete car wash and interior detailing service. Exterior wash, wax, and interior vacuum.',
    500.00,
    120,
    'Automotive',
    'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800',
    '["Exterior wash", "Wax & polish", "Interior vacuum", "Window cleaning", "Tire shine"]'::jsonb,
    true,
    NOW()
  ),
  (
    'k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
    'Yoga Class',
    'Group yoga class suitable for all levels. Includes mat and props.',
    150.00,
    60,
    'Fitness',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    '["All levels welcome", "Mat provided", "Experienced instructor", "Small groups"]'::jsonb,
    true,
    NOW()
  ),
  (
    'l1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Photography Session',
    'Professional photography session for portraits, events, or products. 2-hour session.',
    800.00,
    120,
    'Professional Services',
    'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800',
    '["Professional photographer", "Edited photos", "Multiple locations", "Digital delivery"]'::jsonb,
    true,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED BOOKINGS
-- =====================================================

-- Sample bookings with different statuses
INSERT INTO bookings (id, user_id, service_id, booking_date, booking_time, status, payment_status, amount, transaction_id, notes, created_at) VALUES
  (
    'm2eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    CURRENT_DATE + INTERVAL '3 days',
    '10:00:00',
    'confirmed',
    'paid',
    250.00,
    'PF_TEST_12345',
    'Please use organic products',
    NOW() - INTERVAL '2 days'
  ),
  (
    'n3eebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
    CURRENT_DATE + INTERVAL '5 days',
    '14:00:00',
    'pending',
    'pending',
    350.00,
    NULL,
    'First time customer',
    NOW() - INTERVAL '1 day'
  ),
  (
    'o4eebc99-9c0b-4ef8-bb6d-6bb9bd380a25',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'g6eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
    CURRENT_DATE + INTERVAL '7 days',
    '16:00:00',
    'confirmed',
    'paid',
    450.00,
    'PF_TEST_12346',
    'Focus on lower back',
    NOW() - INTERVAL '3 days'
  ),
  (
    'p5eebc99-9c0b-4ef8-bb6d-6bb9bd380a26',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'h7eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
    CURRENT_DATE - INTERVAL '2 days',
    '08:00:00',
    'completed',
    'paid',
    300.00,
    'PF_TEST_12347',
    'Great session!',
    NOW() - INTERVAL '5 days'
  ),
  (
    'q6eebc99-9c0b-4ef8-bb6d-6bb9bd380a27',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'i8eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
    CURRENT_DATE + INTERVAL '1 day',
    '11:00:00',
    'cancelled',
    'refunded',
    400.00,
    'PF_TEST_12348',
    'Customer requested cancellation',
    NOW() - INTERVAL '4 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED NOTIFICATIONS
-- =====================================================

INSERT INTO notifications (id, booking_id, user_id, type, channel, status, message_id, sent_at, created_at) VALUES
  (
    'r7eebc99-9c0b-4ef8-bb6d-6bb9bd380a28',
    'm2eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'booking_confirmation',
    'whatsapp',
    'delivered',
    'wamid.HBgNMjc4MjEyMzQ1NjcVAgARGBI5QTJCM0Q0RTVGNkc3SDhJOQA=',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    's8eebc99-9c0b-4ef8-bb6d-6bb9bd380a29',
    'm2eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'payment_confirmation',
    'whatsapp',
    'delivered',
    'wamid.HBgNMjc4MjEyMzQ1NjcVAgARGBI5QTJCM0Q0RTVGNkc3SDhJOQA=',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    't9eebc99-9c0b-4ef8-bb6d-6bb9bd380a30',
    'n3eebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'payment_link',
    'whatsapp',
    'sent',
    'wamid.HBgNMjc4MjM0NTY3ODlVAgARGBI5QTJCM0Q0RTVGNkc3SDhJOQA=',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify data was inserted
DO $$
BEGIN
  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM users);
  RAISE NOTICE 'Services: %', (SELECT COUNT(*) FROM services);
  RAISE NOTICE 'Bookings: %', (SELECT COUNT(*) FROM bookings);
  RAISE NOTICE 'Notifications: %', (SELECT COUNT(*) FROM notifications);
END $$;

-- Made with Bob