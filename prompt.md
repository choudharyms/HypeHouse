You are a world-class React Native / Expo engineer and product designer 
building MyCampusPG — a premium student PG finder app. Your task is to 
build the COMPLETE frontend, every screen, every button wired, zero 
placeholders, zero TODO comments.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE RULES — READ BEFORE WRITING A SINGLE LINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✗ NEVER leave a button without a working onPress handler
✗ NEVER use placeholder text like "// TODO" or "coming soon"
✗ NEVER break the design system — every screen uses the same tokens
✗ NEVER use inline random colors — only tokens from the design system
✗ NEVER mix navigation patterns — use the stack/tab structure below
✗ NEVER declare success without verifying the screen renders on device
✗ DO NOT create new screens not listed here
✗ DO NOT skip the verification step after each screen

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

src/
├── navigation/
│   ├── AppNavigator.js       ← root navigator (AuthStack + MainStack)
│   ├── AuthStack.js          ← Landing → Login → Signup
│   └── MainStack.js          ← Tab navigator (Home, Saved, Bookings, Profile)
├── screens/
│   ├── Auth/
│   │   ├── LandingScreen.js
│   │   ├── LoginScreen.js
│   │   └── SignupScreen.js
│   └── Main/
│       ├── HomeScreen.js
│       ├── PGDetailScreen.js     ← pushed from Home card tap
│       ├── SavedScreen.js
│       ├── BookingsScreen.js
│       ├── BookingDetailScreen.js ← pushed from booking card tap
│       └── ProfileScreen.js
│       └── EditProfileScreen.js  ← pushed from Profile menu
├── components/
│   ├── ui/
│   │   ├── GlassCard.js          ← reusable glass card wrapper
│   │   ├── GlassButton.js        ← primary / ghost / destructive variants
│   │   ├── GlassInput.js         ← animated focus border input
│   │   ├── StatusPill.js         ← green/amber/red status badges
│   │   └── TabBar.js             ← custom floating tab bar
│   └── home/
│       └── StackingCards.js      ← 3D scroll stacking listing cards
├── context/
│   └── AppContext.js             ← global state (user, saved, bookings)
├── data/
│   └── mockData.js               ← all mock PGs, bookings, user data
└── theme/
    └── tokens.js                 ← ALL design tokens in one file

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN SYSTEM TOKENS — tokens.js
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Export this exact object from theme/tokens.js and import it 
everywhere. Never hardcode colors:

export const colors = {
  bg: '#0A0F1E',
  surface: '#0F172A',
  glassBg: 'rgba(15, 23, 42, 0.6)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassHighlight: 'rgba(255, 255, 255, 0.06)',
  primary: '#2563EB',
  primaryGlow: 'rgba(37, 99, 235, 0.4)',
  primaryDim: 'rgba(37, 99, 235, 0.15)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: 'rgba(148, 163, 184, 0.5)',
  green: '#10B981',
  greenDim: 'rgba(16, 185, 129, 0.15)',
  greenBorder: 'rgba(16, 185, 129, 0.3)',
  amber: '#F59E0B',
  amberDim: 'rgba(245, 158, 11, 0.15)',
  amberBorder: 'rgba(245, 158, 11, 0.3)',
  red: '#EF4444',
  redDim: 'rgba(239, 68, 68, 0.12)',
  redBorder: 'rgba(239, 68, 68, 0.3)',
  white10: 'rgba(255,255,255,0.10)',
  white20: 'rgba(255,255,255,0.20)',
  white06: 'rgba(255,255,255,0.06)',
  divider: 'rgba(255,255,255,0.07)',
}

export const spacing = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 20,
  xl: 24, xxl: 32, xxxl: 40, huge: 48,
}

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 999,
}

