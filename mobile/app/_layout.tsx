import { Stack } from 'expo-router';
import { AuthProvider } from '../src/lib/auth-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/login" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth/register" options={{ presentation: 'modal' }} />
        <Stack.Screen name="tracks/[id]" options={{ headerShown: true, title: 'Track Detail' }} />
        <Stack.Screen name="record/select-track" options={{ headerShown: true, title: 'Select Track' }} />
        <Stack.Screen name="record/recording" options={{ headerShown: true, title: 'Record Story' }} />
        <Stack.Screen name="admin/moderation" options={{ headerShown: true, title: 'Moderation' }} />
        <Stack.Screen name="admin/partners" options={{ headerShown: true, title: 'Partners' }} />
      </Stack>
    </AuthProvider>
  );
}
