import { Text, TextProps } from 'react-native';

import { colors, fonts } from '../theme';

interface Props extends TextProps {
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  size?: number;
  color?: string;
  mono?: boolean;
}

/** Text with the app font. React Native needs one font family per weight, so weight picks the family. */
export function T({ weight = 'regular', size = 15, color = colors.ink, mono, style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: mono ? fonts.mono : fonts[weight],
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
