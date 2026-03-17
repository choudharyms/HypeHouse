You are a senior backend engineer. Build a complete Supabase backend 
that powers two clients simultaneously:

  CLIENT 1: HypeHouse — React Native Expo student app
  CLIENT 2: HypeHouse Admin — React + Vite owner dashboard

Both clients use the SAME Supabase project.
Same database. Same auth. Different roles. Different access.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✗ NEVER expose service_role key to any client
✗ NEVER skip Row Level Security on any table
✗ NEVER allow a student to write to pgs table
✗ NEVER allow an owner to read another owner's data
✗ NEVER allow a student to see other students' bookings
✗ NEVER leave a table without RLS policies
✗ DO NOT use external backend server — Supabase only
✗ DO NOT hardcode user IDs anywhere
✗ Verify every policy works before moving on

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — SUPABASE PROJECT SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to supabase.com → New Project
   Name: hypehouse
   Region: South Asia (ap-south-1) — closest to India
   Password: generate strong one, save it

2. After project loads go to:
   Settings → API → copy these two values:
   - Project URL  (SUPABASE_URL)
   - anon public  (SUPABASE_ANON_KEY)
   
   Save as environment variables in BOTH clients:
   
   Student app (.env):
     EXPO_PUBLIC_SUPABASE_URL=your_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   
   Admin dashboard (.env):
     VITE_SUPABASE_URL=your_url
     VITE_SUPABASE_ANON_KEY=your_anon_key

3. Never use service_role key in any client app.
   service_role is ONLY for server-side scripts if ever needed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — USER ROLES SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HypeHouse has two user types:
  STUDENT  → uses the mobile app (read PGs, book, save)
  OWNER    → uses the dashboard (manage PGs, see bookings)

Implement roles using Supabase custom claims + profiles table.

Run in SQL Editor:

-- Role enum
create type user_role as enum ('student', 'owner');

-- Profiles table (extends auth.users)
create table profiles (
  id            uuid references auth.users(id) 
                on delete cascade primary key,
  role          user_role not null default 'student',
  full_name     text,
  email         text,
  phone         text,
  avatar_url    text,
  college       text,           -- students only
  business_name text,           -- owners only
  push_token    text,           -- expo push token
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      (new.raw_user_meta_data->>'role')::user_role, 
      'student'
    ),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helper function: get current user role
create or replace function get_my_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer stable;

-- Helper function: check if current user is owner
create or replace function is_owner()
returns boolean as $$
  select exists (
    select 1 from profiles 
    where id = auth.uid() and role = 'owner'
  );
$$ language sql security definer stable;

-- Helper function: check if current user is student
create or replace function is_student()
returns boolean as $$
  select exists (
    select 1 from profiles 
    where id = auth.uid() and role = 'student'
  );
$$ language sql security definer stable;

-- Auto update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — COMPLETE DATABASE SCHEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run this entire block in SQL Editor:

-- ─── ROOMS / PG LISTINGS ─────────────────────────────

create type room_type as enum ('Single', 'Double', 'Triple');
create type gender_type as enum ('Boys', 'Girls', 'Co-ed');
create type availability_status as enum (
  'Available', 'Limited', 'Full'
);
create type furnishing_type as enum (
  'Fully Furnished', 'Semi Furnished', 'Unfurnished'
);

