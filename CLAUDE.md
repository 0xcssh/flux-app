# FLUX — Men's Hormonal Cycle Tracker
> Project context file for Claude Code

---

## Vision

**Help men understand their natural energy, mood, and performance fluctuations to make better daily decisions.**

---

## Scientific Foundation

- **Circadian rhythm (24h)**: testosterone peaks 5:30-8:00 AM, drops 20-43% by evening (Diver 2003, Brambilla 2008)
- **Infradian rhythm (~20-30 days)**: detected in 60% of men (Doering 1975, Celec 2003). Presented with nuance.
- **Seasonal rhythm**: peak late summer/autumn, nadir winter/spring (Tromsø study, 1,500+ men)
- **Functional impact**: mood, energy, libido, cognition, physical performance fluctuate with these cycles

The app does not replace medical advice. It helps users observe their own patterns.

---

## Product Positioning

- **Category**: men's health / wellness / biohacking
- **Analogy**: "Flo (period tracker) for men"
- **Tone**: scientific and accessible, never preachy, never "bro science"
- **Platform**: iOS + Android simultaneously (Expo + EAS Build). Apple Developer account active. Dev from Windows.
- **Language**: English only for now. French translations exist in JSON files, ready for re-activation.
- **Design**: Dark masculine theme — deep black (#0A0A0F), dark cards (#1A1A2E), electric blue (#3B82F6), neon green (#22C55E), amber (#F59E0B), purple (#A78BFA). Premium feel, no emojis — vector icons only (Ionicons + MaterialCommunityIcons).
- **Monetization**: Freemium with 7-day Premium trial. Free + Premium (€9.99/mo) + Pro (€19.99/mo).
- **User flow**: No account required. Onboarding → app immediately. Account optional for sync.
- **Module NoFap**: enabled by default, integrated into daily log and insights.

---

## Architecture — Current State (Built)

### 5 Tab Screens

#### 1. Dashboard — Adaptive & Contextual
- **DaySelector**: horizontal 7-day calendar (3 past + today + 3 future), scores colored by vitality
- **4 states**: today not-logged (minimal + LogCTA), today logged (full), past logged (review), past not-logged (missed)
- **Today logged layout**: VitalityScore → Logged badge → ActionPlanCard (Premium) → StreakBar → CommunityScore → QuickStats → IndicatorRow → SymptomPredictionCard → AdaptiveLearn → ArticleSuggestion (carousel)
- **Today not-logged**: VitalityScore(?) → LogCTA → SymptomPredictionCard → ActionPlanCard → CircadianPhaseCard → AdaptiveLearn

#### 2. My Cycle
- Tab selector: 24h / 30 Days
- CircadianChart: 24h SVG curve with phase zones and current time marker
- InfradianChart: 30-day vitality trend (Premium gated)
- WeeklySummary: 7-day bar chart
- PhaseIndicator: 4-segment progress bar
- SymptomTimeline: vertical timeline showing predicted symptoms per phase
- PhaseCalendar: monthly calendar colored by daily vitality score
- HistoryComparison: today vs yesterday vs last week

#### 3. Daily Log
- 6 sliders (1-10): energy, mood, libido, sleep_quality, stress, training
- Optional notes field
- NoFap checkbox (always visible)
- Vitality score computed on submit
- Offline-first: saves to local store, syncs to Supabase when connected

#### 4. Insights — Progressive Tiered System
- **Universal (day 0)**: 6 science-based insights (always available)
- **Early (day 3+)**: per-metric averages, best/worst days, trends
- **Weekly (day 7+)**: day-of-week patterns, sleep→energy correlation, SymptomAccuracy, BestDaysCard, StreakImpactCard, Challenges (Premium)
- **Deep (day 14+)**: all correlations, infradian cycle detection, MonthlyReportCard (Premium)
- TierProgress indicator shows current level
- Insights screen is NEVER empty

#### 5. Profile
- User stats (total logs, streak, avg vitality)
- HistoryChart with range selector (7d free, 30d/90d/6M/1Y premium)
- Settings: notification time, language selector
- Export PDF (Premium)
- Logout

### Onboarding (6 screens)
1. Welcome — "Your hormones tell a story"
2. Circadian — 24h cycle explanation
3. Infradian — ~20-30 day cycle teaser
4. **Quiz** — 5 questions (age, wake time, activity, sleep, goal) → generates Hormonal Profile (Early Riser / Night Owl / Balanced) → adjusts circadian curve
5. Setup — notification time + language
6. Trial — Premium 7-day offer (skippable)

### Modals
- Paywall: Free vs Premium vs Pro comparison table
- Article viewer: magazine-style with hero area
- Action Plan detail: full daily plan (Premium)
- PDF preview
- NoFap details

---

## Premium Features (Monetization)

### Free
- Daily log + vitality score
- Circadian phase + symptom predictions
- 7-day history
- Universal insights (science-based)
- Basic NoFap tracking
- Articles library
- Community score percentile

### Premium — €9.99/mo or €59.99/yr
- **Daily Action Plan** — personalized 4-block daily plan based on circadian phase + user data
- **Guided Challenges** — 7-Day Sleep Reset, 14-Day Energy Boost, 30-Day Peak Performance
- Unlimited history
- Infradian cycle detection
- Weekly + Deep insights (correlations, patterns, recommendations)
- SymptomAccuracy score
- Monthly Report Card
- PDF export
- Advanced NoFap analytics

### Pro — €19.99/mo
- Everything Premium +
- TRT tracking (phase 2)
- Doctor-exportable reports (phase 2)
- AI coaching (phase 2)

---

## Key Features Implemented

### Symptom Predictions
- 16 symptoms mapped across 4 circadian phases with intensity indicators
- Works from day 1 (universal science)
- Personalizes after 7+ days of data
- File: `lib/symptomPredictions.ts`

### Phase-Aware Notifications
- 4 daily notifications aligned to circadian phases (6:30, 9:00, 14:00, 21:00)
- Personalizes after 7+ days (energy dip warnings, sleep priority)
- File: `lib/notifications.ts`

### Adaptive Learning
- Article suggestions based on user's low metrics
- Contextual recommendations change based on logged data
- File: `components/dashboard/AdaptiveLearn.tsx`

### Community Score
- Mock percentile based on normal distribution (mean=55, stddev=15)
- "Top X% of men your age" — motivational display
- File: `components/dashboard/CommunityScore.tsx`

### Hormonal Profile Quiz
- Adjusts circadian acrophase based on wake-up hour
- 3 profiles: Early Riser, Night Owl, Balanced
- File: `lib/hormonalProfile.ts`

---

## Stack Technique

- **Frontend**: React Native + Expo SDK 52+ (managed workflow)
- **Build**: EAS Build (iOS cloud compilation from Windows)
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **State**: Zustand with expo-secure-store persistence
- **Charts**: react-native-svg (pure SVG, no victory-native/Skia — Expo Go compatible)
- **Icons**: @expo/vector-icons (Ionicons + MaterialCommunityIcons + FontAwesome)
- **i18n**: i18next + react-i18next (English active, French ready)
- **Payments**: RevenueCat
- **Notifications**: Expo Notifications (phase-aware scheduling)
- **Analytics**: PostHog (configured, not yet active)
- **Date handling**: `lib/dateUtils.ts` — always use local dates, never toISOString()

---

## Database Schema (Supabase)

- `profiles` — user profile (birth_year, timezone, language, notification_time)
- `daily_logs` — one per user per day (6 metrics + vitality_score + nofap_checked)
- `nofap_streaks` — start_date, end_date, is_active
- `push_tokens` — Expo push tokens
- `user_insights` — cached insight computations
- RLS policies: all tables scoped to `auth.uid()`
- Trigger: auto-create profile on signup

---

## Development Principles

- **Privacy first**: Row Level Security. No data resale. GDPR compliant.
- **Offline first**: daily log works without connection, syncs in background.
- **No account required**: user can use the app fully without signing up. Account for sync only.
- **Dark theme only**: premium masculine aesthetic. No light mode.
- **No emojis**: vector icons only (Ionicons, MaterialCommunityIcons).
- **English first**: French translations ready but disabled. Will re-enable later.
- **Local dates**: always use `formatLocalDate()` from `lib/dateUtils.ts`, never `toISOString().split('T')[0]`.

---

## Project Creator

**Cash (Anthony Awdi)**, entrepreneur based in Toulouse. Founder of Meara (e-commerce customer service automation via AI). Profile: digital marketing, e-commerce, Shopify, n8n automation, AI.

FLUX is a parallel project in active development phase.
