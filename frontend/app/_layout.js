import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// Mantém o splash screen visível enquanto carregamos recursos
// IMPORTANTE: Deve ser chamado no escopo global, antes de qualquer renderização
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