create table pgs (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid references profiles(id) 
                    on delete cascade not null,
  
  -- Basic Info
  name              text not null,
  description       text,
  room_type         room_type not null,
  gender            gender_type not null,
  furnishing        furnishing_type default 'Semi Furnished',
  
  -- Location
  address           text not null,
  city              text not null,
  landmark          text,
  lat               float,
  lng               float,
  distance_from_college float, -- in km
  
  -- Pricing
  price_per_month   integer not null,
  security_deposit  integer default 0,
  advance_payment   integer default 0,
  
  -- Room Details
  total_rooms       integer default 1,
  available_rooms   integer default 1,
  floor_number      text,
  
  -- Features
  amenities         text[] default '{}',
  house_rules       text[] default '{}',
  images            text[] default '{}',
  
  -- Status
  availability      availability_status default 'Available',
  verified          boolean default false,
  active            boolean default true,
  is_draft          boolean default false,
  
  -- Contact
  contact_name      text,
  contact_phone     text,
  alt_phone         text,
  show_phone        boolean default true,
  
  -- Stats (denormalized for performance)
  rating            float default 0,
  review_count      integer default 0,
  total_bookings    integer default 0,
  
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create trigger pgs_updated_at before update on pgs
  for each row execute function update_updated_at();

-- ─── SAVED PGS ───────────────────────────────────────

create table saved_pgs (
  student_id  uuid references profiles(id) on delete cascade,
  pg_id       uuid references pgs(id) on delete cascade,
  saved_at    timestamptz default now(),
  primary key (student_id, pg_id)
);

-- ─── BOOKINGS ────────────────────────────────────────

create type booking_status as enum (
  'Upcoming', 'Active', 'Past', 'Cancelled'
);
create type payment_status as enum (
  'Pending', 'Partial', 'Paid'
);

create table bookings (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid references profiles(id) 
                  on delete restrict not null,
  pg_id           uuid references pgs(id) 
                  on delete restrict not null,
  owner_id        uuid references profiles(id) 
                  on delete restrict not null,
  
  -- Stay Details
  room_number     text,
  check_in        date not null,
  check_out       date not null,
  duration_days   integer generated always as 
                  (check_out - check_in) stored,
  
  -- Payment
  total_amount    integer not null,
  paid_amount     integer default 0,
  payment_status  payment_status default 'Pending',
  
  -- Status
  status          booking_status default 'Upcoming',
  
  -- Meta
  notes           text,
  cancelled_at    timestamptz,
  cancelled_by    uuid references profiles(id),
  cancel_reason   text,
  
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create trigger bookings_updated_at before update on bookings
  for each row execute function update_updated_at();

-- Auto set owner_id from pg
create or replace function set_booking_owner()
returns trigger as $$
begin
  select owner_id into new.owner_id
  from pgs where id = new.pg_id;
  return new;
end;
$$ language plpgsql;

create trigger booking_set_owner
  before insert on bookings
  for each row execute function set_booking_owner();

-- ─── REVIEWS ─────────────────────────────────────────

create table reviews (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid references profiles(id) on delete cascade,
  pg_id       uuid references pgs(id) on delete cascade,
  booking_id  uuid references bookings(id) on delete cascade,
  rating      integer check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now(),
  unique (student_id, pg_id) -- one review per student per PG
);

-- Auto update PG rating when review added/updated/deleted
create or replace function update_pg_rating()
returns trigger as $$
begin
  update pgs set
    rating = (
      select round(avg(rating)::numeric, 1)
      from reviews where pg_id = coalesce(new.pg_id, old.pg_id)
    ),
    review_count = (
      select count(*) 
      from reviews where pg_id = coalesce(new.pg_id, old.pg_id)
    )
  where id = coalesce(new.pg_id, old.pg_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger reviews_update_rating
  after insert or update or delete on reviews
  for each row execute function update_pg_rating();

-- ─── NOTIFICATIONS ───────────────────────────────────

create type notif_type as enum (
  'booking_confirmed', 'booking_cancelled', 
  'payment_received', 'new_booking_request',
  'vacancy_update', 'review_received'
);

create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  type        notif_type not null,
  title       text not null,
  body        text not null,
  data        jsonb default '{}',
  read        boolean default false,
  created_at  timestamptz default now()
);

-- ─── INDEXES FOR PERFORMANCE ─────────────────────────

create index pgs_owner_id_idx on pgs(owner_id);
create index pgs_city_idx on pgs(city);
create index pgs_availability_idx on pgs(availability);
create index pgs_active_idx on pgs(active);
create index pgs_price_idx on pgs(price_per_month);
create index bookings_student_id_idx on bookings(student_id);
create index bookings_owner_id_idx on bookings(owner_id);
create index bookings_pg_id_idx on bookings(pg_id);
create index bookings_status_idx on bookings(status);
create index saved_pgs_student_idx on saved_pgs(student_id);
create index notifications_user_idx on notifications(user_id);
create index notifications_read_idx on notifications(read);

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — ROW LEVEL SECURITY POLICIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Enable RLS and write policies for every table.
Run this entire block:

-- ─── PROFILES ────────────────────────────────────────

alter table profiles enable row level security;

-- Anyone can read public profile info
create policy "profiles_public_read"
  on profiles for select
  using (true);

-- Users can only update their own profile
create policy "profiles_own_update"
  on profiles for update
  using (auth.uid() = id);

-- ─── PGS ─────────────────────────────────────────────

alter table pgs enable row level security;

-- Students: can read all active, non-draft PGs
create policy "pgs_student_read"
  on pgs for select
  using (
    active = true 
    and is_draft = false
    and (
      -- students see all published PGs
      is_student()
      or
      -- owners see only their own PGs (including drafts)
      (is_owner() and owner_id = auth.uid())
      or
      -- unauthenticated: see published only
      auth.uid() is null
    )
  );

-- Owners: can insert PGs (only for themselves)
create policy "pgs_owner_insert"
  on pgs for insert
  with check (
    is_owner() 
    and owner_id = auth.uid()
  );

-- Owners: can update only their own PGs
create policy "pgs_owner_update"
  on pgs for update
  using (
    is_owner() 
    and owner_id = auth.uid()
  );

-- Owners: can soft delete their own PGs
create policy "pgs_owner_delete"
  on pgs for delete
  using (
    is_owner() 
    and owner_id = auth.uid()
  );

-- ─── SAVED PGS ───────────────────────────────────────

alter table saved_pgs enable row level security;

-- Students see only their own saved PGs
create policy "saved_own_read"
  on saved_pgs for select
  using (auth.uid() = student_id);

-- Students can save PGs
create policy "saved_insert"
  on saved_pgs for insert
  with check (
    auth.uid() = student_id
    and is_student()
  );

-- Students can unsave their own PGs
create policy "saved_delete"
  on saved_pgs for delete
  using (auth.uid() = student_id);

-- ─── BOOKINGS ────────────────────────────────────────

alter table bookings enable row level security;

-- Students see their own bookings
create policy "bookings_student_read"
  on bookings for select
  using (auth.uid() = student_id);

-- Owners see bookings for their PGs
create policy "bookings_owner_read"
  on bookings for select
  using (
    is_owner() 
    and owner_id = auth.uid()
  );

-- Students can create bookings
create policy "bookings_student_insert"
  on bookings for insert
  with check (
    auth.uid() = student_id
    and is_student()
  );

-- Students can cancel their own upcoming bookings
create policy "bookings_student_cancel"
  on bookings for update
  using (
    auth.uid() = student_id
    and status = 'Upcoming'
  )
  with check (
    status = 'Cancelled'
  );

-- Owners can update booking status and payment
create policy "bookings_owner_update"
  on bookings for update
  using (
    is_owner() 
    and owner_id = auth.uid()
  );

-- ─── REVIEWS ─────────────────────────────────────────

alter table reviews enable row level security;

-- Anyone can read reviews
create policy "reviews_public_read"
  on reviews for select
  using (true);

-- Students can write reviews (only after booking)
create policy "reviews_student_insert"
  on reviews for insert
  with check (
    auth.uid() = student_id
    and is_student()
    and exists (
      select 1 from bookings
      where student_id = auth.uid()
      and pg_id = reviews.pg_id
      and status = 'Past'
    )
  );

-- Students can update their own reviews
create policy "reviews_student_update"
  on reviews for update
  using (auth.uid() = student_id);

-- Students can delete their own reviews
create policy "reviews_student_delete"
  on reviews for delete
  using (auth.uid() = student_id);

-- ─── NOTIFICATIONS ───────────────────────────────────

alter table notifications enable row level security;

-- Users see only their own notifications
create policy "notifs_own_read"
  on notifications for select
  using (auth.uid() = user_id);

-- Users can mark their own as read
create policy "notifs_own_update"
  on notifications for update
  using (auth.uid() = user_id);

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — STORAGE SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run in SQL Editor:

-- Create storage buckets
insert into storage.buckets (id, name, public, 
  file_size_limit, allowed_mime_types)
values 
  ('pg-images', 'pg-images', true, 
   5242880,  -- 5MB limit
   array['image/jpeg','image/png','image/webp']),
  
  ('avatars', 'avatars', true,
   2097152,  -- 2MB limit
   array['image/jpeg','image/png','image/webp']);

-- PG Images: owners upload to their own folder
create policy "pg_images_owner_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'pg-images'
    and auth.uid()::text = (storage.foldername(name))[1]
    and is_owner()
  );

-- PG Images: public read
create policy "pg_images_public_read"
  on storage.objects for select
  using (bucket_id = 'pg-images');

-- PG Images: owners delete their own
create policy "pg_images_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'pg-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars: users upload their own
create policy "avatars_own_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars: public read
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Avatars: users update their own
create policy "avatars_own_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

File path conventions:
  PG images:  pg-images/{owner_id}/{pg_id}/{filename}
  Avatars:    avatars/{user_id}/avatar.jpg

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — SUPABASE CLIENT FILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create these files in both projects:

── STUDENT APP: src/lib/supabase.js ─────────────────

import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,        // persist session on device
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,    // required for React Native
  },
})

