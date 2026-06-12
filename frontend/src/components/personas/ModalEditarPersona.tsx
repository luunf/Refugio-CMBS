import React, { useState, useEffect } from "react";
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

interface Persona {
  id_persona: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  roles: { id_rol: number; nombre: string }[];
}

interface Props {
  visible: boolean;
  persona: Persona | null;
  onClose: () => void;
  onActualizada: () => void;
}

export default function ModalEditarPersona({
  visible,
  persona,
  onClose,
  onActualizada,
}: Props) {
  const { t } = useTranslation("personas");

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [rolIds, setRolIds] = useState<number[]>([]);
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!persona) return;

    setNombre(persona.nombre ?? "");
    setApellido(persona.apellido ?? "");
    setTelefono(persona.telefono ?? "");
    setDireccion(persona.direccion ?? "");
    setEmail(persona.email ?? "");

    setRolIds(
      persona.roles
        ?.filter((r) => r.nombre !== "voluntario")
        .map((r) => r.id_rol) ?? []
    );
  }, [persona]);

  const handleEditar = async () => {
    if (!persona) return;

    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert(
        t("error"),
        t("nombreApellidoObligatorios")
      );
      return;
    }

    setLoading(true);

    try {
      await api.updatePersona(persona.id_persona, {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim() || null,
        direccion: direccion.trim() || null,
        roles: rolIds,
      });

      onActualizada();
      onClose();
    } catch (e: any) {
      Alert.alert(
        t("error"),
        e?.response?.data?.error ??
          t("errorActualizarPersona")
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
              {t("editar")}
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>
              {t("nombre")}*
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
              {t("apellido")}*
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
              excluir={["voluntario"]}
              placeholder={t(
                "seleccionarRol"
              )}
            />

            <Text style={styles.label}>
              {t("telefono")}
            </Text>

            <TextInput
              value={telefono}
              onChangeText={setTelefono}
              style={styles.input}
              keyboardType="phone-pad"
              placeholder={t("telefono")}
              placeholderTextColor={
                Colors.textFaint
              }
            />

            <Text style={styles.label}>
              {t("direccion")}
            </Text>

            <TextInput
              value={direccion}
              onChangeText={setDireccion}
              style={styles.input}
              placeholder={t("direccion")}
              placeholderTextColor={
                Colors.textFaint
              }
            />

            <Text style={styles.label}>
              {t("email")}
            </Text>

            <TextInput
              value={email}
              editable={false}
              style={[
                styles.input,
                styles.inputDisabled,
              ]}
              placeholderTextColor={
                Colors.textFaint
              }
            />

            <TouchableOpacity
              onPress={handleEditar}
              disabled={loading}
              style={styles.btnEditar}
            >
              {loading ? (
                <ActivityIndicator
                  color={Colors.surface}
                />
              ) : (
                <Text
                  style={
                    styles.btnEditarTexto
                  }
                >
                  {t("guardar")}
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

  inputDisabled: {
    backgroundColor:
      Colors.background,
    color: Colors.textMuted,
  },

  btnEditar: {
    backgroundColor:
      Colors.primary,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },

  btnEditarTexto: {
    color: Colors.surface,
    fontWeight: "bold",
    fontSize: 16,
  },
});