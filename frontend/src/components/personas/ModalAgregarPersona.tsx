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
import RolSelector from "./RolSelector";
import { isEmailValid, isPhoneValid } from "@/utils/validators";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreada: () => void;
}

export default function ModalAgregarPersona({
  visible,
  onClose,
  onCreada,
}: Props) {
  const { t } = useTranslation("personas");

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [rolIds, setRolIds] = useState<number[]>([]);
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setNombre("");
    setApellido("");
    setRolIds([]);
    setTelefono("");
    setDireccion("");
    setEmail("");
  };

  const cerrarModal = () => {
    resetForm();
    onClose();
  };

  const handleCrear = async () => {
    if (!nombre.trim()) {
      Alert.alert(
        t("error"),
        t("nombreObligatorio")
      );
      return;
    }

    if (nombre.trim().length < 2) {
      Alert.alert(
        t("error"),
        t("nombreInvalido")
      );
      return;
    }

    if (!apellido.trim()) {
      Alert.alert(
        t("error"),
        t("apellidoObligatorio")
      );
      return;
    }

    if (apellido.trim().length < 2) {
      Alert.alert(
        t("error"),
        t("apellidoInvalido")
      );
      return;
    }

    if (rolIds.length === 0) {
      Alert.alert(
        t("error"),
        t("rolObligatorio")
      );
      return;
    }
    if (
      email.trim() &&
      !isEmailValid(email)
    ) {
      Alert.alert(
        t("error"),
        t("emailInvalido")
      );
      return;
    }

    if (
      telefono.trim() &&
      !isPhoneValid(telefono)
    ) {
      Alert.alert(
        t("error"),
        t("telefonoInvalido")
      );
      return;
    }

    setLoading(true);

    try {
      await api.createPersona({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim() || null,
        direccion: direccion.trim() || null,
        email: email.trim() || null,
        roles: rolIds,
      });

      onCreada();
      cerrarModal();
    } catch (e: any) {
      Alert.alert(
        t("error"),
        e?.response?.data?.error ??
          t("errorCrearPersona")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.titulo}>
              {t("agregar")}
            </Text>

            <TouchableOpacity
              onPress={cerrarModal}
            >
              <Text style={styles.cerrar}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>
              {t("nombre")}
            </Text>

            <TextInput
              value={nombre}
              onChangeText={setNombre}
              style={styles.input}
              placeholder={t("nombre")}
              placeholderTextColor={
                Colors.textFaint
              }
            />

            <Text style={styles.label}>
              {t("apellido")}
            </Text>

            <TextInput
              value={apellido}
              onChangeText={setApellido}
              style={styles.input}
              placeholder={t("apellido")}
              placeholderTextColor={
                Colors.textFaint
              }
            />

            <Text style={styles.label}>
              {t("rol")}
            </Text>

            <RolSelector
              value={rolIds}
              onChange={setRolIds}
              placeholder={t(
                "seleccionarRol"
              )}
            />

            <View style={styles.fila}>
              <View style={styles.mitad}>
                <Text style={styles.label}>
                  {t("telefono")}
                </Text>

                <TextInput
                  value={telefono}
                  onChangeText={setTelefono}
                  style={styles.input}
                  placeholder={t(
                    "telefono"
                  )}
                  placeholderTextColor={
                    Colors.textFaint
                  }
                  keyboardType="phone-pad"
                />
              </View>

              <View
                style={[
                  styles.mitad,
                  { marginLeft: 8 },
                ]}
              >
                <Text style={styles.label}>
                  {t("direccion")}
                </Text>

                <TextInput
                  value={direccion}
                  onChangeText={setDireccion}
                  style={styles.input}
                  placeholder={t(
                    "direccion"
                  )}
                  placeholderTextColor={
                    Colors.textFaint
                  }
                />
              </View>
            </View>

            <Text style={styles.label}>
              {t("email")}
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="email@ejemplo.com"
              placeholderTextColor={
                Colors.textFaint
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={handleCrear}
              disabled={loading}
              style={styles.btnCrear}
            >
              {loading ? (
                <ActivityIndicator
                  color={Colors.surface}
                />
              ) : (
                <Text
                  style={
                    styles.btnCrearTexto
                  }
                >
                  {t("crear")}
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
    backgroundColor:
      "rgba(0,0,0,0.4)",
  },

  container: {
    backgroundColor:
      Colors.primaryFaint,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },

  header: {
    flexDirection: "row",
    justifyContent:
      "space-between",
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
    backgroundColor:
      Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
    color: Colors.text,
  },

  fila: {
    flexDirection: "row",
  },

  mitad: {
    flex: 1,
  },

  btnCrear: {
    backgroundColor:
      Colors.primary,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },

  btnCrearTexto: {
    color: Colors.surface,
    fontWeight: "bold",
    fontSize: 16,
  },
});