── ADMIN DASHBOARD: src/lib/supabase.js ─────────────

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 7 — AUTH FUNCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create src/lib/auth.js in BOTH clients:

── STUDENT APP auth.js ──────────────────────────────

import { supabase } from './supabase'

// Sign up student
export async function signUpStudent({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        full_name: name,
        role: 'student'       // sets role in profiles trigger
      }
    }
  })
  if (error) throw error
  return data
}

// Login (student)
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email, password
  })
  if (error) throw error
  
  // Verify this user is a student
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .single()
  
  if (profile?.role !== 'student') {
    await supabase.auth.signOut()
    throw new Error('Please use the owner dashboard to login.')
  }
  
  return data
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Get current session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Get current user profile
export async function getMyProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .single()
  if (error) throw error
  return data
}

// Update profile
export async function updateProfile(updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', (await supabase.auth.getUser()).data.user.id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Save push token
export async function savePushToken(token) {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase
    .from('profiles')
    .update({ push_token: token })
    .eq('id', user.id)
}

── ADMIN DASHBOARD auth.js ──────────────────────────

import { supabase } from './supabase'

// Sign up owner
export async function signUpOwner({ name, email, password, businessName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: 'owner'
      }
    }
  })
  if (error) throw error
  
  // Update business name
  if (data.user) {
    await supabase
      .from('profiles')
      .update({ business_name: businessName })
      .eq('id', data.user.id)
  }
  return data
}

