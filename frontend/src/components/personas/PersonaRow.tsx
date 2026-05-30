import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { api } from "@/config/api";

interface Persona {
  id_persona: number;
  nombre: string;
  apellido: string;
  email?: string;
  roles: { id_rol: number; nombre: string }[];
}

interface Props {
  persona: Persona;
  esAdmin: boolean;
  onEditar: (persona: Persona) => void;
  onVer: (persona: Persona) => void;
  onEliminada: () => void;
}

const ROL_COLORES: Record<string, string> = {
  veterinario: "#ed763a",
  voluntario: "#ed763a",
  adoptante: "#ed763a",
  hogar_transito: "#ed763a",
};

const formatearRol = (nombre: string) => {
  const nombres: Record<string, string> = {
    veterinario: "Veterinario",
    voluntario: "Voluntario",
    adoptante: "Adoptante",
    hogar_transito: "Hogar de tránsito",
  };
  return nombres[nombre] ?? nombre.charAt(0).toUpperCase() + nombre.slice(1);
};

export default function PersonaRow({
  persona, esAdmin, onEditar, onVer,onEliminada
}: Props) {
  const rolesVisibles = persona.roles.filter((r) => r.nombre !== "voluntario");
  const nombresRoles = rolesVisibles.length > 0
    ? rolesVisibles.map((r) => formatearRol(r.nombre)).join(", ")
    : "Voluntario";
  const colorRol = rolesVisibles.length > 0
    ? (ROL_COLORES[rolesVisibles[0].nombre] ?? "#6b7280")
    : "#f97316";

  const handleEliminar = () => {
    Alert.alert(
      "Eliminar persona",
      `¿Eliminar a ${persona.nombre} ${persona.apellido}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deletePersona(persona.id_persona);
              onEliminada();
            } catch (e: any) {
              Alert.alert("Error", e?.response?.data?.error ?? "No se pudo eliminar");
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.fila} onPress={() => onVer(persona)} activeOpacity={0.7}>
      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.nombre} numberOfLines={2}>{persona.nombre} {persona.apellido}</Text>
        <Text style={[styles.rol, { color: colorRol }]} numberOfLines={0}>
          {nombresRoles}
        </Text>
      </View>

      {/* Email */}
      <Text style={styles.email} numberOfLines={1}>
        {persona.email ?? "—"}
      </Text>

      {/* Acciones */}
      <View style={styles.acciones}>
        <TouchableOpacity onPress={handleEliminar} style={styles.btnAccion}>
          <Text style={styles.iconoAccion}>🗑</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onEditar(persona)} style={styles.btnAccion}>
          <Text style={styles.iconoAccion}>✏️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  info: {
    width: 130,
  },
  nombre: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  rol: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
    flexWrap: "wrap",
  },
  email: {
    flex: 1,
    fontSize: 12,
    color: "#6b7280",
    paddingHorizontal: 4,
  },
  acciones: {
    flexDirection: "row",
    gap: 4,
  },
  btnAccion: {
    padding: 6,
  },
  iconoAccion: {
    fontSize: 16,
  },
});