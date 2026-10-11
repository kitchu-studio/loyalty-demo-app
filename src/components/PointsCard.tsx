import { StyleSheet, View } from 'react-native';

import type { Reward } from '../api';
import { formatPoints } from '../format';
import { colors, radius } from '../theme';
import { T } from './T';

/** The reward worth showing progress towards: the cheapest one not yet affordable, else the best affordable one. */
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
  points: number | undefined;
  target: Reward | null;
}

export function PointsCard({ points, target }: Props) {
  const balance = points ?? 0;
  const ready = !!target && balance >= target.cost_points;
  const progress = !target ? 0 : Math.min(1, balance / target.cost_points);

  let hint = 'ยังไม่มีของรางวัลให้แลก';
  if (target) {
    hint = ready
      ? `แลก ${target.name} ได้แล้ว`
      : `อีก ${formatPoints(target.cost_points - balance)} แต้ม แลก ${target.name} ได้`;
  }

  return (
    <View style={styles.card}>
      <T size={14} color={colors.subtle}>
        แต้มของคุณ
      </T>
      <T weight="bold" size={44} style={styles.points}>
        {points === undefined ? '–' : formatPoints(balance)}
      </T>
      {target && (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      )}
      <T size={14} color={colors.subtle}>
        {hint}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    marginHorizontal: 20,
    padding: 18,
    gap: 4,
  },
  points: { lineHeight: 56 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.line, marginVertical: 8, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.accent },
});
