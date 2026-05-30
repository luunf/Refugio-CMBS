import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="personas" />
          <Stack.Screen name="calendario" />
          {/* Sacar estas tres hasta que las crees: */}
          {/* <Stack.Screen name="usuarios" /> */}
          {/* <Stack.Screen name="animales" /> */}
          {/* <Stack.Screen name="tratamientos" /> */}
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}