import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import type { Reward } from '../api';
import { formatPoints } from '../format';
import { colors, radius } from '../theme';
import { Perforation } from './Perforation';
import { T } from './T';

const STAMPS = 10;

/** The reward worth showing progress towards: the best one already affordable, else the nearest one. */
export function pickTarget(rewards: Reward[], points: number): Reward | null {
  let affordable: Reward | null = null;
  let nearest: Reward | null = null;
  for (const r of rewards) {
    if (r.cost_points <= points) {
      if (!affordable || r.cost_points > affordable.cost_points) affordable = r;
    } else if (!nearest || r.cost_points < nearest.cost_points) {
      nearest = r;
    }
  }
  return nearest ?? affordable;
}

interface Props {
  name: string;
  points: number | undefined;
  target: Reward | null;
}

export function StampCard({ name, points, target }: Props) {
  const balance = points ?? 0;
  const ready = !!target && balance >= target.cost_points;
  const filled = !target ? 0 : ready ? STAMPS : Math.floor((balance / target.cost_points) * STAMPS);

  let hint = 'ยังไม่มีของรางวัลให้แลก';
  if (target) {
    hint = ready
      ? `แลก “${target.name}” ได้เลย`
      : `อีก ${formatPoints(target.cost_points - balance)} แต้ม แลก “${target.name}”`;
  }

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <T weight="medium" size={14} color={colors.lime}>
          {name || 'สมาชิก'}
        </T>
        <T weight="regular" size={13} color="rgba(255,255,255,0.65)">
          แต้มสะสม
        </T>
        <T weight="bold" size={64} color={colors.white} style={styles.points}>
          {points === undefined ? '–' : formatPoints(balance)}
        </T>
      </View>

      <Perforation line="rgba(255,255,255,0.28)" />

      <View style={styles.bottom}>
        <View style={styles.grid}>
          {Array.from({ length: STAMPS }, (_, i) => (
            <View key={i} style={[styles.hole, i < filled && styles.stamped]}>
              {i < filled && <Ionicons name="checkmark" size={20} color={colors.ink} />}
            </View>
          ))}
        </View>
        <T size={14} color="rgba(255,255,255,0.85)" style={styles.hint}>
          {hint}
        </T>
      </View>
    </View>
  );
}

const HOLE = 44;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.green,
    borderRadius: radius.card,
    marginHorizontal: 20,
  },
  top: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 4 },
  points: { marginTop: -2 },
  bottom: { paddingHorizontal: 22, paddingTop: 6, paddingBottom: 22, gap: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  hole: {
    width: HOLE,
    height: HOLE,
    borderRadius: HOLE / 2,
    backgroundColor: colors.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  stamped: { backgroundColor: colors.lime, borderColor: colors.lime },
  hint: { textAlign: 'left' },
});
