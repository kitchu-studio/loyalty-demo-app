import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import * as api from '../api';
import { Screen } from '../components/Screen';
import { T } from '../components/T';
import { colors, fonts, radius } from '../theme';

interface Msg {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  /** Shown on screen but never sent to the server. */
  local?: boolean;
}

const SUGGESTIONS = ['แต้มของฉันเหลือเท่าไหร่', 'ร้านเปิดกี่โมง', 'แลกอะไรได้บ้าง', 'มีโปรโมชันอะไรบ้าง'];

export function AssistantScreen() {
  const shop = useQuery({ queryKey: ['shop'], queryFn: api.getShop });
  const nextId = useRef(2);
  const scroller = useRef<ScrollView>(null);
  const [text, setText] = useState('');
  const [demo, setDemo] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 1,
      role: 'assistant',
      local: true,
      content: 'สวัสดีค่ะ ถามเรื่องเมนู เวลาเปิด-ปิด โปรโมชัน หรือแต้มของคุณได้เลยนะคะ',
    },
  ]);

  const ask = useMutation({
    mutationFn: (history: api.ChatMessage[]) => api.sendChat(history),
    onSuccess: (res) => {
      setDemo(res.mode !== 'claude');
      setMessages((m) => [...m, { id: nextId.current++, role: 'assistant', content: res.reply }]);
    },
    onError: (e) =>
      setMessages((m) => [...m, { id: nextId.current++, role: 'assistant', local: true, content: api.errorMessage(e) }]),
  });

  function send(raw: string) {
    const content = raw.trim();
    if (!content || ask.isPending) return;
    const next: Msg[] = [...messages, { id: nextId.current++, role: 'user', content }];
    setMessages(next);
    setText('');
    ask.mutate(next.filter((m) => !m.local).map(({ role, content: c }) => ({ role, content: c })));
  }

  const onlyGreeting = messages.length === 1;

  return (
    <Screen title="ถามร้าน">
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          ref={scroller}
          style={styles.flex}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}
        >
          <T size={13} color={colors.muted}>
            ผู้ช่วยของ {shop.data?.name ?? 'ร้าน'} ตอบจากข้อมูลที่ร้านตั้งไว้ ถ้าไม่แน่ใจจะให้ถามพนักงาน
          </T>

          {messages.map((m) =>
            m.role === 'user' ? (
              <View key={m.id} style={styles.mine}>
                <T color={colors.white}>{m.content}</T>
              </View>
            ) : (
              <View key={m.id} style={styles.theirs}>
                <T>{m.content}</T>
              </View>
            ),
          )}
          {ask.isPending && (
            <View style={styles.theirs}>
              <T color={colors.muted}>กำลังพิมพ์…</T>
            </View>
          )}

          {onlyGreeting && (
            <View style={styles.chips}>
              {SUGGESTIONS.map((s) => (
                <Pressable key={s} accessibilityRole="button" onPress={() => send(s)} style={styles.chip}>
                  <T size={14} weight="medium" color={colors.green}>
                    {s}
                  </T>
                </Pressable>
              ))}
            </View>
          )}
          {demo && (
            <T size={12} color={colors.muted}>
              โหมดตัวอย่าง: ตอบจากกฎง่าย ๆ ยังไม่ได้เชื่อมต่อ AI จริง
            </T>
          )}
        </ScrollView>

        <View style={styles.bar}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="พิมพ์คำถาม"
            placeholderTextColor={colors.muted}
            style={styles.input}
            multiline
            maxLength={500}
            onSubmitEditing={() => send(text)}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="ส่งข้อความ"
            onPress={() => send(text)}
            disabled={!text.trim() || ask.isPending}
            style={[styles.send, (!text.trim() || ask.isPending) && styles.sendOff]}
          >
            <Ionicons name="arrow-up" size={22} color={colors.ink} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingHorizontal: 20, paddingBottom: 16, gap: 10 },
  mine: {
    alignSelf: 'flex-end',
    maxWidth: '82%',
    backgroundColor: colors.green,
    borderRadius: radius.card,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  theirs: {
    alignSelf: 'flex-start',
    maxWidth: '86%',
    backgroundColor: colors.white,
    borderRadius: radius.card,
    borderBottomLeftRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: colors.lime,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chips: { gap: 8, alignItems: 'flex-start', marginTop: 4 },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.green,
    borderRadius: radius.control,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.rule,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 44,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.control,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: radius.control,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendOff: { opacity: 0.4 },
});
