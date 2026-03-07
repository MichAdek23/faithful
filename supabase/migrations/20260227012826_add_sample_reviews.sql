/*
  # Add Sample Reviews

  1. Changes
    - Insert sample approved reviews to populate the reviews section on the home page
    - Reviews include various service types, ratings, and customer testimonials
  
  2. Notes
    - These are sample reviews with realistic content
    - All reviews are set to 'approved' status to appear on the public-facing site
*/

-- Insert sample reviews (only if none exist)
INSERT INTO reviews (customer_name, service_type, rating, comment, status, created_at)
SELECT * FROM (VALUES
  ('Sarah Johnson', 'Premium Wash', 5, 'Absolutely fantastic service! My car has never looked better. The team was professional, friendly, and the attention to detail was impressive. Highly recommend!', 'approved', now() - interval '2 weeks'),
  ('Michael Chen', 'Standard Wash', 5, 'Best car wash in town! They went above and beyond with my detailing service. The interior looks brand new and the exterior has an amazing shine. Worth every penny.', 'approved', now() - interval '1 month'),
  ('Emma Thompson', 'Basic Wash', 5, 'I have been coming here for over a year and they never disappoint. Consistent quality, reasonable prices, and eco-friendly products. This is my go-to place for car care.', 'approved', now() - interval '3 weeks'),
  ('David Martinez', 'Premium Wash', 5, 'Exceptional service from start to finish. They really care about their work and it shows. My car looks showroom ready!', 'approved', now() - interval '5 days'),
  ('Lisa Anderson', 'Standard Wash', 4, 'Great attention to detail and friendly staff. My car looks amazing and the service was quick. Will definitely return!', 'approved', now() - interval '10 days'),
  ('James Wilson', 'Premium Wash', 5, 'Outstanding job! They treated my car like it was their own. The interior detailing is top-notch. Highly satisfied customer here.', 'approved', now() - interval '1 week')
) AS new_reviews(customer_name, service_type, rating, comment, status, created_at)
WHERE NOT EXISTS (
  SELECT 1 FROM reviews WHERE customer_name = 'Sarah Johnson' AND service_type = 'Premium Wash'
);
