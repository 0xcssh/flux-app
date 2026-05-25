// Firebase Analytics integration deferred to v1.2.
// Native @react-native-firebase build fails to install pods on Expo SDK 55 + RN 0.83 + iOS 26.
// To re-enable: install @react-native-firebase/app + analytics, restore the analytics() calls below,
// uncomment the plugin + ios.googleServicesFile in app.config.js, and re-upload the plist via
// `eas env:create --type file --name GOOGLE_SERVICES_INFO_PLIST`.

export async function initFirebaseAnalytics(): Promise<void> {
  return;
}

export async function logFirebaseEvent(
  _event: string,
  _params?: Record<string, any>,
): Promise<void> {
  return;
}

export async function setFirebaseUserId(_userId: string | null): Promise<void> {
  return;
}

export async function setFirebaseUserProperty(
  _name: string,
  _value: string | null,
): Promise<void> {
  return;
}

export async function setFirebaseUserProperties(
  _props: Record<string, string | number | boolean | null>,
): Promise<void> {
  return;
}
