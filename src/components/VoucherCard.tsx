import { StyleSheet, View } from 'react-native';

import type { Redemption } from '../api';
import { formatWhen } from '../format';
import { colors, radius } from '../theme';
import { T } from './T';

export function VoucherCard({ voucher }: { voucher: Redemption }) {
  const used = voucher.status === 'used';
  return (
    <View style={[styles.card, used && styles.used]}>
      <T weight="semibold" size={16}>
        {voucher.reward_name}
      </T>
      <T size={13} color={colors.subtle}>
        แลกเมื่อ {formatWhen(voucher.created_at)} ใช้ {voucher.cost_points} แต้ม
      </T>
      {used ? (
        <T size={14} color={colors.subtle} style={styles.gap}>
          ใช้แล้ว{voucher.used_at ? ` ${formatWhen(voucher.used_at)}` : ''}
        </T>
      ) : (
        <View style={[styles.codeBox, styles.gap]}>
          <T weight="bold" size={26} style={styles.code}>
            {voucher.code}
          </T>
          <T size={13} color={colors.subtle}>
            แสดงโค้ดนี้กับพนักงาน
          </T>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 16 },
  used: { opacity: 0.6 },
  gap: { marginTop: 10 },
  codeBox: { backgroundColor: colors.bg, borderRadius: radius.control, alignItems: 'center', paddingVertical: 10 },
  code: { letterSpacing: 4 },
});
