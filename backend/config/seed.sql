-- SEED SCRIPT FOR SKILLS MASTER TABLE
INSERT INTO skills (name) VALUES 
('Masonry & Concrete'),
('Electrical Wiring'),
('Plumbing & Pipefitting'),
('HVAC Installation'),
('Structural Steelwork'),
('Roofing & Waterproofing'),
('Carpentry & Framing'),
('Flooring & Tiling'),
('Painting & Wall Finish'),
('Demolition & Excavation')
ON CONFLICT (name) DO NOTHING;

-- SEED SCRIPT FOR CATEGORIES MASTER TABLE
INSERT INTO categories (name) VALUES 
('Residential Construction'),
('Commercial Infrastructure'),
('Industrial Fitouts'),
('Renovation & Restoration'),
('Civil Work'),
('Landscaping & Exterior')
ON CONFLICT (name) DO NOTHING;

-- SEED SCRIPT FOR ADMINISTRATOR USER
INSERT INTO users (email, password_hash, role, is_email_verified) VALUES 
('admin@buildconnect.com', '$2b$10$5pSgR7r8/bUvG59P7f.U9exQ4nC1r.z3gS3o5m8tJ8G8V8R8U8W1O', 'admin', true)
ON CONFLICT (email) DO NOTHING;
