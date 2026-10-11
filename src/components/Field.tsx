import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { colors, fonts, radius } from '../theme';
import { T } from './T';

interface Props extends TextInputProps {
  label: string;
  mono?: boolean;
}

export function Field({ label, mono, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <T weight="medium" size={14} color={colors.muted}>
        {label}
      </T>
      <TextInput
        {...rest}
        placeholderTextColor={colors.rule}
        style={[
          styles.input,
          { fontFamily: mono ? fonts.mono : fonts.regular },
          mono && styles.mono,
          rest.multiline && styles.multiline,
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  input: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.control,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.ink,
  },
  mono: { fontSize: 22, letterSpacing: 4, textAlign: 'center' },
  multiline: { minHeight: 150, textAlignVertical: 'top', lineHeight: 24 },
});
