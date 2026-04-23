# HypeHouse Admin Dashboard

The HypeHouse Admin Dashboard is a web application built for property owners to manage their PG listings, bookings, and profile information.

## 🚀 Features
- **Property Management**: List new PGs with details like room types, pricing, and amenities.
- **Image Management**: Integrated with Supabase Storage for property photos.
- **Booking Tracking**: Real-time view of current and upcoming bookings.
- **Role-Based Access**: Secure login for property owners using Supabase Auth.

## 💻 Technical Details
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v7)
- **Maps**: Leaflet (React Leaflet) for location management.
- **State Management**: React Context / Hooks

## 🛠️ Development

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Ensure you have the environment variables configured in the root `.env` or as per your deployment environment.

### Scripts
- `npm run dev`: Starts the development server.
- `npm run build`: Builds the production-ready application.
- `npm run lint`: Runs ESLint for code quality.

## 🌐 Deployment
The dashboard is designed to be compatible with platforms like Vercel or Netlify.
