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
- **Platform**: iOS first (Android later). Apple Developer account active. Dev from Windows.
- **Language**: English only for now. French translations exist in JSON files, ready for re-activation.
- **Design**: Dark masculine theme — deep black (#0A0A0F), dark cards (#1A1A2E), electric blue (#3B82F6), neon green (#22C55E), amber (#F59E0B), purple (#A78BFA). Premium feel, no emojis — vector icons only (Ionicons + MaterialCommunityIcons).
- **Monetization**: Freemium with 7-day Premium trial. Free + Premium only (no Pro tier). Pricing: $19.99/mo or $119.99/yr. Downsell: $14.99/mo or $99.99/yr.
- **User flow**: No account required. Onboarding → app immediately. Account optional for sync.
- **Module NoFap**: enabled by default, integrated into daily log and insights.

---

## Architecture — CRITICAL iOS 26 MIGRATION

### Navigation: React Navigation (NOT expo-router)

**expo-router is INCOMPATIBLE with iOS 26.** The app was migrated to React Navigation.

- **Root component**: `App.tsx` (not app/_layout.tsx)
- **Entry point**: `"main": "node_modules/expo/AppEntry.js"` in package.json
- **Navigation library**: `@react-navigation/stack` (JS-based, NOT native-stack)
- **Tab navigation**: `@react-navigation/bottom-tabs`
- **All screens**: lazy loaded with `React.lazy()` + `withSuspense()` wrapper
- **No _layout.tsx files** — they were deleted during migration
- **No app/index.tsx** — routing handled in App.tsx

### iOS 26 Constraints (DO NOT CHANGE)

- **DO NOT** use expo-router — crashes on iOS 26 (react-native-screens TurboModule issue)
- **DO NOT** use `createNativeStackNavigator` — uses react-native-screens, crashes on iOS 26
- **DO NOT** add `newArchEnabled: true` to app.json — crashes on iOS 26
- **DO NOT** add GestureHandlerRootView, SafeAreaProvider, or useFonts wrappers — caused splash screen to freeze
- **DO NOT** add plugins to app.json (expo-splash-screen, expo-font, etc.) — native plugins crash on iOS 26
- **KEEP** app.json minimal — no plugins, no experiments, no newArchEnabled
- **KEEP** `SplashScreen.hideAsync()` called immediately in useEffect (no waiting for fonts)
- **KEEP** all screens lazy loaded with React.lazy()

### Working app.json (DO NOT ADD PLUGINS)

The app.json that works on iOS 26 has NO plugins section. Only basic config:
- bundleIdentifier: com.fluxcycle.app
- backgroundColor: #0A0A0F
- No newArchEnabled
- No experiments
- No plugins array

---

## Architecture — Screens

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
- Replay Onboarding button (dev only, __DEV__ guarded)
- Logout

### Onboarding (5 screens, animated)
1. Welcome — "FLUX" hero text with fade-in + scale animation
2. Circadian — animated bar chart (stagger) + "Peak: 5:30-8:00 AM" badge
3. Infradian — animated bar chart (stagger) + "~20-30 day cycle" badge
4. **Personalize** — single page form: age (with +/- buttons), wake time chips (5:00-11:00), activity dots (colored gradient), sleep dots, goal cards (2x2), notification permission popup → ProfileResult full screen (personalized data + mini curve)
5. Trial — emotional paywall design (3 feature blocks + plan selection annual/monthly + social proof + downsell on skip)

### Modals
- Paywall: emotional design, $19.99/$119.99, downsell $14.99/$99.99
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

### Premium — $19.99/mo or $119.99/yr (downsell: $14.99/$99.99)
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

## Stack Technique

- **Frontend**: React Native + Expo SDK 55 (managed workflow)
- **Navigation**: React Navigation (@react-navigation/stack + bottom-tabs) — NOT expo-router
- **Build**: EAS Build (iOS cloud compilation from Windows)
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **State**: Zustand with expo-secure-store persistence
- **Charts**: react-native-svg (pure SVG)
- **Icons**: @expo/vector-icons (Ionicons + MaterialCommunityIcons + FontAwesome)
- **i18n**: i18next + react-i18next (English active, French ready)
- **Payments**: RevenueCat (iOS production key active: appl_aRrosXyTcKfgVMkqfhxIFXLAlmW)
- **Notifications**: Expo Notifications (smart reminders scheduling)
- **Analytics**: PostHog (configured, key in .env)
- **Date handling**: `lib/dateUtils.ts` — always use `formatLocalDate()`, never `toISOString().split('T')[0]`
- **Animations**: React Native Animated API (not reanimated for UI) + expo-haptics
- **Share**: react-native-view-shot + expo-sharing
- **Legal pages**: flux-legal.vercel.app/terms + /privacy

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
- **Build discipline**: Each EAS iOS build costs $2. Analyze thoroughly before building. Never build without confirmed root cause.

---

## App Store Configuration

- **Bundle ID**: com.fluxcycle.app
- **Apple Team ID**: 8L8G4P4Z9X
- **ASC App ID**: 6761628489
- **Apple ID**: awdianthony@gmail.com
- **EAS Project ID**: 95419e85-708b-4512-98c0-a42043d82b34
- **RevenueCat iOS Key**: appl_aRrosXyTcKfgVMkqfhxIFXLAlmW
- **PostHog Key**: phc_wWUYUPyZ7XMBDrRGmn9gv5JKsKrDyejkGjQ8X6zoPvSi
- **Legal**: flux-legal.vercel.app (terms + privacy)
- **Contact**: contact@meara.fr

---

## Current Status (April 13 2026)

- **Phase 0-4**: Complete
- **Phase 5**: App Store submission — rejected 2x, fixes implemented (retry + fallback + downsell removed), ready for resubmission
- **iOS 26**: Working on physical devices. TurboModule SIGABRT patched via `patches/react-native+0.83.4.patch` + `postinstall` script.
- **Navigation**: Fully migrated from expo-router to React Navigation (`@react-navigation/stack` + `bottom-tabs`). Root in `App.tsx`.
- **Onboarding**: Works. `finishOnboarding()` sets `onboardingSeen = true` → conditional navigator swaps automatically.
- **Reinstall detection**: AsyncStorage sentinel (`flux_installed`) resets `onboardingSeen` when Keychain persists after app deletion.
- **ErrorBoundary**: Wraps root app in `App.tsx` — catches JS crashes gracefully.
- **Supabase**: Env vars configured on EAS (`eas env:create`). Client is null-safe if vars missing.
- **RevenueCat**: Products created in ASC + RevenueCat. Offering `default` is Current. Entitlement: `premium`. Purchase flow: `getOfferings()` + `getProducts()` fetched in parallel. Si offerings vide → fallback `purchaseStoreProduct()`. Entitlements tracked automatiquement dans les deux cas.
- **Legal compliance**: Auto-renewal disclaimers on paywall + trial screens. Terms/Privacy/Support links live on flux-legal.vercel.app. Privacy nutrition labels declared.
- **SafeAreaView**: Applied to Cycle, Insights, Profile tabs (top edge).
- **Circadian phases**: Aligned with hormonal profile `adjustedAcrophase` across dashboard, ActionPlanCard, and CircadianChart zones.
- **Labels**: "Training Intensity" → "Physical Activity" / "Activity".
- **Paid Apps Agreement**: Active (signed, banking + tax forms complete).

---

## Apple Rejections (Resolved)

**Rejection 1 (April 8)**: IAPs not submitted with version, missing Terms link, support URL invalid → fixed.

**Rejection 2 (April 10)** — 3 issues, all resolved:
1. **2.1(b) Purchase fails** → Fixed: `getOfferings()` + `getProducts()` fetched en parallèle. Si offerings vide, fallback `purchaseStoreProduct()`. Zero latence ajoutée. Entitlements tracked automatiquement.
2. **5.6 DownsellModal** → Fixed: removed entirely (component deleted, references cleaned from paywall + trial + i18n).
3. **2.1(b) "40% less"** → Fixed: no more downsell = no more phantom product issue.

**Root cause**: RevenueCat filters offerings when IAPs are in "Waiting for Review" (first-submission chicken-and-egg). StoreKit `getProducts()` works fine. Fallback bypasses the offerings layer entirely.

**Note for resubmission**: Add reviewer note explaining that IAP purchases work — subscriptions available on paywall screen. Offerings may need first Apple approval to populate (known RevenueCat first-submission issue).

---

## Key Decisions & Gotchas

- **DO NOT add `babel-plugin-module-resolver`** — `@/` imports work via tsconfig paths + Metro/Expo natively. Adding module-resolver breaks the build.
- **DO NOT use Expo Go** — SDK 55 is incompatible. Use EAS builds or dev client.
- **DO NOT add DownsellModal** — Apple rejects it as manipulation (5.6 violation). Was removed April 13.
- **`supportsTablet: false`** — iPad not supported, avoids iPad screenshot requirement.
- **`NSUserTrackingUsageDescription` removed** — no tracking. Will re-add with Facebook SDK in v1.1.
- **Each EAS build costs ~$2** — analyze before building.
- **Debug overlay technique**: when JS console.log unavailable (TestFlight), add a visible debug `<Text>` block on the screen showing state values. Removed in clean builds.
- **Xcode console filter**: must filter by "Flux" in Console.app search bar, not grep raw output. Default Errors-only view hides JS console.log.
- **RevenueCat empty offerings**: First-submission issue — `getOfferings()` returns empty when IAPs are "Waiting for Review". Solution: fetch offerings + products en parallèle, fallback `purchaseStoreProduct()` si offerings vide. Zero latence ajoutée. Should auto-resolve after first Apple approval.

---

## Project Creator

**Cash (Anthony Awdi)**, entrepreneur based in Toulouse. Founder of Meara (e-commerce customer service automation via AI). Profile: digital marketing, e-commerce, Shopify, n8n automation, AI.

FLUX IAP issues resolved — ready for App Store resubmission.
