import { useRef } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Props = PressableProps & {
  children: React.ReactNode;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

/** Soft scale feedback for premium tap interactions */
export function PressableScale({
  children,
  scaleTo = 0.96,
  style,
  className,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) animateTo(scaleTo);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animateTo(1);
        onPressOut?.(e);
      }}
      {...rest}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]} className={className}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
