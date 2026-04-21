import { Platform } from 'react-native';
import {
  requestTrackingPermissionsAsync,
  getTrackingPermissionsAsync,
  PermissionStatus,
} from 'expo-tracking-transparency';
import Purchases from 'react-native-purchases';
import { track, AnalyticsEvents } from './analytics';

export type TrackingStatus = 'granted' | 'denied' | 'not-determined' | 'restricted';

let trackingStatus: TrackingStatus = 'not-determined';

export function getTrackingStatus(): TrackingStatus {
  return trackingStatus;
}

export async function hasAskedForTrackingPermission(): Promise<boolean> {
  if (Platform.OS !== 'ios') return true;
  try {
    const { status } = await getTrackingPermissionsAsync();
    return status !== PermissionStatus.UNDETERMINED;
  } catch (e) {
    console.warn('[Tracking] getTrackingPermissionsAsync error:', e);
    return false;
  }
}

export async function requestTrackingPermission(): Promise<TrackingStatus> {
  if (Platform.OS !== 'ios') {
    trackingStatus = 'granted';
    return 'granted';
  }

  try {
    const { status } = await requestTrackingPermissionsAsync();
    const normalized: TrackingStatus =
      status === PermissionStatus.GRANTED
        ? 'granted'
        : status === PermissionStatus.DENIED
          ? 'denied'
          : status === PermissionStatus.UNDETERMINED
            ? 'not-determined'
            : 'restricted';

    trackingStatus = normalized;
    track(AnalyticsEvents.TRACKING_PERMISSION_RESPONDED, { status: normalized });

    if (normalized === 'granted') {
      await enableIdentifierCollection();
    }

    return normalized;
  } catch (e) {
    console.warn('[Tracking] requestTrackingPermissionsAsync error:', e);
    return 'not-determined';
  }
}

async function enableIdentifierCollection(): Promise<void> {
  try {
    await Purchases.collectDeviceIdentifiers();
  } catch (e) {
    console.warn('[Tracking] RevenueCat collectDeviceIdentifiers error:', e);
  }
}
