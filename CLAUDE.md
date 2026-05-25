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
- **Language**: 7 languages auto-detected from device — EN, FR, ES, IT, DE, PT, NL. Fallback EN. Full parity (469 keys × 7).
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

### app.config.js (migrated from app.json May 2026)

Config moved to `app.config.js` to read env vars (notably `GOOGLE_SERVICES_INFO_PLIST` from EAS file env var). Plugins safe on iOS 26 after testing:
- `expo-splash-screen`, `expo-localization`, `expo-notifications`, `expo-secure-store`, `expo-font`, `expo-tracking-transparency`
- bundleIdentifier: com.fluxcycle.app
- iOS infoPlist: `ITSAppUsesNonExemptEncryption: false` + `NSUserTrackingUsageDescription`
- No newArchEnabled, no experiments

⚠️ **DO NOT** add `@react-native-firebase/app` plugin OR `expo-build-properties` with `useFrameworks: static` — both cause Install Pods failures on this stack (RN 0.83 + Expo SDK 55 + iOS 26 patched). Firebase deferred to v1.2 pending deeper debug.

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
- **i18n**: i18next + react-i18next, 7 languages auto-detected via `expo-localization` (EN/FR/ES/IT/DE/PT/NL), 469 keys × 7 = 3,283 translations at parity
- **Payments**: RevenueCat (iOS production key active: appl_aRrosXyTcKfgVMkqfhxIFXLAlmW)
- **Notifications**: Expo Notifications + Smart Reminders v2 (predictive, i18n-aware, wake-time-adjusted, scoped cancellation by `data.type`)
- **Analytics**: PostHog active (key in EAS env). Firebase Analytics stubbed in `lib/firebaseAnalytics.ts` (no-ops), deferred to v1.2.
- **ATT**: `expo-tracking-transparency` installed. Prompt fires 1.5s post-onboarding, once. RevenueCat `collectDeviceIdentifiers()` called on grant for Apple Search Ads attribution.
- **AI / Task classification**: Supabase Edge Function `classify-task` (Deno) proxies to Claude Haiku via `ANTHROPIC_KEY` Supabase secret. Never exposed to client. Rate-limited 50/user/day via `classify_usage` table. Used by v1.2 Plan feature.
- **Date handling**: `lib/dateUtils.ts` — always use `formatLocalDate()`, never `toISOString().split('T')[0]`
- **Animations**: React Native Animated API (not reanimated for UI) + expo-haptics
- **Share**: react-native-view-shot + expo-sharing
- **Legal pages**: flux-legal.vercel.app/terms + /privacy

---

## Database Schema (Supabase)

- `profiles` — user profile (birth_year, timezone, language, notification_time)
- `daily_logs` — one per user per day (6 metrics + vitality_score + nofap_checked). UNIQUE(user_id, log_date) for upsert.
- `nofap_streaks` — start_date, end_date, is_active
- `push_tokens` — Expo push tokens
- `user_insights` — cached insight computations
- `classify_usage` — per-user daily rate limit tracking for the classify-task Edge Function (PK: user_id + date)
- RLS policies: all tables scoped to `auth.uid()`
- Trigger: auto-create profile on signup

### Edge Functions

- `supabase/functions/classify-task` — classifies a task title into one of 7 categories (deep_work, creative, admin, physical, strategic, social, recovery) using Claude Haiku 4.5. Requires user JWT. Rate-limited via `classify_usage`. Secret `ANTHROPIC_KEY` stored in Supabase secrets.

---

## Development Principles

