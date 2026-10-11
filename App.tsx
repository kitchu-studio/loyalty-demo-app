import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { Tabs } from './src/navigation/Tabs';
import { LoginScreen } from './src/screens/LoginScreen';
import { colors } from './src/theme';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 15_000 } },
});

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.line,
    primary: colors.accent,
  },
};

function Splash() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

function Root() {
  const { status } = useAuth();
  if (status === 'loading') return <Splash />;
  if (status === 'out') return <LoginScreen />;
  return (
    <NavigationContainer theme={navTheme}>
      <Tabs />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
