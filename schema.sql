-- PostgreSQL schema for Kabulig Portal's first catalog release.
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Roles are independent permissions; one account may hold roles in every pillar.
CREATE TABLE IF NOT EXISTS pillars (
    id SMALLSERIAL PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL UNIQUE,
    sort_order SMALLINT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS roles (
    id SMALLSERIAL PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '', is_platform_role BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order SMALLINT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS pillar_roles (
    pillar_id SMALLINT NOT NULL REFERENCES pillars(id) ON DELETE CASCADE,
    role_id SMALLINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    approval_required BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (pillar_id, role_id)
);
CREATE TABLE IF NOT EXISTS user_pillar_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pillar_id SMALLINT NOT NULL REFERENCES pillars(id) ON DELETE CASCADE,
    role_id SMALLINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending','active','disabled','suspended')),
    profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, pillar_id, role_id),
    FOREIGN KEY (pillar_id, role_id) REFERENCES pillar_roles(pillar_id, role_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id SMALLINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), assigned_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    PRIMARY KEY (user_id, role_id)
);
CREATE INDEX IF NOT EXISTS user_pillar_roles_status_idx ON user_pillar_roles (status, requested_at);

INSERT INTO pillars (slug,name,sort_order) VALUES
('agri-fishery','Agri-Fishery',1),('tourism','Tourism',2),('education','Education',3)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO roles (code,name,description,is_platform_role,sort_order) VALUES
('consumer_buyer','Consumer / Buyer','Shop for agricultural and fishery products.',FALSE,1),
('farmer_worker','Farmer / Worker','Offer farm skills and apply for agricultural work.',FALSE,2),
('farm_owner','Farm Owner / Employer','Manage farm listings and post work.',FALSE,3),
('tourist','Tourist','Book tourism activities and stays.',FALSE,1),
('tourism_host','Tourism Host','Publish and manage tourism experiences.',FALSE,2),
('learner','Learner','Enroll in courses and track learning.',FALSE,1),
('instructor','Instructor','Publish courses and teach learners.',FALSE,2),
('admin','Administrator','Manage the Kabulig Portal.',TRUE,1),
('support','Support','Assist portal users.',TRUE,2)
ON CONFLICT (code) DO NOTHING;
INSERT INTO pillar_roles (pillar_id,role_id,approval_required)
SELECT p.id,r.id, (r.code IN ('farmer_worker','farm_owner','tourism_host','instructor'))
FROM pillars p JOIN roles r ON r.code IN ('consumer_buyer','farmer_worker','farm_owner','tourist','tourism_host','learner','instructor')
WHERE (p.slug='agri-fishery' AND r.code IN ('consumer_buyer','farmer_worker','farm_owner'))
   OR (p.slug='tourism' AND r.code IN ('tourist','tourism_host'))
   OR (p.slug='education' AND r.code IN ('learner','instructor'))
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS providers (
    id BIGSERIAL PRIMARY KEY,
    owner_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    provider_id BIGINT REFERENCES providers(id) ON DELETE SET NULL,
    provider_name TEXT NOT NULL,
    pillar TEXT NOT NULL CHECK (pillar IN ('Agri-Fishery', 'Tourism', 'Education')),
    item_type TEXT NOT NULL CHECK (item_type IN ('Product', 'Experience', 'Course')),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price_minor INTEGER NOT NULL DEFAULT 0 CHECK (price_minor >= 0),
    price_unit TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    emoji TEXT NOT NULL DEFAULT '✨',
    badge TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS listings_published_pillar_idx ON listings (pillar, featured DESC, created_at DESC) WHERE status = 'published';

CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    customer_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'fulfilled', 'cancelled', 'refunded')),
    currency CHAR(3) NOT NULL DEFAULT 'PHP',
    subtotal_minor INTEGER NOT NULL CHECK (subtotal_minor >= 0),
    fulfillment_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    listing_id TEXT REFERENCES listings(id) ON DELETE SET NULL,
    title_snapshot TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_minor INTEGER NOT NULL CHECK (unit_price_minor >= 0)
);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    customer_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
    requested_for TIMESTAMPTZ NOT NULL,
    guest_count INTEGER NOT NULL CHECK (guest_count > 0),
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'declined', 'cancelled', 'completed')),
    customer_note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS bookings_listing_date_idx ON bookings (listing_id, requested_for);