export const typography = {
  displayXL: { fontFamily: 'ClashDisplay-Bold', fontSize: 48, letterSpacing: -1.5 },
  displayL:  { fontFamily: 'ClashDisplay-Bold', fontSize: 36, letterSpacing: -1.2 },
  displayM:  { fontFamily: 'ClashDisplay-SemiBold', fontSize: 28, letterSpacing: -0.8 },
  headingL:  { fontFamily: 'ClashDisplay-SemiBold', fontSize: 22, letterSpacing: -0.5 },
  headingM:  { fontFamily: 'CabinetGrotesk-Bold', fontSize: 18, letterSpacing: -0.3 },
  bodyL:     { fontFamily: 'CabinetGrotesk-Medium', fontSize: 16 },
  bodyM:     { fontFamily: 'CabinetGrotesk-Regular', fontSize: 15 },
  bodyS:     { fontFamily: 'CabinetGrotesk-Regular', fontSize: 13 },
  label:     { fontFamily: 'JetBrainsMono-Regular', fontSize: 12, letterSpacing: 0.5 },
  labelBold: { fontFamily: 'JetBrainsMono-Medium', fontSize: 12, letterSpacing: 0.5 },
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MOCK DATA — data/mockData.js
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create realistic mock data with these shapes:

PG listings (8 items):
{
  id, name, location, distanceFromCollege,
  pricePerMonth, rating, reviewCount,
  availability: 'Available' | 'Limited' | 'Full',
  amenities: [...], images: [...],
  type: 'Single' | 'Double' | 'Triple',
  gender: 'Boys' | 'Girls' | 'Co-ed',
  description, rules, ownerName, ownerPhone,
}

Bookings (3 items):
{
  id, pgId, pgName, pgImage,
  roomNumber, checkIn, checkOut,
  status: 'Active' | 'Upcoming' | 'Past',
  paymentStatus: 'Paid' | 'Partial' | 'Pending',
  totalAmount, paidAmount,
}

User:
{
  name: 'Madhusudan Sharma',
  email: 'madhu@example.com',
  phone: '+91 98765 43210',
  avatar: null, // use initials fallback
  college: 'IIT Delhi',
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NAVIGATION MAP — every button destination
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Wire EVERY button to its exact destination:

LandingScreen:
  "Get Started" ──────────────────→ SignupScreen
  "I already have an account" ────→ LoginScreen

LoginScreen:
  "Login" (valid form) ───────────→ MainStack (replace AuthStack)
  "Forgot Password?" ─────────────→ Alert: "Reset link sent to your email"
  "Sign Up" link ─────────────────→ SignupScreen

SignupScreen:
  "Sign Up" (valid form) ─────────→ MainStack (replace AuthStack)
  "Sign In" link ─────────────────→ LoginScreen

HomeScreen (Tab 1):
  Search bar type ────────────────→ filter listings in real-time
  Category pill tap ──────────────→ filter listings by category
  Listing card tap ───────────────→ PGDetailScreen (pass pg object)
  Heart icon on card ─────────────→ toggle saved state (AppContext)
  Profile avatar tap ─────────────→ ProfileScreen tab

PGDetailScreen (pushed):
  Back arrow ─────────────────────→ goBack()
  Heart icon ─────────────────────→ toggle saved (AppContext)
  Share icon ─────────────────────→ React Native Share sheet
  "Book Now" button ──────────────→ BookingConfirmAlert → 
                                    add to bookings (AppContext) → 
                                    navigate to BookingsScreen tab
  Image tap ──────────────────────→ full screen image viewer modal
  Amenity chips ──────────────────→ no action (display only)
  Owner "Call" button ────────────→ Linking.openURL('tel:...')
  Owner "WhatsApp" button ────────→ Linking.openURL('whatsapp://...')

SavedScreen (Tab 2):
  "Accommodations" tab ───────────→ show saved PGs
  "Shortlisted" tab ──────────────→ show shortlisted PGs (different list)
  Card tap ───────────────────────→ PGDetailScreen
  Heart icon ─────────────────────→ unsave (remove from saved, AppContext)
  "Book Now" button ──────────────→ same as PGDetailScreen Book Now flow
  Share icon ─────────────────────→ Share sheet

BookingsScreen (Tab 3):
  "Upcoming" tab ─────────────────→ show upcoming bookings
  "Past" tab ─────────────────────→ show past bookings
  Active stay card tap ───────────→ BookingDetailScreen
  Upcoming card tap ──────────────→ BookingDetailScreen
  "View Details" button ──────────→ BookingDetailScreen

BookingDetailScreen (pushed):
  Back arrow ─────────────────────→ goBack()
  "Download Receipt" ─────────────→ Alert: "Receipt downloaded"
  "Cancel Booking" ───────────────→ ConfirmAlert → update status in AppContext
  "Contact Support" ──────────────→ Linking.openURL('mailto:support@...')

ProfileScreen (Tab 4):
  Settings gear icon ─────────────→ Alert: "Settings coming soon"
  Avatar edit button ─────────────→ EditProfileScreen
  "Edit Profile" row ─────────────→ EditProfileScreen
  "Payment Methods" row ──────────→ Alert: "Payment methods coming soon"
  "Notifications" row ────────────→ Alert: "Notifications coming soon"  
  "Help & Support" row ───────────→ Linking.openURL('mailto:help@mycampuspg.com')
  "Logout" row ───────────────────→ ConfirmAlert → reset to AuthStack

EditProfileScreen (pushed):
  Back arrow ─────────────────────→ goBack()
  "Save Changes" ─────────────────→ update user in AppContext → goBack()
  Avatar change ──────────────────→ ImagePicker or Alert fallback

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REUSABLE COMPONENTS — build these first
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Build these before any screen. Every screen imports from here.

GlassCard.js:
  Props: children, style, onPress, noPadding
  - Glass bg, border, borderRadius 24, shadow
  - LinearGradient reflection streak overlay
  - If onPress: wrap in Pressable with scale spring animation

GlassButton.js:
  Props: label, onPress, variant ('primary'|'ghost'|'destructive'),
         icon, loading, disabled, fullWidth, size ('sm'|'md'|'lg')
  - Primary: gradient bg, glow shadow, white text
  - Ghost: glass bg, border, white text
  - Destructive: red dim bg, red border, red text
  - Loading: ActivityIndicator replaces label
  - Disabled: opacity 0.4, no press animation
  - Always has scale spring on press

GlassInput.js:
  Props: label, value, onChangeText, placeholder,
         secureTextEntry, icon, error, keyboardType
  - Animated border glow on focus (withTiming 300ms)
  - Eye toggle if secureTextEntry
  - Error state: red border + error message below
  - Label floats above input

StatusPill.js:
  Props: status ('Available'|'Limited'|'Full'|'Paid'|'Partial'|'Pending'|'Active')
  - Maps status → correct color token automatically
  - JetBrains Mono font

TabBar.js:
  - Floating, BlurView backed, fully custom
  - Icons: Home (house), Heart (saved), Calendar (bookings), User (profile)
  - Active glow halo under icon
  - Spring scale animation on tab switch

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STACKING CARDS ANIMATION — StackingCards.js
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is the hero animation of the app. Implement exactly:

const CARD_HEIGHT = 240;
const STACK_PEEK = 20;

Each card at index i driven by Reanimated scrollY SharedValue:

translateY: interpolate(scrollY, [
  (i-1)*CARD_HEIGHT, i*CARD_HEIGHT, (i+1)*CARD_HEIGHT
], [0, 0, -(CARD_HEIGHT - STACK_PEEK)], Extrapolation.CLAMP)

scale: interpolate(scrollY, [
  (i-1)*CARD_HEIGHT, i*CARD_HEIGHT, (i+1)*CARD_HEIGHT
], [1, 1, 0.93], Extrapolation.CLAMP)

opacity: interpolate(scrollY, [
  (i-2)*CARD_HEIGHT, (i-1)*CARD_HEIGHT, i*CARD_HEIGHT
], [0, 0.7, 1], Extrapolation.CLAMP)

rotateX: interpolate(scrollY, [
  i*CARD_HEIGHT, (i+1)*CARD_HEIGHT
], [0, -5], Extrapolation.CLAMP) + 'deg'

Container: perspective(1000), zIndex: listings.length - i
Wrap each card in Animated.View with the above transforms.

Card content:
- Full width image (height 160) with rounded top corners
- Availability badge (StatusPill) absolute top-right on image
- Heart icon absolute top-left on image (toggles saved)
- Below image: Name, Location row, Distance pill
- Price + "Book Now" button in a row at bottom
- Rating stars row

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN SPECS — build in this exact order
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ORDER: tokens → mockData → AppContext → 
       GlassCard → GlassButton → GlassInput → StatusPill → TabBar →
       LandingScreen → LoginScreen → SignupScreen → AppNavigator →
       HomeScreen → StackingCards → PGDetailScreen →
       SavedScreen → BookingsScreen → BookingDetailScreen →
       ProfileScreen → EditProfileScreen

Build and verify each before moving to the next.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN: LandingScreen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Full bleed image (use a dark campus image URL from unsplash)
- Dark gradient overlay bottom 60% of screen
- Top: MyCampusPG logo text + tagline
- Stats row: "10k+ PGs" | "4.8★ Rating" | "✓ Verified"
  Three glass pills separated by dividers
- Bottom 40%: headline + two buttons
- Headline animates word by word on mount (stagger 60ms per word)
- "Get Started" → primary GlassButton full width
- "Already have account" → ghost GlassButton full width

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN: LoginScreen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Animated background orbs (two blurred circles, continuous float)
- GlassCard form container, padding 28
- Title "Welcome back" + subtitle
- GlassInput: Email (keyboard: email-address)
- GlassInput: Password (secureTextEntry, eye toggle)
- "Forgot Password?" right-aligned text link
- GlassButton primary: "Login" full width
  → validate: both fields non-empty, email has @
  → if invalid: show red error state on relevant input
  → if valid: navigate to MainStack
- Divider "or"
- GlassButton ghost: "Sign Up" full width → SignupScreen
- Staggered FadeInDown entrance for each form element

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN: SignupScreen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Same orb background as Login
- GlassCard form container
- GlassInput: Full Name
- GlassInput: Email
- GlassInput: Password (strength indicator bar below: 
    red=weak, amber=medium, green=strong, animates withTiming)
- Custom glass checkbox for Terms (required)
- GlassButton primary: "Create Account" full width
  → validate all fields, checkbox checked
  → navigate to MainStack on success
- "Sign In" link → LoginScreen

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN: HomeScreen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Header row: Campus logo box | "MyCampusPG" | avatar circle
  Avatar tap → ProfileScreen tab
- GlassInput search bar (full width)
  → filters StackingCards in real-time by name or location
- Horizontal scroll category pills:
  "All" | "Single Room" | "Double" | "Girls PG" | "Boys PG" | 
  "Under ₹5k" | "Near Campus" | "Co-ed"
  → each filters the listings array
- StackingCards component below (filtered listings)
- All cards pass onPress → PGDetailScreen
- Staggered entrance animation on screen mount

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN: PGDetailScreen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Receives `pg` object via route.params
- Full-width hero image (height 280) with:
  - Gradient overlay bottom half
  - Back arrow (glass circle button top-left)
  - Heart + Share icons (glass circle buttons top-right)
  - Availability StatusPill bottom-left on image
  - Rating pill bottom-right on image
- Scrollable content below image:
  - PG name (headingL), location (bodyM, textSecondary)
  - Price row: "₹X,XXX/month" in primary blue + "Per bed"
  - Quick stats row: 4 glass tiles (Type, Gender, Distance, Rooms)
  - "Amenities" section: wrap of chip pills (WiFi, AC, Laundry etc.)
  - "Description" section: bodyM text, expandable with "Read more"
  - "House Rules" section: list with icons
  - "Owner" GlassCard: avatar circle + name + 
    "Call" button (green) + "WhatsApp" button (green outline)
  - "Location" section: static map placeholder GlassCard 
    with address text
- Sticky bottom bar (above tab bar):
  GlassCard row: Price left + "Book Now" primary button right
  "Book Now" → ConfirmAlert with booking summary → 
  add to AppContext bookings → navigate to BookingsScreen

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN: SavedScreen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Header: "Saved PGs" title + filter icon
- Sub-tabs: "Accommodations" | "Shortlisted"
  Animated sliding underline between tabs
- If saved list empty: centered empty state illustration 
  (SVG or emoji) + "No saved PGs yet" + ghost button 
  "Explore PGs" → HomeScreen tab
- Saved cards (FlatList):
  Same design as StackingCards but WITHOUT stacking physics
  (normal flat scroll). Card tap → PGDetailScreen.
  Heart tap → unsave with scale animation + remove from list

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN: BookingsScreen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Header: "My Bookings"
- Sub-tabs: "Upcoming" | "Past"
- Active stay section (if exists):
  GlassCard with blue left border accent:
  - Thumbnail image (80x80, borderRadius 12) + shimmer on status pill
  - "ACTIVE STAY" label in primary blue
  - PG name + room number
  - Check-in → Check-out timeline (dots + dashed line)
  - "View Details" ghost button → BookingDetailScreen
- Upcoming/Past list: booking cards with StatusPill + amount + dates
  Card tap → BookingDetailScreen
- Empty state if no bookings in active tab

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN: BookingDetailScreen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Back arrow header + "Booking Details" title
- Hero GlassCard: image + name + StatusPill + room number
- Payment GlassCard:
  - "Total: ₹XX,XXX"
  - "Paid: ₹XX,XXX" (green)
  - "Due: ₹X,XXX" (amber, if partial)
  - Progress bar (animated, shows paid ratio)
- Stay details GlassCard:
  - Check-in / Check-out dates
  - Duration in days
  - Booking ID (JetBrains Mono)
- Actions:
  - "Download Receipt" ghost button → Alert
  - "Contact Support" ghost button → mailto link
  - "Cancel Booking" destructive button (only if Upcoming) 
    → ConfirmAlert → update AppContext

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN: ProfileScreen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Header: back arrow (hidden on tab) + "My Profile" + gear icon
- Hero GlassCard (avatar section):
  Two large glowing orbs inside card as backlight
  Avatar circle (80px) with blue border + pencil sub-button
  → pencil taps → EditProfileScreen
  Name (headingM), email (bodyS, textSecondary), 
  phone (bodyS, textSecondary), college chip pill
- Stats row inside card: "2 Bookings" | "3 Saved" | "Member since 2024"
- Menu list (GlassCard rows, each 56px tall):
  Each row: glass icon square (36px) + label + chevron-right
  "Edit Profile"      → EditProfileScreen
  "Payment Methods"   → Alert
  "Notifications"     → Alert
  "Help & Support"    → mailto link
  "Logout"            → ConfirmAlert → reset to AuthStack

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN: EditProfileScreen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Back arrow + "Edit Profile" title + "Save" text button top-right
- Avatar section: large circle + "Change Photo" text link below
  → Alert: "Photo upload coming soon"
- GlassInput: Full Name (pre-filled from AppContext)
- GlassInput: Email (pre-filled)
- GlassInput: Phone (pre-filled, keyboardType: phone-pad)
- GlassInput: College Name (pre-filled)
- "Save Changes" primary GlassButton full width at bottom
  → validates non-empty → updates AppContext → goBack() with 
  success toast (small animated pill slides down from top: 
  "Profile updated ✓" green)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXT — AppContext.js
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Provide and expose:
  user, setUser
  savedPGs (array of pg ids), toggleSaved(pgId)
  bookings (array), addBooking(booking), cancelBooking(id)
  
Helper: isSaved(pgId) → boolean

Wrap entire app in <AppProvider> in App.js

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANIMATION RULES — apply everywhere
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Spring config for all press states:
  damping: 18, stiffness: 220, mass: 0.8

Screen entrance: every screen wraps content in FadeInDown 
  (react-native-reanimated entering prop), delay 100ms

List items: staggered FadeInDown, each item delay += 60ms

Button press: scale 1 → 0.96 → 1 with spring (onPressIn/Out)

Input focus: borderColor withTiming(primary, 300ms) + 
  shadow withTiming(primaryGlow, 300ms)

Tab switch: icon scale spring 1 → 1.2 → 1

Heart toggle: scale 1 → 1.35 → 1 with spring + color transition

Toast notification (success): translateY -80 → 0, 
  stays 2000ms, then fades out

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICATION GATE — mandatory after each screen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After building EACH screen, verify before moving on:

1. Does the screen render without errors? (check Metro logs)
2. Does every button on this screen have an onPress?
3. Does every navigation call use a valid screen name?
4. Are ALL colors imported from tokens.js (no hardcoded hex)?
5. Does this screen look consistent with previous screens?
6. Do animations run without dropping frames?

If ANY check fails → fix it → re-verify before proceeding.

Final check after ALL screens:
  Walk the full user journey end to end:
  Landing → Signup → Home → tap card → PGDetail → Book Now → 
  Bookings → tap booking → BookingDetail → back → Profile → 
  Edit Profile → save → Logout → Landing
  
  Every transition must be smooth, no white flashes, 
  no undefined navigation errors, no broken layouts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DO NOT STOP until the full journey above 
completes without a single error.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━