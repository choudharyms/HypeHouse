You are a senior product designer and frontend engineer at a billion-dollar 
proptech startup. Redesign the HypeHouse React Native (Expo) app with a 
world-class "Liquid Glass" aesthetic that rivals Linear, Vercel, and Airbnb 
in visual quality. Every screen must feel like a premium spatial computing 
experience.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN SYSTEM — APPLY GLOBALLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COLOR TOKENS:
  --glass-bg: rgba(255, 255, 255, 0.08)
  --glass-border: rgba(255, 255, 255, 0.18)
  --glass-highlight: rgba(255, 255, 255, 0.35)
  --primary: #2563EB          /* Electric Blue */
  --primary-glow: #3B82F6
  --surface-dark: #0A0F1E
  --surface-card: #0F172A
  --text-primary: #F8FAFC
  --text-secondary: #94A3B8
  --accent-green: #10B981
  --accent-amber: #F59E0B
  --destructive: #EF4444
  --shadow-blue: rgba(37, 99, 235, 0.4)

TYPOGRAPHY:
  - Display/Headlines: "Clash Display" (weight 600–800), tight letter-spacing -0.04em
  - Body/Labels: "Cabinet Grotesk" (weight 400–500)
  - Monospace badges/pills: "JetBrains Mono"
  - Scale: 11 / 13 / 15 / 18 / 22 / 28 / 36 / 48px — never use odd or 
    off-scale values
  - All headings use fontVariant: ['tabular-nums'] where numbers appear

GLASS CARD SPEC (use on every card surface):
  background: rgba(15, 23, 42, 0.6)
  borderWidth: 1
  borderColor: rgba(255, 255, 255, 0.10)
  borderRadius: 24
  overflow: hidden
  — Add a LinearGradient overlay (0% opacity white → 6% opacity white, 
    diagonal 135°) as an absolute top-left reflection streak
  — Add a BoxShadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)
  — BlurView intensity: 80 (iOS), tint: "dark"

