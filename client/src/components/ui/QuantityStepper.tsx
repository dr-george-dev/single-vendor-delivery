import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PressableScale } from './PressableScale';
import { Brand } from '../../constants/brand';

type Props = {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  size?: 'sm' | 'md';
};

export function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  min = 1,
  size = 'md',
}: Props) {
  const isSm = size === 'sm';
  const btn = isSm ? 'w-8 h-8' : 'w-10 h-10';
  const text = isSm ? 'text-sm' : 'text-lg';

  return (
    <View
      className={`flex-row items-center rounded-full ${isSm ? 'px-1 py-0.5' : 'px-1.5 py-1'}`}
      style={{
        backgroundColor: Brand.bg,
        borderWidth: 1,
        borderColor: Brand.border,
      }}
    >
      <PressableScale
        onPress={onDecrement}
        scaleTo={0.88}
        className={`${btn} rounded-full items-center justify-center`}
        style={{ backgroundColor: Brand.surface }}
      >
        <Feather name="minus" size={isSm ? 14 : 16} color={value <= min ? Brand.mutedLight : Brand.ink} />
      </PressableScale>

      <Text className={`px-3 font-extrabold text-gray-900 ${text}`}>{value}</Text>

      <PressableScale
        onPress={onIncrement}
        scaleTo={0.88}
        className={`${btn} rounded-full items-center justify-center`}
        style={{ backgroundColor: Brand.ink }}
      >
        <Feather name="plus" size={isSm ? 14 : 16} color="#fff" />
      </PressableScale>
    </View>
  );
}
