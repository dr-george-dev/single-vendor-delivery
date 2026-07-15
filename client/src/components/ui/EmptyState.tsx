import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Brand } from '../../constants/brand';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  icon?: React.ComponentProps<typeof Feather>['name'];
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = 'package',
  title,
  subtitle,
  actionLabel,
  onAction,
}: Props) {
  return (
    <View className="py-16 items-center px-8">
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-5"
        style={{ backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.border }}
      >
        <Feather name={icon} size={32} color={Brand.mutedLight} />
      </View>
      <Text className="text-xl font-extrabold text-gray-900 mb-2 text-center">{title}</Text>
      {subtitle ? (
        <Text className="text-gray-500 text-center leading-6 mb-6">{subtitle}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} variant="dark" className="px-10" />
      ) : null}
    </View>
  );
}
