# HypeHouse Database Schema

The HypeHouse database is powered by Supabase (PostgreSQL). It uses Row Level Security (RLS) to ensure data privacy and integrity.

## 📊 Tables

### `profiles`
Stores user profile information.
- `id`: UUID (Primary Key, references `auth.users`)
- `role`: `user_role` enum ('student', 'owner')
- `full_name`: Text
- `email`: Text
- `phone`: Text
- `college`: Text
- `business_name`: Text
- `avatar_url`: Text

### `pgs`
Stores property (Paying Guest) listings.
- `id`: UUID (Primary Key)
- `owner_id`: UUID (References `profiles.id`)
- `name`: Text
- `room_type`: `room_type` enum
- `gender`: `gender_type` enum
- `price_per_month`: Integer
- `amenities`: Text Array
- `images`: Text Array
- `verified`: Boolean
- `active`: Boolean

### `bookings`
Tracks property bookings between students and owners.
- `id`: UUID (Primary Key)
- `student_id`: UUID (References `profiles.id`)
- `pg_id`: UUID (References `pgs.id`)
- `status`: `booking_status` enum ('Upcoming', 'Active', 'Past', 'Cancelled')

### `reviews`
Stores student reviews for properties.
- `rating`: Integer (1-5)
- `comment`: Text

## 🛡️ Security (RLS)
- **Students**: Can view all active property listings and their own bookings/saved PGs.
- **Owners**: Can manage (CRUD) their own property listings and view bookings for their properties.
- **Profiles**: Publicly readable (limited info), but only owner can update their own profile.

## 📂 Storage Buckets
- `pg-images`: Public bucket for property photos.
- `avatars`: Public bucket for user profile pictures.

## 🚀 Setup
The full schema, including enums, triggers (for automatic rating calculations), and RLS policies, can be found in `supabase_setup.sql`.
