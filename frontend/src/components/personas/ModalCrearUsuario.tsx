import React, { useState } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet, Alert
} from "react-native";
import { api } from "@/config/api";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreado: () => void;
}

const TIPOS = ["estandar", "admin"];

export default function ModalCrearUsuario({ visible, onClose, onCreado }: Props) {
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
      Alert.alert("Error", "Email y Firebase UID son obligatorios");
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
      Alert.alert("Error", e?.response?.data?.error ?? "No se pudo crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Crear usuario</Text>
            <TouchableOpacity onPress={() => { onClose(); resetForm(); }}>
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
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Firebase UID*</Text>
            <TextInput
              value={firebaseUid}
              onChangeText={setFirebaseUid}
              style={styles.input}
              placeholder="UID de Firebase Auth"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Tipo de usuario</Text>
            <View style={styles.tipoRow}>
              {TIPOS.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTipo(t as "estandar" | "admin")}
                  style={[styles.tipoBtn, tipo === t && styles.tipoBtnActivo]}
                >
                  <Text style={tipo === t ? styles.tipoTextoActivo : styles.tipoTexto}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTexto}>
                ℹ️ Se creará una persona mínima con este email y rol voluntario automáticamente.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCrear}
              disabled={loading}
              style={styles.btnCrear}
            >
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.btnCrearTexto}>Crear usuario</Text>
              }
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
    backgroundColor: "#fff7ed",
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
    color: "#111827",
  },
  cerrar: {
    fontSize: 22,
    color: "#6b7280",
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#111827",
    fontSize: 14,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
    color: "#111827",
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
    backgroundColor: "#ffedd5",
  },
  tipoBtnActivo: {
    backgroundColor: "#f97316",
  },
  tipoTexto: {
    color: "#f97316",
    fontWeight: "600",
  },
  tipoTextoActivo: {
    color: "white",
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  infoTexto: {
    color: "#92400e",
    fontSize: 13,
  },
  btnCrear: {
    backgroundColor: "#f97316",
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
