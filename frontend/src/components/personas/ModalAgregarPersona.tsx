import React, { useState } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet, Alert
} from "react-native";
import { api } from "@/config/api";
import RolSelector from "./RolSelector";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreada: () => void;
}

export default function ModalAgregarPersona({ visible, onClose, onCreada }: Props) {
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

  const handleCrear = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert("Error", "Nombre y apellido son obligatorios");
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
      onClose();
      resetForm();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "No se pudo crear la persona");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Agregar persona</Text>
            <TouchableOpacity onPress={() => { onClose(); resetForm(); }}>
              <Text style={styles.cerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Nombre*</Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Apellido*</Text>
            <TextInput
              value={apellido}
              onChangeText={setApellido}
              style={styles.input}
              placeholder="Apellido"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Rol*</Text>
            <RolSelector
              value={rolIds}
              onChange={setRolIds}
              placeholder="Seleccionar rol"
            />

            <View style={styles.fila}>
              <View style={styles.mitad}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  value={telefono}
                  onChangeText={setTelefono}
                  style={styles.input}
                  placeholder="Teléfono"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>
              <View style={[styles.mitad, { marginLeft: 8 }]}>
                <Text style={styles.label}>Dirección</Text>
                <TextInput
                  value={direccion}
                  onChangeText={setDireccion}
                  style={styles.input}
                  placeholder="Dirección"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="email@ejemplo.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={handleCrear}
              disabled={loading}
              style={styles.btnCrear}
            >
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.btnCrearTexto}>Crear</Text>
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
  fila: {
    flexDirection: "row",
  },
  mitad: {
    flex: 1,
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