CREATE TABLE IF NOT EXISTS courses (
    listing_id TEXT PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
    access_days INTEGER CHECK (access_days IS NULL OR access_days > 0),
    published_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS course_lessons (
    id BIGSERIAL PRIMARY KEY,
    course_listing_id TEXT NOT NULL REFERENCES courses(listing_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGSERIAL PRIMARY KEY,
    customer_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_listing_id TEXT NOT NULL REFERENCES courses(listing_id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE (customer_user_id, course_listing_id)
);
CREATE TABLE IF NOT EXISTS lesson_progress (
    enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id BIGINT NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ,
    PRIMARY KEY (enrollment_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    provider_reference TEXT UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    amount_minor INTEGER NOT NULL CHECK (amount_minor >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'PHP',
    provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farms (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS crop_updates (
    id BIGSERIAL PRIMARY KEY,
    farm_id BIGINT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    variety TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'growing',
    growth_stage TEXT NOT NULL DEFAULT '',
    progress_percent SMALLINT NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    estimated_harvest_on DATE,
    public_note TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farm_services (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT REFERENCES providers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    skill_category TEXT NOT NULL,
    rate_minor INTEGER NOT NULL CHECK (rate_minor >= 0),
    rate_unit TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS farmer_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    headline TEXT NOT NULL,
    expertise TEXT[] NOT NULL DEFAULT '{}',
    location TEXT NOT NULL,
    availability TEXT NOT NULL,
    preferred_rate_minor INTEGER CHECK (preferred_rate_minor IS NULL OR preferred_rate_minor >= 0),
    bio TEXT NOT NULL DEFAULT '',
    profile_status TEXT NOT NULL DEFAULT 'visible' CHECK (profile_status IN ('visible', 'hidden')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS farmer_profiles_search_idx ON farmer_profiles USING GIN (expertise);

CREATE TABLE IF NOT EXISTS farm_job_posts (
    id BIGSERIAL PRIMARY KEY,
    posted_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id BIGINT REFERENCES providers(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    skills_needed TEXT[] NOT NULL DEFAULT '{}',
    location TEXT NOT NULL,
    work_date DATE NOT NULL,
    duration TEXT NOT NULL,
    pay_minor INTEGER NOT NULL CHECK (pay_minor > 0),
    pay_unit TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS farm_job_posts_open_location_idx ON farm_job_posts (location, work_date) WHERE status = 'open';

CREATE TABLE IF NOT EXISTS farm_job_applications (
    id BIGSERIAL PRIMARY KEY,
    job_post_id BIGINT NOT NULL REFERENCES farm_job_posts(id) ON DELETE CASCADE,
    applicant_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'accepted', 'declined', 'withdrawn')),
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (job_post_id, applicant_user_id)
);
CREATE TABLE IF NOT EXISTS service_applications (
    id BIGSERIAL PRIMARY KEY,
    worker_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES farm_services(id) ON DELETE CASCADE,
    message TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn')),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (worker_user_id, service_id)
);
CREATE TABLE IF NOT EXISTS farm_service_requests (
    id BIGSERIAL PRIMARY KEY,
    farm_id BIGINT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES farm_services(id) ON DELETE RESTRICT,
    preferred_date DATE NOT NULL,
    worker_count SMALLINT NOT NULL DEFAULT 1 CHECK (worker_count > 0),
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'matched', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS worker_earnings (
    id BIGSERIAL PRIMARY KEY,
    worker_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id BIGINT REFERENCES farm_service_requests(id) ON DELETE RESTRICT,
    job_application_id BIGINT REFERENCES farm_job_applications(id) ON DELETE RESTRICT,
    amount_minor INTEGER NOT NULL CHECK (amount_minor >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    CHECK (request_id IS NOT NULL OR job_application_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS agricultural_land_listings (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT REFERENCES providers(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    listing_kind TEXT NOT NULL CHECK (listing_kind IN ('sale', 'rent', 'farm_visit', 'farm_stay', 'activity')),
    location TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    area_hectares NUMERIC(9,2),
    price_minor BIGINT NOT NULL CHECK (price_minor >= 0),
    price_unit TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS agricultural_land_public_idx ON agricultural_land_listings (listing_kind, location) WHERE status = 'published';

-- Seed a few published records; remove these inserts if you prefer to enter your own catalog.
INSERT INTO providers (name, location) VALUES
('Bukid Lokal Cooperative', 'Cavite'),
('Bayanihan Fishers', 'Batangas'),
('Kabulig Learning Circle', 'Online')
ON CONFLICT DO NOTHING;

INSERT INTO listings (id, provider_name, pillar, item_type, title, description, price_minor, price_unit, location, emoji, badge, status, featured) VALUES
('farm-box', 'Bukid Lokal Cooperative', 'Agri-Fishery', 'Product', 'Seasonal harvest box', 'A colorful bundle of just-picked vegetables from a family farm.', 48000, 'per box', 'Cavite', '🥬', 'Fresh this week', 'published', TRUE),
('seafood-bundle', 'Bayanihan Fishers', 'Agri-Fishery', 'Product', 'Coastal catch bundle', 'A responsibly sourced mix of the day’s local catch, packed for home.', 65000, 'per bundle', 'Batangas', '🐟', 'From local waters', 'published', TRUE),
('farm-visit', 'Bukid Lokal Cooperative', 'Tourism', 'Experience', 'A day on the farm', 'Walk the fields, meet the growers, and share a farm-to-table lunch.', 120000, 'per guest', 'Cavite', '🌱', 'Small group', 'published', TRUE),
('coast-trail', 'Bayanihan Fishers', 'Tourism', 'Experience', 'Coast and community trail', 'Explore a quiet shoreline with a local guide and fisherfolk host.', 95000, 'per guest', 'Batangas', '🌊', 'Local guide', 'published', TRUE),
('grow-food', 'Kabulig Learning Circle', 'Education', 'Course', 'Grow food in small spaces', 'A practical, self-paced introduction to growing herbs and vegetables.', 35000, 'one-time', 'Online', '🪴', 'Self-paced', 'published', TRUE),
('coastal-livelihood', 'Kabulig Learning Circle', 'Education', 'Course', 'Sustainable coastal livelihoods', 'Learn the foundations of responsible fisheries and community enterprise.', 0, 'free', 'Online', '🐚', 'Free course', 'published', TRUE)
ON CONFLICT (id) DO NOTHING;
