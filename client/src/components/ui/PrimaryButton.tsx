import { ActivityIndicator, Text, View } from 'react-native';
import { PressableScale } from './PressableScale';
import { Brand } from '../../constants/brand';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'dark' | 'ghost' | 'danger';
  rightLabel?: string;
  icon?: React.ReactNode;
  className?: string;
};

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  rightLabel,
  icon,
  className = '',
}: Props) {
  const isDisabled = disabled || loading;

  const bg =
    variant === 'primary'
      ? Brand.accent
      : variant === 'dark'
        ? Brand.ink
        : variant === 'danger'
          ? Brand.dangerSoft
          : 'transparent';

  const textColor =
    variant === 'ghost'
      ? Brand.muted
      : variant === 'danger'
        ? Brand.danger
        : '#FFFFFF';

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      className={`h-14 rounded-full items-center justify-center flex-row px-6 ${className}`}
      style={{
        backgroundColor: bg,
        opacity: isDisabled ? 0.55 : 1,
        shadowColor: variant === 'primary' ? Brand.accent : '#000',
        shadowOpacity: variant === 'ghost' || variant === 'danger' ? 0 : 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: variant === 'ghost' || variant === 'danger' ? 0 : 4,
      }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : rightLabel ? (
        <View className="flex-row items-center justify-between w-full">
          <View className="flex-row items-center">
            {icon}
            <Text
              className="font-extrabold text-[16px]"
              style={{ color: textColor, marginLeft: icon ? 8 : 0 }}
            >
              {label}
            </Text>
          </View>
          <Text className="font-black text-[16px]" style={{ color: textColor }}>
            {rightLabel}
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center justify-center">
          {icon}
          <Text
            className="font-extrabold text-[16px]"
            style={{ color: textColor, marginLeft: icon ? 8 : 0 }}
          >
            {label}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}
