import { StyleSheet, View } from 'react-native';

import type { Redemption } from '../api';
import { formatWhen } from '../format';
import { colors, radius } from '../theme';
import { Perforation } from './Perforation';
import { T } from './T';

export function Ticket({ voucher }: { voucher: Redemption }) {
  const used = voucher.status === 'used';
  return (
    <View style={[styles.ticket, used && styles.used]}>
      <View style={styles.top}>
        <T weight="semibold" size={17} style={used && styles.struck}>
          {voucher.reward_name}
        </T>
        <T size={13} color={colors.muted}>
          แลกเมื่อ {formatWhen(voucher.created_at)} · ใช้ {voucher.cost_points} แต้ม
        </T>
      </View>
      <Perforation line={colors.rule} />
      <View style={styles.bottom}>
        {used ? (
          <T weight="medium" size={14} color={colors.muted}>
            ใช้แล้ว{voucher.used_at ? ` ${formatWhen(voucher.used_at)}` : ''}
          </T>
        ) : (
          <>
            <T mono size={30} color={colors.ink} style={styles.code}>
              {voucher.code}
            </T>
            <T size={13} color={colors.muted}>
              แสดงโค้ดนี้ให้พนักงานที่เคาน์เตอร์
            </T>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: { backgroundColor: colors.white, borderRadius: radius.card },
  used: { opacity: 0.6 },
  top: { padding: 18, paddingBottom: 12, gap: 2 },
  bottom: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 18, gap: 2 },
  code: { letterSpacing: 5 },
  struck: { textDecorationLine: 'line-through' },
});
