import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import * as api from '../api';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { T } from '../components/T';
import { VoucherCard } from '../components/VoucherCard';
import { formatPoints } from '../format';
import { colors, radius } from '../theme';

export function RewardsScreen() {
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: ['me'], queryFn: api.getMe });
  const rewards = useQuery({ queryKey: ['rewards'], queryFn: api.getRewards });
  const vouchers = useQuery({ queryKey: ['redemptions'], queryFn: api.getRedemptions });

  const redeem = useMutation({
    mutationFn: (id: number) => api.redeemReward(id),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: ['me'] });
      void queryClient.invalidateQueries({ queryKey: ['history'] });
      void queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      Alert.alert('แลกสำเร็จ', `โค้ดของคุณคือ ${res.redemption.code}\nแสดงกับพนักงานตอนรับของ`);
    },
    onError: (e) => Alert.alert('แลกไม่สำเร็จ', api.errorMessage(e)),
  });

  const points = me.data?.points ?? 0;
  const active = vouchers.data?.filter((v) => v.status === 'active') ?? [];
  const used = vouchers.data?.filter((v) => v.status === 'used').slice(0, 5) ?? [];
  const refreshing = me.isRefetching || rewards.isRefetching || vouchers.isRefetching;

  function confirm(r: api.Reward) {
    Alert.alert(`แลก ${r.name}`, `ใช้ ${formatPoints(r.cost_points)} แต้ม เหลือ ${formatPoints(points - r.cost_points)} แต้ม`, [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'แลก', onPress: () => redeem.mutate(r.id) },
    ]);
  }

  return (
    <Screen
      title="ของรางวัล"
      right={
        <T weight="semibold">
          {formatPoints(points)} แต้ม
        </T>
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void me.refetch();
              void rewards.refetch();
              void vouchers.refetch();
            }}
            tintColor={colors.accent}
          />
        }
      >
        {active.length > 0 && (
          <View style={styles.section}>
            <T weight="semibold" size={17}>
              คูปองของฉัน
            </T>
            {active.map((v) => (
              <VoucherCard key={v.id} voucher={v} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <T weight="semibold" size={17}>
            ของรางวัล
          </T>
          {rewards.isError && <T color={colors.danger}>{api.errorMessage(rewards.error)}</T>}
          {rewards.data?.map((r) => {
            const missing = r.cost_points - points;
            return (
              <View key={r.id} style={styles.reward}>
                <View style={styles.flex}>
                  <T weight="semibold" size={16}>
                    {r.name}
                  </T>
                  {r.description !== '' && (
                    <T size={13} color={colors.subtle}>
                      {r.description}
                    </T>
                  )}
                  <T weight="bold" size={15} color={colors.accent} style={styles.cost}>
                    {formatPoints(r.cost_points)} แต้ม
                  </T>
                </View>
                {missing > 0 ? (
                  <T size={13} color={colors.subtle} style={styles.missing}>
                    ขาดอีก {formatPoints(missing)}
                  </T>
                ) : (
                  <Button
                    label="แลก"
                    variant="solid"
                    onPress={() => confirm(r)}
                    disabled={redeem.isPending}
                    style={styles.redeem}
                  />
                )}
              </View>
            );
          })}
        </View>

        {used.length > 0 && (
          <View style={styles.section}>
            <T weight="semibold" size={17}>
              ใช้แล้ว
            </T>
            {used.map((v) => (
              <VoucherCard key={v.id} voucher={v} />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 32, gap: 28 },
  section: { gap: 12 },
  flex: { flex: 1 },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
  },
  cost: { marginTop: 4 },
  redeem: { minHeight: 40, paddingHorizontal: 22 },
  missing: { textAlign: 'right' },
});
