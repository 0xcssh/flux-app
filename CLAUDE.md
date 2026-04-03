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
- **Monetization**: Freemium with 7-day Premium trial. Free + Premium only (no Pro tier). Pricing: 14.99€/mo or 89.99€/yr. Downsell: 12.99€/mo or 79.99€/yr.
- **User flow**: No account required. Onboarding → app immediately. Account optional for sync.
- **Module NoFap**: enabled by default, integrated into daily log and insights.

---

## Architecture — Current State (Built)

### 5 Tab Screens

#### 1. Dashboard — Adaptive & Contextual (5 sections)
- **DaySelector**: horizontal 7-day calendar (3 past + today + 3 future), scores colored by vitality
- **4 states**: today not-logged (minimal + LogCTA), today logged (full), past logged (review), past not-logged (missed)
- **Today logged layout (5 sections)**:
  - Section 1 (Score): VitalityScore (animated ring) + ShareButton + status row (Logged + Streak)
  - Section 2 (Plan): ActionPlanCard (current phase visible, rest blurred for free)
  - Section 3 (State): QuickStats (NoFap streak + Phase + vs Yesterday) + IndicatorRow + SymptomPredictionCard
  - Section 4 (Progress): CommunityScore + WeeklyReportCard (Mon/Tue only)
  - Section 5 (Learn): ChallengeWidget + AdaptiveLearn + ArticleSuggestion (Flo-style carousel)
- **Today not-logged**: VitalityScore(?) → LogCTA → SymptomPredictionCard → ActionPlanCard → CircadianPhaseCard → AdaptiveLearn

#### 2. My Cycle
- Tab selector: 24h / 30 Days
- CircadianChart: 24h SVG curve with phase zones and current time marker (adjusted by hormonal profile)
- InfradianChart: 30-day vitality trend (Premium gated)
- WeeklySummary: 7-day bar chart
- PhaseIndicator: 4-segment progress bar
- SymptomTimeline: vertical timeline showing predicted symptoms per phase
- PhaseCalendar: predictive monthly calendar (actual scores + predicted future scores based on day-of-week patterns)
- HistoryComparison: today vs yesterday vs last week

#### 3. Daily Log
- Compact header: "Daily Check-in" + "60 sec" badge
- Live score preview (big number, updates in real-time as sliders move)
- 6 sliders (1-10): energy, mood, libido, sleep_quality, stress, training
- NoFap toggle card (visible, styled)
- Submit button with score
- Haptic feedback on sliders and submit
- NoFap checkbox syncs with nofapStore streak on submit

#### 4. Insights — Progressive Tiered System (5 sections)
- Section 1 (Coaching): Active challenge detail (if in progress)
- Section 2 (Patterns): SymptomAccuracy + BestDaysCard + EarlyPatterns + correlations
- Section 3 (Data): StreakImpactCard + MonthlyReportCard (Premium)
- Section 4 (Science): 6 Universal Insights (always visible)
- Section 5 (Challenges): 3 guided programs (Premium)
- TierProgress indicator: Universal → Early (3d) → Weekly (7d) → Deep (14d)
- Insights screen is NEVER empty

#### 5. Profile
- User stats (total logs, streak, avg vitality)
- HistoryChart with range selector (7d free, 30d/90d/6M/1Y premium)
- Settings: reminder time, smart reminders toggle (Premium)
- Export PDF (Premium)
- Replay Onboarding button (dev)
- Logout

### Onboarding (5 screens, animated)
1. Welcome — "FLUX" hero text with fade-in + scale animation
2. Circadian — animated bar chart (stagger) + "Peak: 5:30-8:00 AM" badge
3. Infradian — animated bar chart (stagger) + "~20-30 day cycle" badge
4. **Personalize** — single page form: age (with +/- buttons), wake time chips (5:00-11:00), activity dots (colored gradient), sleep dots, goal cards (2x2), notification permission popup → ProfileResult full screen (personalized data + mini curve)
5. Trial — emotional paywall design (3 feature blocks + plan selection annual/monthly + social proof + downsell on skip)

### Modals
- Paywall: emotional design, 14.99€/89.99€, downsell 12.99€/79.99€
- Article viewer: magazine-style with hero area
- Action Plan detail: full daily plan (Premium)
- PDF preview
- NoFap details

---

## Premium Features (Monetization)

