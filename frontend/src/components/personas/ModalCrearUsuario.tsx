import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";

import { api } from "@/config/api";
import { Colors } from "@/constants/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreado: () => void;
}

const TIPOS = ["estandar", "admin"];

export default function ModalCrearUsuario({
  visible,
  onClose,
  onCreado,
}: Props) {
  const { t } = useTranslation("personas");

  const [email, setEmail] = useState("");
  const [firebaseUid, setFirebaseUid] = useState("");
  const [tipo, setTipo] = useState<"estandar" | "admin">("estandar");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail("");
    setFirebaseUid("");
    setTipo("estandar");
  };

  const handleCrear = async () => {
    if (!email.trim() || !firebaseUid.trim()) {
      Alert.alert("Error", t("errorEmailUid"));
      return;
    }

    setLoading(true);

    try {
      await api.createUsuario({
        email: email.trim(),
        firebase_uid: firebaseUid.trim(),
        tipo,
      });

      onCreado();
      onClose();
      resetForm();
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.error ??
          "No se pudo crear el usuario"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.titulo}>
              {t("crearUsuario")}
            </Text>

            <TouchableOpacity
              onPress={() => {
                onClose();
                resetForm();
              }}
            >
              <Text style={styles.cerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Email*</Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="email@ejemplo.com"
              placeholderTextColor={Colors.textFaint}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>
              {t("firebaseUid")}*
            </Text>

            <TextInput
              value={firebaseUid}
              onChangeText={setFirebaseUid}
              style={styles.input}
              placeholder={t("uidPlaceholder")}
              placeholderTextColor={Colors.textFaint}
              autoCapitalize="none"
            />

            <Text style={styles.label}>
              {t("tipoUsuario")}
            </Text>

            <View style={styles.tipoRow}>
              {TIPOS.map((tpo) => (
                <TouchableOpacity
                  key={tpo}
                  onPress={() =>
                    setTipo(
                      tpo as "estandar" | "admin"
                    )
                  }
                  style={[
                    styles.tipoBtn,
                    tipo === tpo &&
                      styles.tipoBtnActivo,
                  ]}
                >
                  <Text
                    style={
                      tipo === tpo
                        ? styles.tipoTextoActivo
                        : styles.tipoTexto
                    }
                  >
                    {t(
                      tpo as
                        | "estandar"
                        | "admin"
                    )}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTexto}>
                {t("infoCrearUsuario")}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCrear}
              disabled={loading}
              style={styles.btnCrear}
            >
              {loading ? (
                <ActivityIndicator
                  color="white"
                />
              ) : (
                <Text style={styles.btnCrearTexto}>
                  {t("crearUsuarioBtn")}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  container: {
    backgroundColor: Colors.primaryFaint,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },

  cerrar: {
    fontSize: 22,
    color: Colors.textMuted,
  },

  label: {
    fontWeight: "600",
    marginBottom: 4,
    color: Colors.text,
    fontSize: 14,
  },

  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
    color: Colors.text,
  },

  tipoRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },

  tipoBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
  },

  tipoBtnActivo: {
    backgroundColor: Colors.primary,
  },

  tipoTexto: {
    color: Colors.primary,
    fontWeight: "600",
  },

  tipoTextoActivo: {
    color: "white",
    fontWeight: "600",
  },

  infoBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },

  infoTexto: {
    color: Colors.textSoft,
    fontSize: 13,
  },

  btnCrear: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },

  btnCrearTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});