import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getHostFromConstants = (): string | null => {
  const hostCandidates = [
    Constants.manifest?.debuggerHost,
    Constants.expoConfig?.hostUri,
    (Constants as any).manifest2?.debuggerHost,
    (Constants as any).expoConfig?.hostUri,
  ];

  for (const candidate of hostCandidates) {
    if (!candidate) continue;
    const hostString = String(candidate);

    // Try URL parsing first, support hostUri values with protocol or port
    try {
      const parsed = new URL(hostString.includes('://') ? hostString : `http://${hostString}`);
      if (parsed.hostname) return parsed.hostname;
    } catch {
      // fall through to regex parsing
    }

    // Match a normal IPv4 address in the string
    const ipMatch = hostString.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
    if (ipMatch) return ipMatch[0];

    // Handle broken host strings like "192:168.1.9:19000"
    const parts = hostString.split(':');
    if (parts.length >= 3 && parts[1]?.includes('.') && parts[1].split('.').length === 3) {
      return `${parts[0]}.${parts[1]}`;
    }

    // Fallback to removing the last port segment
    if (hostString.includes(':')) {
      return hostString.split(':').slice(0, -1).join(':');
    }

    return hostString;
  }

  return null;
};

const host = getHostFromConstants();

const localHost = Platform.OS === 'web'
  ? 'localhost:5000'
  : Platform.OS === 'android'
    ? host
      ? `${host}:5000`
      : '10.0.2.2:5000'
    : host
      ? `${host}:5000`
      : '192.168.1.9:5000';

export const API_BASE_URL = `http://${localHost}`;
