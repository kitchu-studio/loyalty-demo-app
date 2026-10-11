import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { colors, radius } from '../theme';
import { T } from './T';

interface Props extends TextInputProps {
  label: string;
  /** For short codes: bigger, centred, letter-spaced. */
  code?: boolean;
}

export function Field({ label, code, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <T weight="medium" size={14} color={colors.subtle}>
        {label}
      </T>
      <TextInput
        {...rest}
        placeholderTextColor="#A8A8B0"
        style={[styles.input, code && styles.code, rest.multiline && styles.multiline, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  code: { fontSize: 20, fontWeight: '600', letterSpacing: 3, textAlign: 'center' },
  multiline: { minHeight: 150, textAlignVertical: 'top', lineHeight: 24 },
});
