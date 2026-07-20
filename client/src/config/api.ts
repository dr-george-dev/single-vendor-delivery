import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getHostFromConstants = (): string | null => {
  const hostCandidates = [
    Constants.expoConfig?.hostUri,
    (Constants as any).expoGoConfig?.debuggerHost,
    (Constants as any).manifest?.debuggerHost,
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost,
  ];

  for (const candidate of hostCandidates) {
    if (!candidate) continue;
    const hostString = String(candidate);

    try {
      const parsed = new URL(hostString.includes('://') ? hostString : `http://${hostString}`);
      if (parsed.hostname) return parsed.hostname;
    } catch {
      // Fall through to the conservative host fallback below.
    }

    const hostOnly = hostString.split(':')[0];
    if (hostOnly) return hostOnly;
  }

  return null;
};

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '');
const host = getHostFromConstants();

const localHost = Platform.OS === 'web'
  ? 'localhost:5000'
  : Platform.OS === 'android'
    ? host
      ? `${host}:5000`
      : '10.0.2.2:5000'
    : host
      ? `${host}:5000`
      : 'localhost:5000';

// Set EXPO_PUBLIC_API_URL for physical devices, production builds, or a hosted API.
export const API_BASE_URL = configuredUrl || `http://${localHost}`;