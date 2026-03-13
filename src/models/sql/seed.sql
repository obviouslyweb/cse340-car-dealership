-- Database seed file for dealership database

BEGIN;

-- ////////////////////////////////////////
--            DATABASE DROPS
-- ////////////////////////////////////////

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS reseed CASCADE;
DROP TABLE IF EXISTS vehicle_images CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- ////////////////////////////////////////
--        DATABASE TABLE CREATION
-- ////////////////////////////////////////


-- USERS, ROLES, CONTACT FORM
-- These tables will not be reset if reseed is triggered
-- Contact form table
CREATE TABLE IF NOT EXISTS contact_form (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Users table for registration system
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Roles table (RBAC)
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Add role_id column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role_id'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN role_id INTEGER REFERENCES roles(id);
    END IF;
END $$;
-- Seed roles (idempotent - safe to run multiple times)
INSERT INTO roles (id, role_name, role_description) 
VALUES 
    (1, 'user', 'Standard user with basic access'),
    (2, 'employee', 'Employee user with additional control'),
    (3, 'admin', 'Administrator with full system access')
ON CONFLICT (role_name) DO NOTHING;
-- Set the default value of role_id to the 'user' role so new inserts without role_id are handled automatically
DO $$
DECLARE
    user_role_id INTEGER;
BEGIN
    SELECT id INTO user_role_id FROM roles WHERE role_name = 'user';
    IF user_role_id IS NOT NULL THEN
        EXECUTE format(
            'ALTER TABLE users ALTER COLUMN role_id SET DEFAULT %s',
            user_role_id
        );
    END IF;
END $$;
-- Update existing users without a role to default 'user' role
DO $$
DECLARE
    user_role_id INTEGER;
BEGIN
    SELECT id INTO user_role_id FROM roles WHERE role_name = 'user';
    IF user_role_id IS NOT NULL THEN
        UPDATE users 
        SET role_id = user_role_id 
        WHERE role_id IS NULL;
    END IF;
END $$;

-- CATEGORIES, VEHICLES, IMAGES, REVIEWS, SERVICE REQUESTS
-- These tables will be reseeded when triggered
-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    mileage INTEGER,
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Vehicle images table
CREATE TABLE IF NOT EXISTS vehicle_images (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    body TEXT NOT NULL,
    is_visible BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Service requests table
CREATE TABLE IF NOT EXISTS service_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Submitted'
        CHECK (status IN ('Submitted', 'In Progress', 'Completed')),
    employee_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- RESEED (drop to trigger full DB reseed)
CREATE TABLE IF NOT EXISTS reseed (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ////////////////////////////////////////
--            DATABASE INSERTS
-- ////////////////////////////////////////

INSERT INTO reseed DEFAULT VALUES;

INSERT INTO categories (id, name, description) VALUES
    (1, 'Truck', 'Pickup trucks and work vehicles'),
    (2, 'Van', 'Passenger and cargo vans'),
    (3, 'Car', 'Sedans, coupes, and hatchbacks'),
    (4, 'SUV', 'Sport utility vehicles and crossovers'),
    (5, 'Motorcycle', 'A fast two-wheeled bike; separate license required')
ON CONFLICT (name) DO NOTHING;

INSERT INTO vehicles (id, category_id, make, model, year, price, mileage, is_available, is_featured, description) VALUES
    (1, 1, 'Mazda', 'B4000', 1998, 11050.00, 124000, TRUE, TRUE, 'A compact pickup truck featuring a 4.0L V6 engine (160 hp, 225 lb-ft torque). With 5-speed manual or 4-speed automatic transmission and a towing capacity up to 5,640 lbs, this truck will take you where you need to go.'),
    (2, 1, 'Ford', 'F-150', 2015, 24500.00, 87000, TRUE, FALSE, 'A full-size pickup with a 3.5L EcoBoost V6 engine (365 hp). Features a towing capacity of up to 12,200 lbs, integrated trailer brake controller, and a spacious crew cab with modern infotainment.'),
    (3, 2, 'Honda', 'Odyssey', 2017, 19800.00, 63000, TRUE, TRUE, 'A family minivan with a 3.5L V6 engine (280 hp) and 9-speed automatic transmission. Seats up to 8 passengers with available tri-zone climate control, rear entertainment system, and Honda Sensing safety suite.'),
    (4, 2, 'Chrysler', 'Pacifica', 2019, 22400.00, 51000, FALSE, FALSE, 'A versatile minivan offering a 3.6L Pentastar V6 (287 hp) and Stow ''n Go seating that folds flat into the floor. Features Apple CarPlay, Android Auto, and available all-wheel drive.'),
    (5, 3, 'Toyota', 'Camry', 2020, 21900.00, 38000, TRUE, TRUE, 'A mid-size sedan with a 2.5L four-cylinder engine (203 hp) and 8-speed automatic transmission. Includes Toyota Safety Sense 2.0, dual-zone climate control, and a 8-inch touchscreen infotainment system.'),
    (6, 3, 'Honda', 'Civic', 2018, 16500.00, 55000, TRUE, FALSE, 'A compact sedan featuring a 1.5L turbocharged engine (174 hp). Known for its fuel efficiency, responsive handling, and a well-appointed interior with Honda Sensing standard across all trims.'),
    (7, 4, 'Ford', 'Explorer', 2016, 20100.00, 94000, TRUE, FALSE, 'A three-row SUV with a 2.3L EcoBoost four-cylinder engine (280 hp) and available 4WD. Seats up to 7 passengers with a hands-free liftgate, SYNC 3 infotainment, and a towing capacity of up to 5,000 lbs.'),
    (8, 4, 'Jeep', 'Grand Cherokee', 2021, 34900.00, 29000, TRUE, FALSE, 'A premium midsize SUV powered by a 3.6L Pentastar V6 (293 hp). Features Jeep''s Quadra-Trac II 4WD system, Uconnect 5 infotainment, and available Quadra-Lift air suspension for serious off-road capability.'),
    (9, 5, 'Harley-Davidson', 'Iron 883', 2019, 8900.00, 11000, FALSE, FALSE, 'A Sportster-series cruiser motorcycle with an 883cc air-cooled Evolution V-Twin engine. Features a blacked-out minimalist style, drag-style handlebar, and low seat height of 25.7 inches — ideal for new and experienced riders alike.'),
    (10, 5, 'Honda', 'CB500F', 2020, 6200.00, 8400, TRUE, FALSE, 'A lightweight naked bike with a 471cc parallel-twin engine (47 hp). Smooth, approachable power delivery and an upright riding position make this an excellent choice for newer riders or daily commuters.');

INSERT INTO vehicle_images (vehicle_id, image_url, is_primary) VALUES
    -- Mazda B4000
    (1, 'https://cdn-fastly.thetruthaboutcars.com/media/2022/07/20/9499414/mazda-b4000-review.jpg?size=720x845&nocrop=1', TRUE),
    -- Ford F-150
    (2, 'https://images.hgmsites.net/hug/2015-ford-f-150_100486838_h.jpg', TRUE),
    -- Honda Odyssey
    (3, 'https://images.coches.com/_vn_/honda/Odyssey-2017/honda_odyssey-2017_r26.jpg', TRUE),
    -- Chrysler Pacifica
    (4, 'https://images.hgmsites.net/hug/2019-chrysler-pacifica_100656421_h.jpg', TRUE),
    -- Toyota Camry
    (5, 'https://www.conceptcarz.com/images/Toyota/toyota-camry-2020_013.jpg', TRUE),
    -- Honda Civic
    (6, 'https://static0.carbuzzimages.com/wordpress/wp-content/uploads/gallery-images/original/478000/400/478468.jpg', TRUE),
    -- Ford Explorer
    (7, 'https://st.automobilemag.com/uploads/sites/10/2015/09/2016-Ford-Explorer-front-three-quarter-view-2.jpg', TRUE),
    -- Jeep Grand Cherokee
    (8, 'https://motorillustrated.com/wp-content/uploads/2020/10/2021-Jeep-Grand-Cherokee-80th-Anniversary-01.jpg', TRUE),
    -- Harley-Davidson Iron 883
    (9, 'https://psmfirestorm.blob.core.windows.net/crs-images/244128/16573/original.jpg', TRUE),
    -- Honda CB500F
    (10, 'https://www.motofichas.com/images/phocagallery/Honda/cb500f-2022/01-honda-cb500f-2022-estudio-rojo.jpg', TRUE);

COMMIT;