// Login (owner only)
export async function signInOwner({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email, password
  })
  if (error) throw error
  
  // Verify this user is an owner
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()
  
  if (profile?.role !== 'owner') {
    await supabase.auth.signOut()
    throw new Error('This account is not an owner account.')
  }
  
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getMyProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .single()
  if (error) throw error
  return data
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 8 — DATABASE QUERY FUNCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── STUDENT APP: src/lib/api.js ──────────────────────

import { supabase } from './supabase'

// ── PGS ─────────────────────────────────────────────

// Fetch all published PGs (with filters)
export async function fetchPGs({ 
  search = '', 
  type = null, 
  gender = null,
  maxPrice = null,
  city = null,
  availability = null,
  limit = 20,
  offset = 0
} = {}) {
  let query = supabase
    .from('pgs')
    .select(`
      id, name, description, room_type, gender,
      address, city, lat, lng, distance_from_college,
      price_per_month, security_deposit,
      total_rooms, available_rooms,
      amenities, images, availability,
      rating, review_count,
      contact_name, contact_phone, show_phone,
      owner_id,
      profiles!owner_id (full_name, avatar_url)
    `)
    .eq('active', true)
    .eq('is_draft', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,city.ilike.%${search}%,address.ilike.%${search}%`
    )
  }
  if (type) query = query.eq('room_type', type)
  if (gender) query = query.eq('gender', gender)
  if (maxPrice) query = query.lte('price_per_month', maxPrice)
  if (city) query = query.eq('city', city)
  if (availability) query = query.eq('availability', availability)

  const { data, error } = await query
  if (error) throw error
  return data
}

// Fetch single PG with full details
export async function fetchPGById(pgId) {
  const { data, error } = await supabase
    .from('pgs')
    .select(`
      *,
      profiles!owner_id (full_name, avatar_url, phone),
      reviews (
        id, rating, comment, created_at,
        profiles!student_id (full_name, avatar_url)
      )
    `)
    .eq('id', pgId)
    .eq('active', true)
    .single()
  if (error) throw error
  return data
}

// ── SAVED PGS ────────────────────────────────────────

export async function fetchSavedPGs() {
  const { data, error } = await supabase
    .from('saved_pgs')
    .select(`
      saved_at,
      pgs (
        id, name, city, address, price_per_month,
        images, rating, review_count, availability,
        room_type, gender, distance_from_college
      )
    `)
    .order('saved_at', { ascending: false })
  if (error) throw error
  return data.map(s => ({ ...s.pgs, saved_at: s.saved_at }))
}

export async function savePG(pgId) {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('saved_pgs')
    .insert({ student_id: user.id, pg_id: pgId })
  if (error) throw error
}

export async function unsavePG(pgId) {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('saved_pgs')
    .delete()
    .match({ student_id: user.id, pg_id: pgId })
  if (error) throw error
}

export async function fetchSavedPGIds() {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('saved_pgs')
    .select('pg_id')
    .eq('student_id', user.id)
  if (error) throw error
  return data.map(s => s.pg_id)
}

// ── BOOKINGS ─────────────────────────────────────────

export async function fetchMyBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      pgs (
        id, name, address, city, images,
        contact_name, contact_phone
      )
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createBooking({
  pgId, checkIn, checkOut, totalAmount, roomNumber, notes
}) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      student_id: user.id,
      pg_id: pgId,
      check_in: checkIn,
      check_out: checkOut,
      total_amount: totalAmount,
      room_number: roomNumber,
      notes,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function cancelBooking(bookingId) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('bookings')
    .update({ 
      status: 'Cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: user.id,
    })
    .eq('id', bookingId)
    .eq('student_id', user.id)
    .eq('status', 'Upcoming')
    .select()
    .single()
  if (error) throw error
  return data
}

// ── REVIEWS ──────────────────────────────────────────

export async function addReview({ pgId, bookingId, rating, comment }) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      student_id: user.id,
      pg_id: pgId,
      booking_id: bookingId,
      rating,
      comment,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── NOTIFICATIONS ─────────────────────────────────────

export async function fetchNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export async function markNotificationRead(notifId) {
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notifId)
}

export async function markAllNotificationsRead() {
  const { data: { user } } = await supabase.auth.getUser()
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false)
}

── ADMIN DASHBOARD: src/lib/api.js ──────────────────

import { supabase } from './supabase'

// ── PGS ─────────────────────────────────────────────

export async function fetchMyPGs() {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('pgs')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createPG(pgData) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('pgs')
    .insert({ ...pgData, owner_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePG(pgId, updates) {
  const { data, error } = await supabase
    .from('pgs')
    .update(updates)
    .eq('id', pgId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleVacancy(pgId, isAvailable) {
  const { data, error } = await supabase
    .from('pgs')
    .update({ 
      availability: isAvailable ? 'Available' : 'Full',
      available_rooms: isAvailable ? 1 : 0
    })
    .eq('id', pgId)
    .select('id, availability')
    .single()
  if (error) throw error
  return data
}

export async function deletePG(pgId) {
  // Soft delete
  const { error } = await supabase
    .from('pgs')
    .update({ active: false })
    .eq('id', pgId)
  if (error) throw error
}

// ── IMAGE UPLOAD ──────────────────────────────────────

export async function uploadPGImage(pgId, file) {
  const { data: { user } } = await supabase.auth.getUser()
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}.${ext}`
  const path = `${user.id}/${pgId}/${filename}`

  const { error: uploadError } = await supabase.storage
    .from('pg-images')
    .upload(path, file, { upsert: false })
  
  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('pg-images')
    .getPublicUrl(path)

  return publicUrl
}

export async function deletePGImage(pgId, imageUrl) {
  // Extract path from URL
  const path = imageUrl.split('/pg-images/')[1]
  const { error } = await supabase.storage
    .from('pg-images')
    .remove([path])
  if (error) throw error
}

// ── BOOKINGS ─────────────────────────────────────────

export async function fetchMyBookings({ 
  status = null,
  pgId = null,
  from = null,
  to = null 
} = {}) {
  let query = supabase
    .from('bookings')
    .select(`
      *,
      profiles!student_id (
        full_name, email, phone, avatar_url
      ),
      pgs (name, images, address)
    `)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (pgId) query = query.eq('pg_id', pgId)
  if (from) query = query.gte('check_in', from)
  if (to) query = query.lte('check_out', to)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function updateBookingStatus(bookingId, status) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function markBookingPaid(bookingId, paidAmount) {
  const { data: booking } = await supabase
    .from('bookings')
    .select('total_amount')
    .eq('id', bookingId)
    .single()

  const paymentStatus = paidAmount >= booking.total_amount 
    ? 'Paid' : 'Partial'

  const { data, error } = await supabase
    .from('bookings')
    .update({ paid_amount: paidAmount, payment_status: paymentStatus })
    .eq('id', bookingId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── DASHBOARD STATS ───────────────────────────────────

export async function fetchDashboardStats() {
  const { data: { user } } = await supabase.auth.getUser()
  
  const [pgsResult, bookingsResult, revenueResult] = await Promise.all([
    // Total and vacant PGs
    supabase
      .from('pgs')
      .select('id, availability')
      .eq('owner_id', user.id)
      .eq('active', true),
    
    // Active bookings
    supabase
      .from('bookings')
      .select('id, status')
      .eq('owner_id', user.id)
      .eq('status', 'Active'),
    
    // This month revenue
    supabase
      .from('bookings')
      .select('paid_amount')
      .eq('owner_id', user.id)
      .gte('created_at', new Date(
        new Date().getFullYear(), 
        new Date().getMonth(), 1
      ).toISOString())
  ])

  const pgs = pgsResult.data || []
  const activeBookings = bookingsResult.data || []
  const revenue = revenueResult.data || []

  return {
    totalProperties: pgs.length,
    vacantRooms: pgs.filter(p => p.availability !== 'Full').length,
    activeBookings: activeBookings.length,
    monthlyRevenue: revenue.reduce((sum, b) => sum + (b.paid_amount || 0), 0)
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 9 — REAL-TIME SUBSCRIPTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add real-time updates so both apps react instantly:

── STUDENT APP: listen for booking status changes ───

export function subscribeToMyBookings(userId, onUpdate) {
  return supabase
    .channel('student-bookings')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'bookings',
      filter: `student_id=eq.${userId}`
    }, onUpdate)
    .subscribe()
}

// Cleanup: channel.unsubscribe() on component unmount

── ADMIN DASHBOARD: listen for new bookings ─────────

export function subscribeToNewBookings(ownerId, onNew) {
  return supabase
    .channel('owner-bookings')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'bookings',
      filter: `owner_id=eq.${ownerId}`
    }, onNew)
    .subscribe()
}

// In dashboard: show toast when new booking arrives
subscribeToNewBookings(user.id, (payload) => {
  toast.success(`New booking received for ${payload.new.pg_id}!`)
  refetchBookings()
})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 10 — PUSH NOTIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use Supabase Edge Functions to send Expo push 
notifications when events happen.

Go to: Supabase Dashboard → Edge Functions → New Function
Name: send-push-notification

-- Edge Function code (Deno):

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { user_id, title, body, data } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Get user's push token
  const { data: profile } = await supabase
    .from('profiles')
    .select('push_token')
    .eq('id', user_id)
    .single()

  if (!profile?.push_token) {
    return new Response('No push token', { status: 200 })
  }

  // Save notification to DB
  await supabase.from('notifications').insert({
    user_id, title, body, data
  })

  // Send via Expo
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: profile.push_token,
      title,
      body,
      data,
      sound: 'default',
    })
  })

  return new Response('OK', { status: 200 })
})

