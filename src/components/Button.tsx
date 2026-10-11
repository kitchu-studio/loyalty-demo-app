import { ActivityIndicator, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { colors, radius } from '../theme';
import { T } from './T';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'line' | 'lime';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'solid', disabled, loading, style }: Props) {
  const inactive = disabled || loading;
  const textColor = variant === 'solid' ? colors.white : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        variant === 'solid' && styles.solid,
        variant === 'line' && styles.line,
        variant === 'lime' && styles.lime,
        inactive && styles.inactive,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <T weight="semibold" size={16} color={textColor}>
          {label}
        </T>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solid: { backgroundColor: colors.ink },
  line: { borderWidth: 1.5, borderColor: colors.ink },
  lime: { backgroundColor: colors.lime },
  inactive: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
});
