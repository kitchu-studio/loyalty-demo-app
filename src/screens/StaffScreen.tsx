import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { KeyboardAvoidingView, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import * as api from '../api';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { Screen } from '../components/Screen';
import { T } from '../components/T';
import { formatPoints, formatWhen } from '../format';
import { colors, radius } from '../theme';

export function StaffScreen() {
  const queryClient = useQueryClient();
  const summary = useQuery({ queryKey: ['summary'], queryFn: api.getSummary });
  const shop = useQuery({ queryKey: ['shop'], queryFn: api.getShop });

  // --- issue a points code ---
  const [amount, setAmount] = useState('');
  const [issued, setIssued] = useState<api.EarnCode | null>(null);
  const [issueError, setIssueError] = useState<string | null>(null);
  const issue = useMutation({
    mutationFn: () => api.createEarnCode(Number.parseInt(amount, 10)),
    onSuccess: (res) => {
      setIssued(res);
      setIssueError(null);
      setAmount('');
      void queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: (e) => {
      setIssued(null);
      setIssueError(api.errorMessage(e));
    },
  });

  // --- check and hand over a voucher ---
  const [voucherCode, setVoucherCode] = useState('');
  const [voucher, setVoucher] = useState<api.Redemption | null>(null);
  const [voucherNote, setVoucherNote] = useState<{ ok: boolean; text: string } | null>(null);
  const lookup = useMutation({
    mutationFn: () => api.lookupVoucher(voucherCode.trim().toUpperCase()),
    onSuccess: (v) => {
      setVoucher(v);
      setVoucherNote(null);
    },
    onError: (e) => {
      setVoucher(null);
      setVoucherNote({ ok: false, text: api.errorMessage(e) });
    },
  });
  const handOver = useMutation({
    mutationFn: (code: string) => api.useVoucher(code),
    onSuccess: (v) => {
      setVoucher(v);
      setVoucherNote({ ok: true, text: 'ยืนยันส่งมอบแล้ว' });
      void queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: (e) => setVoucherNote({ ok: false, text: api.errorMessage(e) }),
  });

  // --- what the assistant knows ---
  const [aboutDraft, setAboutDraft] = useState<string | null>(null);
  const about = aboutDraft ?? shop.data?.about ?? '';
  const [aboutSaved, setAboutSaved] = useState(false);
  const saveAbout = useMutation({
    mutationFn: () => api.saveAbout(about),
    onSuccess: () => {
      setAboutSaved(true);
      void queryClient.invalidateQueries({ queryKey: ['shop'] });
    },
  });

  const amountValue = Number.parseInt(amount, 10);
  const s = summary.data;

  return (
    <Screen title="หน้าร้าน">
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={summary.isRefetching}
              onRefresh={() => void summary.refetch()}
              tintColor={colors.accent}
            />
          }
        >
          <View style={styles.stats}>
            <Stat label="สมาชิก" value={s ? formatPoints(s.members) : '–'} />
            <Stat label="แต้มที่แจก" value={s ? formatPoints(s.points_issued) : '–'} />
            <Stat label="คูปองค้าง" value={s ? formatPoints(s.active_vouchers) : '–'} last />
          </View>

          <View style={styles.section}>
            <T weight="semibold" size={17}>
              ออกโค้ดแต้ม
            </T>
            <T size={14} color={colors.subtle}>
              ใส่ยอดบิลที่ลูกค้าจ่ายแล้ว ระบบสร้างโค้ดให้ลูกค้ากรอกในแอป
            </T>
            <Field
              label="ยอดบิล (บาท)"
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="250"
            />
            {issueError && <T color={colors.danger}>{issueError}</T>}
            <Button
              label="ออกโค้ด"
              onPress={() => issue.mutate()}
              loading={issue.isPending}
              disabled={!Number.isFinite(amountValue) || amountValue < 1}
            />
            {issued && (
              <View style={styles.result}>
                <T size={13} color={colors.subtle}>
                  ให้ลูกค้ากรอกโค้ดนี้ ได้ {issued.points} แต้ม
                </T>
                <T weight="bold" size={34} style={styles.code}>
                  {issued.code}
                </T>
                <T size={13} color={colors.subtle}>
                  ใช้ได้ครั้งเดียว หมดอายุ {formatWhen(issued.expires_at)}
                </T>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <T weight="semibold" size={17}>
              ตรวจคูปอง
            </T>
            <Field
              label="โค้ดคูปอง"
              value={voucherCode}
              onChangeText={(v) => {
                setVoucherCode(v.toUpperCase());
                setVoucher(null);
                setVoucherNote(null);
              }}
              code
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={12}
              placeholder="VK7P2QM"
            />
            <Button
              label="ตรวจคูปอง"
              variant="line"
              onPress={() => lookup.mutate()}
              loading={lookup.isPending}
              disabled={voucherCode.trim().length < 4}
            />
            {voucher && (
              <View style={styles.found}>
                <T weight="semibold" size={17}>
                  {voucher.reward_name}
                </T>
                <T color={colors.subtle}>ของ {voucher.customer_name || 'สมาชิก'}</T>
                {voucher.status === 'active' ? (
                  <Button
                    label="ส่งมอบแล้ว"
                    variant="solid"
                    onPress={() => handOver.mutate(voucher.code)}
                    loading={handOver.isPending}
                    style={styles.gap}
                  />
                ) : (
                  <T weight="medium" color={colors.danger}>
                    ใช้แล้ว{voucher.used_at ? ` เมื่อ ${formatWhen(voucher.used_at)}` : ''}
                  </T>
                )}
              </View>
            )}
            {voucherNote && (
              <T weight="medium" color={voucherNote.ok ? colors.ok : colors.danger}>
                {voucherNote.text}
              </T>
            )}
          </View>

          <View style={styles.section}>
            <T weight="semibold" size={17}>
              ข้อมูลร้านสำหรับ AI
            </T>
            <T size={14} color={colors.subtle}>
              AI ตอบลูกค้าจากข้อความนี้เท่านั้น ใส่เวลาเปิดปิด ที่อยู่ เมนู โปรโมชัน
            </T>
            <Field
              label="ข้อมูลร้าน"
              value={about}
              onChangeText={(v) => {
                setAboutDraft(v);
                setAboutSaved(false);
              }}
              multiline
              maxLength={2000}
            />
            {saveAbout.isError && <T color={colors.danger}>{api.errorMessage(saveAbout.error)}</T>}
            {aboutSaved && <T color={colors.ok} weight="medium">บันทึกแล้ว</T>}
            <Button
              label="บันทึกข้อมูลร้าน"
              onPress={() => saveAbout.mutate()}
              loading={saveAbout.isPending}
              disabled={aboutDraft === null}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Stat({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.stat, !last && styles.statRule]}>
      <T weight="bold" size={26}>
        {value}
      </T>
      <T size={13} color={colors.subtle}>
        {label}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 30 },
  stats: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.card,
    paddingVertical: 14,
  },
  stat: { flex: 1, alignItems: 'center' },
  statRule: { borderRightWidth: 1, borderRightColor: colors.line },
  section: { gap: 10 },
  result: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 18,
    alignItems: 'center',
    gap: 2,
  },
  code: { letterSpacing: 6, marginVertical: 4 },
  found: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: 16,
    gap: 2,
  },
  gap: { marginTop: 12 },
});
