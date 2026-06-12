import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

import { useTranslation } from "react-i18next";

import { Colors } from "@/constants/theme";

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

export default function ModalVerPersona({
  visible,
  persona,
  onClose,
}: Props) {
  const { t } = useTranslation("personas");

  if (!persona) return null;

  const formatearRol = (nombre: string) => {
    const nombres: Record<string, string> = {
      veterinario: t("filtroVeterinario"),
      voluntario: t("filtroVoluntario"),
      adoptante: t("filtroAdoptante"),
      hogar_transito: t("filtroHogar"),
      admin: "Admin",
    };

    return (
      nombres[nombre] ??
      nombre.charAt(0).toUpperCase() + nombre.slice(1)
    );
  };

  const rolesVisibles = persona.roles.filter(
    (r) => r.nombre !== "voluntario"
  );

  const nombresRoles =
    rolesVisibles.length > 0
      ? rolesVisibles
          .map((r) => formatearRol(r.nombre))
          .join(", ")
      : t("filtroVoluntario");

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.rolesContainer}>
              {rolesVisibles.length > 0 ? (
                rolesVisibles.map((rol) => (
                  <View
                    key={rol.id_rol}
                    style={styles.rolBadge}
                  >
                    <Text style={styles.rolTexto}>
                      {formatearRol(rol.nombre)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.rolBadge}>
                  <Text style={styles.rolTexto}>
                    Voluntario
                  </Text>
                </View>
              )}
            </View>

            <Campo
              label={t("nombre")}
              valor={persona.nombre}
            />

            <Campo
              label={t("apellido")}
              valor={persona.apellido}
            />

            <Campo
              label={t("telefono")}
              valor={persona.telefono}
            />

            <Campo
              label={t("direccion")}
              valor={persona.direccion}
            />

            <Campo
              label={t("email")}
              valor={persona.email}
            />
          </ScrollView>

          <TouchableOpacity
            style={styles.btnCerrar}
            onPress={onClose}
          >
            <Text style={styles.btnCerrarTexto}>
              {t("cerrar")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function Campo({
  label,
  valor,
}: {
  label: string;
  valor?: string | null;
}) {
  return (
    <View style={styles.campo}>
      <Text style={styles.campoLabel}>
        {label}
      </Text>

      <View style={styles.campoValorContainer}>
        <Text style={styles.campoValor}>
          {valor || "—"}
        </Text>
      </View>
    </View>
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
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },

  rolBadge: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  rolTexto: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 13,
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
    backgroundColor:
      "rgba(255,255,255,0.25)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  campoValor: {
    color: Colors.surface,
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

  rolesContainer: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 20,
},
});