- **Privacy first**: Row Level Security. No data resale. GDPR compliant.
- **Offline first**: daily log works without connection, syncs in background.
- **No account required**: user can use the app fully without signing up. Account for sync only.
- **Dark theme only**: premium masculine aesthetic. No light mode.
- **No emojis**: vector icons only (Ionicons, MaterialCommunityIcons).
- **Multi-language by default**: 7 languages active, auto-detected from device locale via `expo-localization`. Adding a new language = add to `SUPPORTED_LANGUAGES` in `i18n/index.ts` + create 10 JSON files at parity.
- **Local dates**: always use `formatLocalDate()` from `lib/dateUtils.ts`, never `toISOString().split('T')[0]`.
- **Subscription testing**: set `tier: 'premium'` in `store/subscriptionStore.ts` to test premium features. Reset to `'free'` before production build.
- **Build discipline**: Each EAS iOS build costs ~$2. Analyze thoroughly before building. Never build without confirmed root cause. 5 failed builds for Firebase wasted credits in May 2026 — always check Xcode Install Pods logs before retrying.
- **API keys server-side only**: never put Anthropic, OpenAI, or any sensitive key in the client (it ends up in the IPA, extractable in 5 sec via `grep`). Use Supabase Edge Functions to proxy. The `ANTHROPIC_KEY` is in Supabase Edge Function secrets, never in code.

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

## Current Status (May 25 2026)

- **v1.0.0 (build 44)**: Live in App Store production since April 16, 2026. 1 paying subscriber as of May 25.
- **v1.1.0 (build 45)**: On TestFlight, ready for App Store review submission. Contains all features below.
- **App Privacy declarations**: Updated in ASC to declare IDFA tracking (matches `NSUserTrackingUsageDescription` in binary).
- **iOS 26**: Working on physical devices. TurboModule SIGABRT patched via `patches/react-native+0.83.4.patch` + `postinstall` script.
- **Navigation**: Fully migrated from expo-router to React Navigation. Root in `App.tsx`.
- **Onboarding**: Hydration race fixed via `_hydrated` flag in settingsStore. No more flash for existing users.
- **Reinstall detection**: AsyncStorage sentinel (`flux_installed`) resets `onboardingSeen` when Keychain persists.
- **ErrorBoundary**: Wraps root app — catches JS crashes gracefully.
- **Supabase**: Env vars configured on EAS. Client is null-safe.
- **RevenueCat**: Purchase flow uses parallel offerings+products fetch with `purchaseStoreProduct()` fallback. Module-level cache + listener registered once via `ensureInit()` promise pattern (fixes race conditions when multiple components use `useSubscription`).
- **Apple Search Ads attribution**: Auto via `Purchases.collectDeviceIdentifiers()` when ATT granted.
- **Manage Subscription**: Opens iOS Settings (`apps.apple.com/account/subscriptions`), not the paywall (Apple compliance).
- **Legal compliance**: Auto-renewal disclaimers. Terms/Privacy/Support live on flux-legal.vercel.app.
- **Paid Apps Agreement**: Active.

### v1.1.0 new features (in build 45)

