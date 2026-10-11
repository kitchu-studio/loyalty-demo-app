import { Text, TextProps, TextStyle } from 'react-native';

import { colors } from '../theme';

interface Props extends TextProps {
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  size?: number;
  color?: string;
}

const WEIGHTS: Record<NonNullable<Props['weight']>, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

/** Text in the system font, so Thai renders with the platform's own typeface. */
export function T({ weight = 'regular', size = 15, color = colors.text, style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[
        {
          fontWeight: WEIGHTS[weight],
          fontSize: size,
          color,
          // Thai vowels and tone marks stack above and below the line and get clipped without room.
          lineHeight: Math.round(size * 1.5),
        },
        style,
      ]}
    />
  );
}
