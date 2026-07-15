import { Feather } from '@expo/vector-icons';
import { PressableScale } from './PressableScale';
import { Brand } from '../../constants/brand';

type Props = {
  name: React.ComponentProps<typeof Feather>['name'];
  onPress?: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
};

export function IconButton({
  name,
  onPress,
  size = 20,
  color = Brand.ink,
  backgroundColor = Brand.surface,
  className = '',
}: Props) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.9}
      className={`w-11 h-11 rounded-full items-center justify-center ${className}`}
      style={{
        backgroundColor,
        borderWidth: 1,
        borderColor: Brand.border,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      <Feather name={name} size={size} color={color} />
    </PressableScale>
  );
}