- **Smart Reminders v2** (Premium-only): predictive notifications. Engine returns `{templateKey, params, hour}`, resolved via i18n at schedule time. 16 templates × 7 languages. Phase hours derived from user's `wakeUpHour` (rise = wake, peak = wake+4, dip = wake+7, recovery = max(wake+14, 20)). Conditional: poor_sleep, NoFap milestones (day_7_libido, day_9_fog, day_14_focus, milestone 21/30/60/90), high_stress_3d, no_training_3d, low_day_of_week, improving_trend, streak.active, streak.broken. Wired via `<NotificationsManager/>` in MainTabs. Scoped cancellation by `data.type` ('smart-reminder' / 'daily-reminder' / 'milestone').
- **Backfill missed days**: Tap a past missed day on Dashboard → "Log this day" button → opens Log tab with date param. `logStore.submitLog()` accepts optional `logDate`. NoFap streak not retroactively rebuilt (live/forward-only).
- **In-app review prompt** (`expo-store-review`): triggers after 5th/15th/30th log if score ≥ 50. Pre-filter modal (😍/😐) routes positive to native iOS review, negative to mailto feedback. 60-day cooldown, 3 prompts/year cap.
- **ATT prompt** (`expo-tracking-transparency`): fires 1.5s post-onboarding, once. Persistent via system permission state.
- **Multi-language**: 7 languages (EN/FR/ES/IT/DE/PT/NL), auto-detected from `expo-localization`. Full parity (469 keys × 7).
- **Editable profile name**, **fixed wake-time bucketing** (4-profile generic → user's actual wakeUpHour), **'See all' dead button removed**, **article modal fallback**, **PDF retry**, **double-submit protection**.

### v1.2.0 prep (committed but not yet wired in UI)

- **Plan tab** (AI daily planner) — to build. UX: user types tasks freely, app classifies + suggests time slot aligned with hormonal peaks/dips.
- **Edge Function `classify-task`** deployed: proxies task title to Claude Haiku, returns category. JWT-auth, rate-limited 50/day/user.
- **`lib/taskClassifier.ts`** wrapper: tries local keyword match (free, multilingual) first, falls back to Edge Function for ambiguous cases.
- **Firebase Analytics**: deferred. `lib/firebaseAnalytics.ts` stubbed. `GOOGLE_SERVICES_INFO_PLIST` uploaded as EAS file env var. Re-enable: install `@react-native-firebase/app`+`analytics`, restore plugins in app.config.js, debug iOS Pods issue.
- **Meta SDK**: deferred until FB Business account unblocked.

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
- **DO NOT add `@react-native-firebase/app` plugin** to app.config.js without Pod debug — 5 build failures May 25 2026. Probable cause: conflict with `patches/react-native+0.83.4.patch` for iOS 26 TurboModule. Re-attempt requires reading Xcode Install Pods detailed logs first.
- **DO NOT add `expo-build-properties` with `useFrameworks: static`** — breaks RN 0.83 prebuilt frameworks (modulemap errors on QuartzCore, UIKit, RCTSwiftUI). Firebase v22+ doesn't require it anyway.
- **DO NOT put API keys in client code or `EXPO_PUBLIC_*` env vars** — they end up in the IPA bundle, extractable in 5 sec. Use Supabase Edge Functions to proxy. Verified case: Anthropic API key leaked in chat May 25, would have cost $$$ if shipped to client.
- **`supportsTablet: false`** — iPad not supported, avoids iPad screenshot requirement.
- **Each EAS build costs ~$2 (or counts against monthly quota)** — analyze before building. Don't retry blindly when build fails; read Xcode logs first.
- **Debug overlay technique**: when JS console.log unavailable (TestFlight), add a visible debug `<Text>` block on the screen showing state values. Removed in clean builds.
- **Xcode console filter**: must filter by "Flux" in Console.app search bar, not grep raw output.
- **RevenueCat empty offerings**: First-submission issue — auto-resolved after first Apple approval. Fallback `purchaseStoreProduct()` still active as safety net.
- **App Privacy declarations vs binary**: if `NSUserTrackingUsageDescription` is in Info.plist, ASC App Privacy section MUST declare at least one data type with "Used for tracking: Yes" (typically "Device ID"). Otherwise Apple blocks submission.
- **GoogleService-Info.plist**: gitignored (repo is public). Uploaded to EAS as file env var `GOOGLE_SERVICES_INFO_PLIST`. `app.config.js` reads it via `process.env.GOOGLE_SERVICES_INFO_PLIST`. Falls back to local `./GoogleService-Info.plist` for local builds.

---

## Project Creator

**Cash (Anthony Awdi)**, entrepreneur based in Toulouse. Founder of Meara (e-commerce customer service automation via AI). Profile: digital marketing, e-commerce, Shopify, n8n automation, AI.

FLUX live since April 2026. v1.1.0 ready for review submission. 1 paying subscriber. ASO focus + v1.2 Plan feature next.

## Globally installed Claude Code skills

- `claude-seo` (+12 sub-skills) — SEO audits, schema, sitemap, GEO
- `ceo` — strategic decision frameworks, board governance
- `cto` — technical leadership, tech debt, team scaling
- `agile-owner` — INVEST user stories, sprint planning

Use `/seo audit <url>`, `/ceo`, `/cto`, `/agile-owner` etc. via Claude Code Skill tool.
