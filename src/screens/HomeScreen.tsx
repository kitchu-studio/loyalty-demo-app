import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import * as api from '../api';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { Screen } from '../components/Screen';
import { pickTarget, StampCard } from '../components/StampCard';
import { T } from '../components/T';
import { formatPoints, formatWhen } from '../format';
import { colors } from '../theme';

export function HomeScreen() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const shop = useQuery({ queryKey: ['shop'], queryFn: api.getShop });
  const me = useQuery({ queryKey: ['me'], queryFn: api.getMe });
  const rewards = useQuery({ queryKey: ['rewards'], queryFn: api.getRewards });
  const history = useQuery({ queryKey: ['history'], queryFn: api.getHistory });

  const [code, setCode] = useState('');
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const claim = useMutation({
    mutationFn: () => api.claimCode(code),
    onSuccess: (res) => {
      setCode('');
      setNotice({ ok: true, text: `ได้รับ ${res.points} แต้ม รวมเป็น ${formatPoints(res.balance)} แต้ม` });
      void queryClient.invalidateQueries({ queryKey: ['me'] });
      void queryClient.invalidateQueries({ queryKey: ['history'] });
    },
    onError: (e) => setNotice({ ok: false, text: api.errorMessage(e) }),
  });

  const refreshing = me.isRefetching || history.isRefetching || rewards.isRefetching;
  const refresh = () => {
    void me.refetch();
    void rewards.refetch();
    void history.refetch();
    void shop.refetch();
  };

  const points = me.data?.points;
  const target = rewards.data ? pickTarget(rewards.data, points ?? 0) : null;
  const perPoint = shop.data?.baht_per_point;

  return (
    <Screen
      title={shop.data?.name ?? 'สะสมแต้ม'}
      right={
        <Button label="ออกจากระบบ" variant="line" onPress={() => void logout()} style={styles.small} />
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.green} />}
      >
        <StampCard name={user?.name || user?.email || ''} points={points} target={target} />
        {me.isError && (
          <T color={colors.alert} style={styles.pad}>
            {api.errorMessage(me.error)}
          </T>
        )}

        <View style={styles.pad}>
          <T weight="semibold" size={17}>
            รับแต้มจากบิลล่าสุด
          </T>
          <T size={14} color={colors.muted}>
            {perPoint
              ? `ทุก ${perPoint} บาทได้ 1 แต้ม หลังชำระเงิน ขอโค้ดจากพนักงานแล้วกรอกที่นี่`
              : 'หลังชำระเงิน ขอโค้ดจากพนักงานแล้วกรอกที่นี่'}
          </T>
          <Field
            label="โค้ดจากพนักงาน"
            value={code}
            onChangeText={(v) => {
              setCode(v.toUpperCase());
              setNotice(null);
            }}
            mono
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={12}
            placeholder="K7P2QM"
          />
          {notice && (
            <T size={14} weight="medium" color={notice.ok ? colors.ok : colors.alert} accessibilityLiveRegion="polite">
              {notice.text}
            </T>
          )}
          <Button
            label="รับแต้ม"
            variant="lime"
            onPress={() => claim.mutate()}
            loading={claim.isPending}
            disabled={code.trim().length < 4}
          />
        </View>

        <View style={styles.pad}>
          <T weight="semibold" size={17}>
            ประวัติแต้ม
          </T>
          {history.data && history.data.length === 0 && (
            <T color={colors.muted}>ยังไม่มีรายการ เริ่มสะสมแต้มจากบิลแรกได้เลย</T>
          )}
          {history.data?.map((e) => (
            <View key={e.id} style={styles.row}>
              <View style={styles.flex}>
                <T weight="medium">{e.note || (e.reason === 'earn' ? 'ได้รับแต้ม' : 'แลกของรางวัล')}</T>
                <T size={13} color={colors.muted}>
                  {formatWhen(e.created_at)}
                </T>
              </View>
              <T weight="bold" size={18} color={e.delta > 0 ? colors.ok : colors.ink}>
                {e.delta > 0 ? '+' : '−'}
                {formatPoints(Math.abs(e.delta))}
              </T>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32, gap: 28 },
  pad: { paddingHorizontal: 20, gap: 10 },
  flex: { flex: 1 },
  small: { minHeight: 36, paddingHorizontal: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    gap: 12,
  },
});
