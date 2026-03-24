-- 1. SETUP & UTILS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'owner');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  role          user_role not null default 'student',
  full_name     text,
  email         text,
  phone         text,
  avatar_url    text,
  college       text, business_name text, push_token text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Ensure columns exist if table was already there
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS college text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role), 
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

create or replace function is_owner() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'owner');
$$ language sql security definer stable;

create or replace function is_student() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'student');
$$ language sql security definer stable;

-- 2. CORE TYPES
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_type') THEN
        CREATE TYPE room_type AS ENUM ('Single', 'Double', 'Triple');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
        CREATE TYPE gender_type AS ENUM ('Boys', 'Girls', 'Co-ed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'availability_status') THEN
        CREATE TYPE availability_status AS ENUM ('Available', 'Limited', 'Full');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'furnishing_type') THEN
        CREATE TYPE furnishing_type AS ENUM ('Fully Furnished', 'Semi Furnished', 'Unfurnished');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS pgs (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid references profiles(id) on delete cascade not null,
  name              text not null, 
  description       text, 
  college_name      text,
  room_type         room_type not null, 
  gender            gender_type not null,
  furnishing        furnishing_type default 'Semi Furnished', 
  address           text not null, 
  city              text not null,
  landmark          text, 
  lat               float, 
  lng               float, 
  distance_from_college float,
  price_per_month   integer not null, 
  security_deposit  integer default 0,
  total_rooms       integer default 1, 
  available_rooms   integer default 1, 
  floor_number      text,
  amenities         text[] default '{}', 
  house_rules       text[] default '{}', 
  images            text[] default '{}',
  availability      availability_status default 'Available', 
  verified          boolean default false, 
  active            boolean default true, 
  is_draft          boolean default false,
  contact_name      text, 
  contact_phone     text, 
  show_phone        boolean default true,
  rating            float default 0, 
  review_count      integer default 0,
  created_at        timestamptz default now(), 
  updated_at        timestamptz default now()
);

-- Ensure columns exist if table was already there (for existing deployments)
ALTER TABLE pgs ADD COLUMN IF NOT EXISTS college_name text;
ALTER TABLE pgs ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE pgs ADD COLUMN IF NOT EXISTS distance_from_college float;
ALTER TABLE pgs ADD COLUMN IF NOT EXISTS active boolean default true;

CREATE TABLE IF NOT EXISTS saved_pgs (
  student_id  uuid REFERENCES profiles(id) ON DELETE CASCADE,
  pg_id       uuid REFERENCES pgs(id) ON DELETE CASCADE,
  saved_at    timestamptz DEFAULT now(),
  PRIMARY KEY (student_id, pg_id)
);

-- 3. BOOKING TYPES
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM ('Upcoming', 'Active', 'Past', 'Cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('Pending', 'Partial', 'Paid');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS bookings (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid references profiles(id) on delete restrict not null,
  pg_id           uuid references pgs(id) on delete restrict not null,
  owner_id        uuid references profiles(id) on delete restrict not null,
  room_number     text, check_in date not null, check_out date not null,
  total_amount    integer not null, paid_amount integer default 0,
  payment_status  payment_status default 'Pending', status booking_status default 'Upcoming',
  created_at      timestamptz default now(), updated_at timestamptz default now()
);

create or replace function set_booking_owner() returns trigger as $$
begin
  select owner_id into new.owner_id from pgs where id = new.pg_id;
  return new;
end;
$$ language plpgsql;
DROP TRIGGER IF EXISTS booking_set_owner ON bookings;
CREATE TRIGGER booking_set_owner BEFORE INSERT ON bookings FOR EACH ROW EXECUTE FUNCTION set_booking_owner();

CREATE TABLE IF NOT EXISTS reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid REFERENCES profiles(id) ON DELETE CASCADE,
  pg_id       uuid REFERENCES pgs(id) ON DELETE CASCADE,
  booking_id  uuid REFERENCES bookings(id) ON DELETE SET NULL,
  rating      integer CHECK (rating BETWEEN 1 AND 5), 
  comment     text,
  created_at  timestamptz DEFAULT now(), 
  UNIQUE (student_id, pg_id)
);

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION update_pg_rating() RETURNS trigger AS $$
DECLARE
    target_pg_id uuid;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_pg_id := OLD.pg_id;
    ELSE
        target_pg_id := NEW.pg_id;
    END IF;

    UPDATE pgs
    SET 
        rating = (SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) FROM reviews WHERE pg_id = target_pg_id),
        review_count = (SELECT COUNT(*) FROM reviews WHERE pg_id = target_pg_id)
    WHERE id = target_pg_id;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_review_change ON reviews;
CREATE TRIGGER on_review_change 
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_pg_rating();

CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type        text NOT NULL, title text NOT NULL, body text NOT NULL,
  data        jsonb DEFAULT '{}', read boolean DEFAULT false, created_at timestamptz DEFAULT now()
);

-- 3. RLS POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON profiles;
CREATE POLICY "Public read" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Own update" ON profiles;
CREATE POLICY "Own update" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE pgs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Student read active" ON pgs;
CREATE POLICY "Student read active" ON pgs FOR SELECT USING (active = true AND is_draft = false);
DROP POLICY IF EXISTS "Owner CRUD own" ON pgs;
CREATE POLICY "Owner CRUD own" ON pgs FOR ALL USING (owner_id = auth.uid());

ALTER TABLE saved_pgs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Own saved" ON saved_pgs;
CREATE POLICY "Own saved" ON saved_pgs FOR ALL USING (auth.uid() = student_id);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Student own" ON bookings;
CREATE POLICY "Student own" ON bookings FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Owner own" ON bookings;
CREATE POLICY "Owner own" ON bookings FOR SELECT USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "Student insert" ON bookings;
CREATE POLICY "Student insert" ON bookings FOR INSERT WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "Owner update" ON bookings;
CREATE POLICY "Owner update" ON bookings FOR UPDATE USING (owner_id = auth.uid());

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read reviews" ON reviews;
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Student insert review" ON reviews;
CREATE POLICY "Student insert review" ON reviews FOR INSERT WITH CHECK (auth.uid() = student_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Own notifs" ON notifications;
CREATE POLICY "Own notifs" ON notifications FOR ALL USING (auth.uid() = user_id);

-- 4. STORAGE
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pg-images', 'pg-images', true), ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Upload pg images" ON storage.objects;
CREATE POLICY "Upload pg images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pg-images' AND is_owner());
DROP POLICY IF EXISTS "Read pg images" ON storage.objects;
CREATE POLICY "Read pg images" ON storage.objects FOR SELECT USING (bucket_id = 'pg-images');
DROP POLICY IF EXISTS "Upload avatars" ON storage.objects;
CREATE POLICY "Upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Read avatars" ON storage.objects;
CREATE POLICY "Read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
