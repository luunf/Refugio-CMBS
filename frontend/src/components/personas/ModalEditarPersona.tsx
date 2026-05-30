import React, { useState, useEffect } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet, Alert
} from "react-native";
import { api } from "@/config/api";
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

export default function ModalEditarPersona({ visible, persona, onClose, onActualizada }: Props) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [rolIds, setRolIds] = useState<number[]>([]);
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (persona) {
      setNombre(persona.nombre ?? "");
      setApellido(persona.apellido ?? "");
      setTelefono(persona.telefono ?? "");
      setDireccion(persona.direccion ?? "");
      setEmail(persona.email ?? "");
      // primer rol no-voluntario
      const rolNoVoluntario = persona.roles.find((r) => r.nombre !== "voluntario");
      setRolIds(rolNoVoluntario ? [rolNoVoluntario.id_rol] : []);
    }
  }, [persona]);

  const handleEditar = async () => {
    if (!persona) return;
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert("Error", "Nombre y apellido son obligatorios");
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
      Alert.alert("Error", e?.response?.data?.error ?? "No se pudo actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Editar persona</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Nombre*</Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Apellido*</Text>
            <TextInput
              value={apellido}
              onChangeText={setApellido}
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Rol</Text>
            <RolSelector
              value={rolIds}
              onChange={setRolIds}
              placeholder="Seleccionar rol"
            />

            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              value={telefono}
              onChangeText={setTelefono}
              style={styles.input}
              keyboardType="phone-pad"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Dirección</Text>
            <TextInput
              value={direccion}
              onChangeText={setDireccion}
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9ca3af"
            />

            <TouchableOpacity
              onPress={handleEditar}
              disabled={loading}
              style={styles.btnEditar}
            >
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.btnEditarTexto}>Editar</Text>
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
  btnEditar: {
    backgroundColor: "#f97316",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  btnEditarTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
