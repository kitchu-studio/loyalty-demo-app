import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { errorMessage } from '../api';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { T } from '../components/T';
import { colors, radius } from '../theme';

export function LoginScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === 'register';
  const canSubmit = email.trim() !== '' && password.length >= (isRegister ? 8 : 1) && !busy;

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <T weight="bold" size={28}>
            {isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </T>
          <T color={colors.subtle} style={styles.lead}>
            {isRegister ? 'สมัครเพื่อสะสมแต้มกับร้าน' : 'ดูแต้มและแลกของรางวัล'}
          </T>

          <View style={styles.form}>
            {isRegister && (
              <Field label="ชื่อ" value={name} onChangeText={setName} autoCapitalize="words" maxLength={100} />
            )}
            <Field
              label="อีเมล"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            <Field
              label={isRegister ? 'รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)' : 'รหัสผ่าน'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            {error && (
              <T size={14} color={colors.danger} accessibilityLiveRegion="polite">
                {error}
              </T>
            )}
            <Button
              label={isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
              onPress={submit}
              loading={busy}
              disabled={!canSubmit}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setMode(isRegister ? 'login' : 'register');
              setError(null);
            }}
            style={styles.switch}
          >
            <T weight="medium" color={colors.accent}>
              {isRegister ? 'มีบัญชีแล้ว เข้าสู่ระบบ' : 'ยังไม่มีบัญชี สมัครสมาชิก'}
            </T>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { padding: 24, paddingTop: 56, flexGrow: 1 },
  lead: { marginTop: 8 },
  form: { marginTop: 28, gap: 16 },
  switch: {
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.control,
  },
});
