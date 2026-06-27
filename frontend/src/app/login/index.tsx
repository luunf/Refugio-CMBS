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
  Modal,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

import { auth } from "@/config/firebase";
import { Colors } from "@/constants/theme";
import { publicApi } from "@/config/api";

import { router } from "expo-router";

export default function LoginScreen() {
  const { t } = useTranslation("auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loadingReset, setLoadingReset] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert(t("error"), t("emailObligatorio"));
      return;
    }

    if (!password.trim()) {
      Alert.alert(t("error"), t("passwordObligatoria"));
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);

      await cred.user.reload();

      if (!cred.user.emailVerified) {
        Alert.alert(t("error"), t("emailNoVerificado"));
        await auth.signOut();
        return;
      }

      router.replace("/(tabs)");
    } catch (e: any) {
      if (e.code === "auth/user-disabled") {
        Alert.alert(t("error"), t("cuentaDeshabilitada"));
      } else {
        Alert.alert(t("error"), t("credencialesInvalidas"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResetModal = () => {
    setResetEmail(email.trim());
    setResetModalVisible(true);
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      Alert.alert(t("error"), t("emailObligatorio"));
      return;
    }

    setLoadingReset(true);

    try {
      // Verifica que el email existe y está verificado en nuestro sistema
      await publicApi.checkEmail(resetEmail.trim());

      // Si pasa, manda el reset
      await sendPasswordResetEmail(auth, resetEmail.trim());

      setResetModalVisible(false);
      setResetEmail("");
      Alert.alert(t("exito"), t("passwordResetOk"));

    } catch (e: any) {
      const status = e?.response?.status;

      if (status === 404) {
        Alert.alert(t("error"), t("emailNoRegistrado"));
      } else if (status === 403) {
        Alert.alert(t("error"), t("emailNoVerificado"));
      } else {
        Alert.alert(t("error"), t("passwordResetError"));
      }
    } finally {
      setLoadingReset(false);
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
          placeholderTextColor={Colors.textMuted}
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
          placeholderTextColor={Colors.textMuted}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {t("ingresar")}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleOpenResetModal}>
          <Text style={styles.forgotText}>
            {t("olvidastePassword")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal restablecer contraseña */}
      <Modal
        visible={resetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {t("restablecerPassword")}
            </Text>

            <Text style={styles.modalSubtitle}>
              {t("restablecerPasswordDescripcion")}
            </Text>

            <TextInput
              value={resetEmail}
              onChangeText={setResetEmail}
              placeholder={t("emailPlaceholder")}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.modalInput}
            />

            <View style={styles.modalBotones}>
              <TouchableOpacity
                onPress={() => {
                  setResetModalVisible(false);
                  setResetEmail("");
                }}
                style={styles.modalBtnCancelar}
              >
                <Text style={styles.modalBtnCancelarTexto}>
                  {t("cancelar")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={loadingReset}
                style={styles.modalBtnEnviar}
              >
                {loadingReset ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalBtnEnviarTexto}>
                    {t("enviar")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

  forgotText: {
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },

  modalSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },

  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    color: Colors.text,
    fontSize: 14,
  },

  modalBotones: {
    flexDirection: "row",
    gap: 12,
  },

  modalBtnCancelar: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: Colors.borderLight,
  },

  modalBtnCancelarTexto: {
    color: Colors.textSoft,
    fontWeight: "600",
    fontSize: 15,
  },

  modalBtnEnviar: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: 20,
    alignItems: "center",
  },

  modalBtnEnviarTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
});
