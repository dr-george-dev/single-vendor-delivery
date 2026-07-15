/** Shared brand tokens for a cohesive premium food-delivery UI */
export const Brand = {
  bg: '#F6F4F1',
  surface: '#FFFFFF',
  ink: '#121212',
  inkSoft: '#2A2A2A',
  muted: '#6B7280',
  mutedLight: '#9CA3AF',
  border: '#EFECE8',
  accent: '#FF5A1F',
  accentDark: '#E04A12',
  accentSoft: '#FFF1EB',
  success: '#10B981',
  successSoft: '#ECFDF5',
  warning: '#F59E0B',
  warningSoft: '#FFF4E6',
  danger: '#EF4444',
  dangerSoft: '#FEF2F2',
  star: '#F59E0B',
  promo: '#1A1A1A',
} as const;

export const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  Burgers: { emoji: '🍔', label: 'Burgers' },
  Pizza: { emoji: '🍕', label: 'Pizza' },
  Sides: { emoji: '🍟', label: 'Sides' },
  Combos: { emoji: '🍱', label: 'Combos' },
  Drinks: { emoji: '🥤', label: 'Drinks' },
};

export const ORDER_STATUS_META: Record<
  string,
  { label: string; color: string; bg: string; step: number }
> = {
  Pending: { label: 'Pending', color: '#B45309', bg: '#FFFBEB', step: 0 },
  Preparing: { label: 'Preparing', color: '#C2410C', bg: '#FFF7ED', step: 1 },
  'Out for Delivery': { label: 'On the way', color: '#1D4ED8', bg: '#EFF6FF', step: 2 },
  Delivered: { label: 'Delivered', color: '#047857', bg: '#ECFDF5', step: 3 },
};
