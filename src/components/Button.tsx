import { ActivityIndicator, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { colors, radius } from '../theme';
import { T } from './T';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'line';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = 'solid', disabled, loading, style }: Props) {
  const inactive = disabled || loading;
  const textColor = variant === 'solid' ? colors.white : colors.accent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        variant === 'solid' ? styles.solid : styles.line,
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
  solid: { backgroundColor: colors.accent },
  line: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  inactive: { opacity: 0.4 },
  pressed: { opacity: 0.85 },
});
