# HypeHouse

HypeHouse is a modern property management platform designed to connect students with PG (Paying Guest) accommodations. It consists of a React Native mobile application for students and a web-based admin dashboard for property owners.

## 🚀 Features

- **For Students (Mobile App)**:
  - Browse verified PG accommodations with images and details.
  - Filter by room type, gender, and amenities.
  - View property locations on a map.
  - Save favorite PGs and manage bookings.
  - Real-time notifications and chat (coming soon).

- **For Owners (Admin Dashboard)**:
  - Manage property listings (Add/Edit/Delete).
  - Upload property images.
  - Track bookings and student inquiries.
  - Manage profile and business details.

## 🛠️ Tech Stack

- **Mobile App**: React Native (Expo)
- **Admin Dashboard**: React (Vite, Tailwind CSS)
- **Backend/Database**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Vanilla CSS (Mobile), Tailwind CSS (Admin)
- **Icons**: Lucide React, Expo Vector Icons

## 📁 Project Structure

```text
HypeHouse/
├── admin/            # React + Vite Admin Dashboard
├── src/              # React Native Mobile App source
├── assets/           # Shared assets (images, fonts)
├── supabase_setup.sql # Database schema and RLS policies
├── App.js            # Mobile app entry point
└── package.json      # Mobile app dependencies
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- Expo Go on your mobile device (for development)
- Supabase account and project

### Mobile App Setup
1. From the root directory, install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file from `.env.example` and add your Supabase credentials.
3. Start the Expo dev server:
   ```bash
   npx expo start
   ```

### Admin Dashboard Setup
1. Navigate to the `admin` directory:
   ```bash
   cd admin
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

### Database Setup
1. Create a new Supabase project.
2. Run the SQL script found in `supabase_setup.sql` in the Supabase SQL Editor to initialize tables, roles, and RLS policies.
3. Configure authentication (Email/Phone) and create storage buckets (`pg-images`, `avatars`) as defined in the script.

## 📄 License
MIT