-- Trigger this function from database via trigger:

-- When a booking is created, notify the owner
create or replace function notify_owner_new_booking()
returns trigger as $$
begin
  perform net.http_post(
    url := current_setting('app.supabase_url') 
           || '/functions/v1/send-push-notification',
    body := json_build_object(
      'user_id', new.owner_id,
      'title', 'New Booking! 🎉',
      'body', 'You have a new booking request.',
      'data', json_build_object('booking_id', new.id)
    )::text,
    headers := json_build_object(
      'Authorization', 'Bearer ' || 
        current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    )
  );
  return new;
end;
$$ language plpgsql;

create trigger on_new_booking_notify_owner
  after insert on bookings
  for each row execute function notify_owner_new_booking();

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 11 — VERIFICATION CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test every scenario before declaring done.
Use Supabase Table Editor + Auth to create test users.

Create test accounts:
  student@test.com  / password123  (role: student)
  owner@test.com    / password123  (role: owner)

Test as STUDENT:
  ✓ Can sign up with role = student
  ✓ Can log in to mobile app
  ✓ Can fetch and see all published PGs
  ✓ Can save and unsave a PG
  ✓ Can create a booking
  ✓ Can cancel an upcoming booking
  ✓ CANNOT create or edit a PG (should get RLS error)
  ✓ CANNOT see another student's bookings
  ✓ Can add a review only after a Past booking
  ✓ Can update own profile

Test as OWNER:
  ✓ Can sign up with role = owner
  ✓ Can log in to admin dashboard
  ✓ Can create a PG listing
  ✓ Can upload images to storage
  ✓ Can toggle vacancy on/off
  ✓ Can see bookings for their own PGs only
  ✓ Can update booking payment status
  ✓ CANNOT see another owner's PGs or bookings
  ✓ CANNOT access student bookings not on their PG
  ✓ Can soft delete their PG

Test real-time:
  ✓ Student creates booking → 
    owner dashboard updates without refresh
  ✓ Owner toggles vacancy → 
    student app reflects change on next fetch

Test storage:
  ✓ Owner can upload PG image
  ✓ Image URL is publicly accessible
  ✓ Owner cannot upload to another owner's folder

DO NOT declare done until every single 
check above passes with zero errors.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━