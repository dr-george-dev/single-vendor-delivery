import { Text, View } from 'react-native';
import { Brand } from '../../constants/brand';

type Props = {
  label: string;
  tone?: 'accent' | 'warning' | 'success' | 'muted' | 'dark';
  className?: string;
};

const tones = {
  accent: { bg: Brand.accentSoft, color: Brand.accent },
  warning: { bg: Brand.warningSoft, color: '#C2410C' },
  success: { bg: Brand.successSoft, color: Brand.success },
  muted: { bg: '#F3F4F6', color: Brand.muted },
  dark: { bg: 'rgba(255,255,255,0.12)', color: '#FFFFFF' },
};

export function Badge({ label, tone = 'warning', className = '' }: Props) {
  const t = tones[tone];
  return (
    <View className={`px-2.5 py-1 rounded-lg self-start ${className}`} style={{ backgroundColor: t.bg }}>
      <Text className="text-[10px] font-bold tracking-wide uppercase" style={{ color: t.color }}>
        {label}
      </Text>
    </View>
  );
}
