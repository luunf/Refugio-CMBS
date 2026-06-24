import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
} from "expo-router";

import { useColorScheme } from "react-native";

import {
  AuthProvider,
  useAuth,
} from "@/context/AuthContext";

import { useNotifications } from "@/hooks/useNotifications";

import "@/i18n";

function AppContent() {
  const colorScheme = useColorScheme();

  const { usuario } = useAuth();

  useNotifications(
    !!usuario
  );

  return (
    <ThemeProvider
      value={
        colorScheme === "dark"
          ? DarkTheme
          : DefaultTheme
      }
    >
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />

        <Stack.Screen name="login" />

        <Stack.Screen name="(tabs)" />

        <Stack.Screen name="animales" />

        <Stack.Screen name="personas" />

        <Stack.Screen name="usuarios" />

        <Stack.Screen name="calendario" />

        <Stack.Screen name="tratamientos" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}