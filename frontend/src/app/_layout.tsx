import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
} from "expo-router";

import { useColorScheme } from "react-native";

import {
  AuthProvider,
} from "@/context/AuthContext";

import "@/i18n";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
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

          {/* <Stack.Screen name="usuarios" /> */}

          <Stack.Screen name="calendario" />

          <Stack.Screen name="tratamientos" />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}