### Free
- Daily log + vitality score
- Circadian phase + symptom predictions
- 1 action plan block (current phase only, rest blurred)
- 7-day history
- Universal + Early insights
- Basic NoFap tracking
- Articles library
- Community score percentile
- Share card (Instagram story format)

### Premium — €14.99/mo or €89.99/yr (downsell: €12.99/€79.99)
- **Full Daily Action Plan** — 4 time blocks visible + detail modal
- **Weekly Performance Report** — score, trends, 3 weekly actions
- **Smart Reminders** — phase + pattern + streak notifications (up to 7/day)
- **Guided Challenges** — 7-Day Sleep Reset, 14-Day Energy Boost, 30-Day Peak Performance
- Unlimited history
- Infradian cycle detection
- Weekly + Deep insights (correlations, patterns, recommendations)
- SymptomAccuracy score
- BestDays + StreakImpact cards
- Monthly Report Card
- PDF export
- Advanced NoFap analytics

---

## Key Features Implemented

### Symptom Predictions
- 16 symptoms mapped across 4 circadian phases with intensity indicators
- Works from day 1 (universal science)
- Personalizes after 7+ days of data
- File: `lib/symptomPredictions.ts`

### Phase-Aware Smart Reminders
- Free: 1 notification/day (rise phase)
- Premium: up to 7/day (4 phase + 2 pattern + 1 streak)
- Personalizes after 7+ days (energy dip warnings, sleep priority, streak motivation)
- Files: `lib/smartReminders.ts`, `lib/notifications.ts`

### Adaptive Dashboard
- Content changes based on: selected day, logged status, time of day
- DaySelector for temporal navigation
- AdaptiveLearn suggests articles based on weak metrics
- ChallengeWidget interactive from dashboard (no navigation to Insights needed)

### Community Score
- Mock percentile based on normal distribution (mean=55, stddev=15)
- "Top X% of men your age" — motivational display

### Hormonal Profile Quiz
- Single page form with precise inputs (age number, wake time, colored dots, goal cards)
- Adjusts circadian acrophase based on wake-up hour
- 3 profiles: Early Riser, Night Owl, Balanced
- Profile result: full screen with personalized data + mini circadian curve
- Connected to: useCircadianPhase, CircadianChart, ActionPlanCard

### Share Card
- Instagram story format (score + streak + phase)
- react-native-view-shot capture + expo-sharing
- Free for all users (virality)

### Micro-Animations
- VitalityScore ring: animated fill (0→score, 800ms)
- Score countUp in dashboard
- Score pulse in daily log when value changes
- QuickStats: stagger fade-in
- Onboarding: bar chart stagger, text fade-in, slide transitions
- Haptics: sliders, tab changes, toggles, quiz selections

---

## Stack Technique

- **Frontend**: React Native + Expo SDK 52+ (managed workflow)
- **Build**: EAS Build (iOS cloud compilation from Windows)
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **State**: Zustand with expo-secure-store persistence
- **Charts**: react-native-svg (pure SVG, no victory-native/Skia — Expo Go compatible)
- **Icons**: @expo/vector-icons (Ionicons + MaterialCommunityIcons + FontAwesome)
- **i18n**: i18next + react-i18next (English active, French ready)
- **Payments**: RevenueCat (configured, test key active). `useSubscription` hook reads from `subscriptionStore` (Zustand). RevenueCat writes to store on purchase/restore. Set `tier: 'premium'` in store for testing.
- **Notifications**: Expo Notifications (smart reminders scheduling)
- **Analytics**: PostHog (configured, not yet active)
- **Date handling**: `lib/dateUtils.ts` — always use `formatLocalDate()`, never `toISOString().split('T')[0]`
- **Animations**: React Native Animated API (not reanimated) + expo-haptics
- **Share**: react-native-view-shot + expo-sharing

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
- **Subscription testing**: set `tier: 'premium'` in `store/subscriptionStore.ts` to test premium features. Reset to `'free'` before production build.

---

## Current Status

- **Phase 0-2**: Complete (scaffolding, build, integration)
- **Phase 3**: Complete (onboarding refonte, animations, haptics, visual polish)
- **Phase 4**: Next (EAS Build + store submission)
- **Known issues**: RevenueCat needs App Store Connect P8 key for real purchases. Currently using test key.

---

## Project Creator

**Cash (Anthony Awdi)**, entrepreneur based in Toulouse. Founder of Meara (e-commerce customer service automation via AI). Profile: digital marketing, e-commerce, Shopify, n8n automation, AI.

FLUX is a parallel project in active development phase.
