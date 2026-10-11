import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';

interface Props {
  /** Colour of the card the line sits on, used for the dashes. */
  line: string;
  /** Colour of the screen behind the card: the half-circles cut into the edges use it. */
  cut?: string;
  size?: number;
}

/** A dashed tear line with a half-circle bitten out of each edge, like a ticket stub. */
export function Perforation({ line, cut = colors.paper, size = 22 }: Props) {
  return (
    <View style={[styles.row, { height: size }]}>
      <View style={[styles.notch, { width: size, height: size, borderRadius: size / 2, left: -size / 2, backgroundColor: cut }]} />
      <View style={[styles.dash, { borderColor: line }]} />
      <View style={[styles.notch, { width: size, height: size, borderRadius: size / 2, right: -size / 2, backgroundColor: cut }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { justifyContent: 'center' },
  notch: { position: 'absolute', top: 0 },
  dash: {
    marginHorizontal: 16,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
  },
});
