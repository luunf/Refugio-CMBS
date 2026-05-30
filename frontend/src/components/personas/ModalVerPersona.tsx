import React from "react";
import {
  Modal, View, Text, TouchableOpacity,
  ScrollView, StyleSheet
} from "react-native";

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
}

const formatearRol = (nombre: string) => {
  const nombres: Record<string, string> = {
    veterinario: "Veterinario",
    voluntario: "Voluntario",
    adoptante: "Adoptante",
    hogar_transito: "Hogar de tránsito",
    admin: "Admin",
  };
  return nombres[nombre] ?? nombre.charAt(0).toUpperCase() + nombre.slice(1);
};

export default function ModalVerPersona({ visible, persona, onClose }: Props) {
  if (!persona) return null;

  const rolesVisibles = persona.roles.filter((r) => r.nombre !== "voluntario");
  const nombresRoles = rolesVisibles.length > 0
    ? rolesVisibles.map((r) => formatearRol(r.nombre)).join(", ")
    : "Voluntario";

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.rolBadge}>
              <Text style={styles.rolTexto}>{nombresRoles}</Text>
            </View>

            <Campo label="Nombre" valor={persona.nombre} />
            <Campo label="Apellido" valor={persona.apellido} />
            <Campo label="Teléfono" valor={persona.telefono} />
            <Campo label="Dirección" valor={persona.direccion} />
            <Campo label="Email" valor={persona.email} />
          </ScrollView>

          <TouchableOpacity style={styles.btnCerrar} onPress={onClose}>
            <Text style={styles.btnCerrarTexto}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function Campo({ label, valor }: { label: string; valor?: string | null }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.campoLabel}>{label}</Text>
      <View style={styles.campoValorContainer}>
        <Text style={styles.campoValor}>{valor || "—"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container: {
    backgroundColor: "#f97316",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  rolBadge: {
    alignSelf: "flex-end",
    backgroundColor: "#edcf3a",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 20,
    maxWidth: "80%",
  },
  rolTexto: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  campo: {
    marginBottom: 16,
  },
  campoLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginBottom: 4,
    fontWeight: "600",
  },
  campoValorContainer: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  campoValor: {
    color: "white",
    fontSize: 15,
  },
  btnCerrar: {
    marginTop: 16,
    alignItems: "center",
  },
  btnCerrarTexto: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
  },
});