BUTTONS:
  Primary CTA:
    - background: LinearGradient(135°, #2563EB → #1D4ED8)
    - borderRadius: 16
    - paddingVertical: 16, paddingHorizontal: 28
    - fontSize: 16, fontWeight: 700, color: white
    - Shadow: 0 0 24px rgba(37,99,235,0.5) — glowing halo effect
    - On press: scale(0.97) with spring animation, shadow shrinks
  Ghost/Secondary:
    - background: rgba(255,255,255,0.06)
    - border: 1px solid rgba(255,255,255,0.15)
    - Same radius and padding as primary
    - Text: rgba(255,255,255,0.85)
    - On press: background brightens to rgba(255,255,255,0.12)
  Destructive (Logout):
    - background: rgba(239, 68, 68, 0.12)
    - border: 1px solid rgba(239,68,68,0.3)
    - text: #EF4444

PILLS / BADGES:
  - borderRadius: 999 (fully rounded)
  - paddingHorizontal: 12, paddingVertical: 5
  - fontSize: 12, fontWeight: 600, fontFamily: "JetBrains Mono"
  - Status Green: bg rgba(16,185,129,0.15), text #10B981, border rgba(16,185,129,0.3)
  - Status Amber: bg rgba(245,158,11,0.15), text #F59E0B, border rgba(245,158,11,0.3)
  - Category filter pills (active): bg #2563EB, text white, shadow: 0 0 12px rgba(37,99,235,0.4)
  - Category filter pills (inactive): glass-bg, border glass-border, text --text-secondary

INPUTS:
  - background: rgba(255,255,255,0.05)
  - borderWidth: 1, borderColor: rgba(255,255,255,0.10)
  - borderRadius: 14
  - paddingHorizontal: 16, paddingVertical: 14
  - fontSize: 15, color: white
  - placeholderTextColor: rgba(148,163,184,0.6)
  - On focus: borderColor transitions to rgba(37,99,235,0.7), 
    add glow shadow rgba(37,99,235,0.2) — animate with Reanimated withTiming 300ms

ICONS:
  Use lucide-react-native exclusively. strokeWidth: 1.5. 
  Active icons: color #2563EB. Inactive: rgba(148,163,184,0.6)

SPACING GRID: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48px — strict multiples of 4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANIMATION SYSTEM — FRAMER MOTION / REANIMATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use react-native-reanimated v3 + react-native-gesture-handler. 
Apply these animation presets:

SPRING CONFIG (for all interactive press states):
  damping: 18, stiffness: 220, mass: 0.8

ENTRANCE ANIMATIONS (staggered on screen mount):
  Every card/element enters with:
    - Initial: opacity 0, translateY 24
    - Final: opacity 1, translateY 0
    - Duration: 420ms, easing: Easing.out(Easing.cubic)
    - Stagger delay: index * 80ms (so card 1 = 80ms, card 2 = 160ms, etc.)
  Use FadeInDown from react-native-reanimated for all list items

SCROLL-DRIVEN 3D GLASS CARD STACKING (HomeScreen — GlassCards.js):
  This is the HERO animation. Implement precisely:
  
  Each card's transform is driven by scrollY:
  
  const CARD_HEIGHT = 220;
  const STACK_OFFSET = 16; // visible peek of card below
  
  For card at index i:
    const inputRange = [
      (i - 1) * CARD_HEIGHT,
      i * CARD_HEIGHT,
      (i + 1) * CARD_HEIGHT,
    ];
    
    translateY: interpolate(scrollY, inputRange, 
      [0, 0, -(CARD_HEIGHT - STACK_OFFSET)], 
      Extrapolation.CLAMP
    )
    
    scale: interpolate(scrollY, inputRange,
      [1, 1, 0.92],
      Extrapolation.CLAMP
    )
    
    opacity: interpolate(scrollY, inputRange,
      [1, 1, i < 2 ? 0 : 0.6],
      Extrapolation.CLAMP
    )
    
    // 3D tilt as card goes into stack:
    rotateX: interpolate(scrollY, inputRange,
      ['0deg', '0deg', '-4deg'],
      Extrapolation.CLAMP
    )
    
  Cards must use perspective: 1000 on their container for the rotateX to render.
  Add zIndex: cards.length - i so newer cards always layer above older.
  
BACKGROUND ORBS (Auth screens + Profile):
  - Two Animated.View circles, size 280-320px, borderRadius 999
  - Colors: rgba(37,99,235,0.18) and rgba(99,102,241,0.12)
  - Continuously animate with:
    useAnimatedStyle + withRepeat(withSequence(
      withTiming({translateX: 30, translateY: -20}, {duration: 4000}),
      withTiming({translateX: -20, translateY: 30}, {duration: 3500})
    ), -1, true)
  - Apply blur via style: {filter: 'blur(60px)'} or a blurred View overlay

TAB BAR ENTRANCE:
  On app load, TabBar slides up from y: 80 to y: 0 with spring animation, 
  delay 300ms after screen content appears.

BUTTON PRESS MICRO-INTERACTION:
  Wrap all Touchables in Animated.View:
  const animatedScale = useSharedValue(1);
  onPressIn: animatedScale.value = withSpring(0.96, {damping:18, stiffness:220})
  onPressOut: animatedScale.value = withSpring(1, {damping:18, stiffness:220})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN-SPECIFIC UPGRADES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LANDING SCREEN:
  - Full bleed background image with overlay: LinearGradient(
      ['rgba(0,0,0,0)', 'rgba(10,15,30,0.7)', 'rgba(10,15,30,0.97)'],
      locations: [0, 0.4, 1]
    )
  - Stats row: three glass pills with icons, separated by 1px vertical dividers 
    (rgba(255,255,255,0.15))
  - Headline animates in: words stagger, each word slides up from translateY:20 
    with opacity 0→1, 60ms apart
  - "Get Started" button has a pulsing glow: withRepeat(withSequence(
      withTiming(shadowOpacity 0.6), withTiming(shadowOpacity 0.2)), -1, true)

LOGIN / SIGNUP SCREENS:
  - Form card: full glass spec, padding 28px, gap 16px between inputs
  - "Login" / "Sign Up" button: full-width, primary spec with glow
  - Input focus state: animated border glow (see INPUTS above)
  - Forgot Password: text color --primary, no underline, fontWeight 500
  - Terms checkbox: custom glass checkbox — square 20px, borderRadius 6, 
    border rgba(255,255,255,0.2), checked state fills with #2563EB + checkmark icon

HOME SCREEN:
  - Search bar: glass spec, searchIcon left-padded at 16px in rgba(148,163,184,0.5)
  - Header avatar: 40px circle, border 2px solid rgba(37,99,235,0.6), 
    shadow 0 0 16px rgba(37,99,235,0.3)
  - Category pills scroll: no scrollbar, momentum scrolling, 
    active pill has 3D depth: shadowColor #2563EB, elevation 6
  - Distance tag on cards: map-pin icon (12px) + text in JetBrains Mono

SAVED SCREEN:
  - Sub-tabs: active tab has bottom border 2px solid #2563EB and text white; 
    inactive is --text-secondary. Animate border sliding with withSpring.
  - Heart button: absolute top-right on image, glass circle 36px, 
    on toggle: scale 1→1.3→1 with withSpring + color transition red/white
  - "Book Now" button: primary spec but height 44px, fontSze 14
  - Share button: ghost icon-only button, 44px square glass, lucide Share2 icon

BOOKINGS SCREEN:
  - "Active Stay" card: add a subtle animated shimmer — LinearGradient strip 
    that slides left→right using withRepeat every 2.5s (skeleton shimmer effect 
    on the status pill to show "live" status)
  - Check-in/out timeline: two dots connected by a dashed vertical line 
    (borderStyle: 'dashed'), dots are 10px circles in --primary

PROFILE SCREEN:
  - Avatar glow: two orbs inside card, one #2563EB at 30% opacity, 
    one #6366F1 at 20% opacity, both blurred 80px, positioned absolutely
  - Settings list items: each item is a glass row, height 56px, 
    icon in a 36px glass square (borderRadius 10), chevron-right icon at end
  - Logout row: entire row tinted rgba(239,68,68,0.08), icon color #EF4444
  - All rows: pressable with scale micro-interaction + background brightens on press

FLOATING TAB BAR:
  - height: 68px, bottom: 24px, horizontal margin: 24px
  - borderRadius: 38
  - background: rgba(10, 15, 30, 0.75) + BlurView intensity 100
  - border: 1px solid rgba(255,255,255,0.10)
  - shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)
  - Active icon: #2563EB with 8px glow halo beneath it 
    (a small blurred View rgba(37,99,235,0.4))
  - Tab switch: icon scale 1→1.2→1 with spring on focus

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUALITY CHECKLIST — ENFORCE ON EVERY SCREEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ No raw white backgrounds — always #0A0F1E or a glass surface
✓ No flat/outlined buttons without glow or glass treatment
✓ No text directly on dark background without proper opacity hierarchy 
  (primary: 1.0, secondary: 0.6, tertiary: 0.35)
✓ Every touchable has a press animation (scale or background shift)
✓ All lists use staggered FadeInDown entrance
✓ Icons are always lucide, strokeWidth 1.5, never filled
✓ All status badges use the pill spec with matching color tokens
✓ Safe area insets applied on all screens (useSafeAreaInsets)
✓ ScrollViews have contentContainerStyle paddingBottom: 120 for tab bar clearance
✓ Fonts loaded via expo-font with AppLoading/SplashScreen gate
✓ All animations use useSharedValue + useAnimatedStyle, never setState for motion