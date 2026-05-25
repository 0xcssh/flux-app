import analytics from '@react-native-firebase/analytics';

let initialized = false;

export async function initFirebaseAnalytics(): Promise<void> {
  if (initialized) return;
  try {
    await analytics().setAnalyticsCollectionEnabled(true);
    initialized = true;
  } catch (e) {
    console.warn('[FirebaseAnalytics] init error:', e);
  }
}

function sanitizeEventName(event: string): string {
  return event.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 40);
}

function sanitizeParams(
  params?: Record<string, any>,
): Record<string, string | number | boolean> | undefined {
  if (!params) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    const key = k.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 40);
    if (v === null || v === undefined) continue;
    if (typeof v === 'string') {
      out[key] = v.slice(0, 100);
    } else if (typeof v === 'number' || typeof v === 'boolean') {
      out[key] = v;
    } else {
      out[key] = JSON.stringify(v).slice(0, 100);
    }
  }
  return out;
}

export async function logFirebaseEvent(
  event: string,
  params?: Record<string, any>,
): Promise<void> {
  if (!initialized) return;
  try {
    await analytics().logEvent(sanitizeEventName(event), sanitizeParams(params));
  } catch (e) {
    console.warn('[FirebaseAnalytics] logEvent error:', e);
  }
}

export async function setFirebaseUserId(userId: string | null): Promise<void> {
  if (!initialized) return;
  try {
    await analytics().setUserId(userId);
  } catch (e) {
    console.warn('[FirebaseAnalytics] setUserId error:', e);
  }
}

export async function setFirebaseUserProperty(
  name: string,
  value: string | null,
): Promise<void> {
  if (!initialized) return;
  try {
    await analytics().setUserProperty(sanitizeEventName(name), value);
  } catch (e) {
    console.warn('[FirebaseAnalytics] setUserProperty error:', e);
  }
}

export async function setFirebaseUserProperties(
  props: Record<string, string | number | boolean | null>,
): Promise<void> {
  if (!initialized) return;
  try {
    for (const [k, v] of Object.entries(props)) {
      const value = v === null ? null : typeof v === 'string' ? v : String(v);
      await analytics().setUserProperty(sanitizeEventName(k), value);
    }
  } catch (e) {
    console.warn('[FirebaseAnalytics] setUserProperties error:', e);
  }
}
