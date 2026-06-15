import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "@/config/firebase";
import { Colors } from "@/constants/theme";

import { router } from "expo-router";

export default function LoginScreen() {
  const { t } = useTranslation("auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert(
        t("error"),
        t("emailObligatorio")
      );
      return;
    }

    if (!password.trim()) {
      Alert.alert(
        t("error"),
        t("passwordObligatoria")
      );
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      router.replace("/(tabs)");

    } catch (e: any) {
      Alert.alert(
        t("error"),
        t("credencialesInvalidas")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          {t("iniciarSesion")}
        </Text>

        <Text style={styles.label}>
          {t("email")}
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t("emailPlaceholder")}
          placeholderTextColor={
            Colors.textMuted
          }
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <Text style={styles.label}>
          {t("password")}
        </Text>

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder={t("passwordPlaceholder")}
          placeholderTextColor={
            Colors.textMuted
          }
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator
              color="white"
            />
          ) : (
            <Text style={styles.buttonText}>
              {t("ingresar")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },

  logo: {
    width: 120,
    height: 120,
  },

  card: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  title: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 28,
    textAlign: "center",
  },

  label: {
    color: "white",
    fontWeight: "600",
    marginBottom: 6,
    fontSize: 15,
  },

  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    color: Colors.text,
  },

  button: {
    backgroundColor: "white",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },

  buttonText: {
    color: Colors.text,
    fontWeight: "bold",
    fontSize: 18,
  },
});