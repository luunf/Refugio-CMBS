import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { useTranslation } from "react-i18next";

import { api } from "@/config/api";
import { Colors } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";

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

export default function PersonaRow({
  persona,
  esAdmin,
  onEditar,
  onVer,
  onEliminada,
}: Props) {
  const { t } = useTranslation("personas");

  const formatearRol = (nombre: string) => {
    const nombres: Record<string, string> = {
      veterinario: t("filtroVeterinario"),
      voluntario: t("filtroVoluntario"),
      adoptante: t("filtroAdoptante"),
      hogar_transito: t("filtroHogar"),
    };

    return (
      nombres[nombre] ??
      nombre.charAt(0).toUpperCase() + nombre.slice(1)
    );
  };

  const rolesVisibles = persona.roles.filter(
    (r) => r.nombre !== "voluntario"
  );


  const handleEliminar = () => {
    Alert.alert(
      t("eliminarTitulo"),
      `${persona.nombre} ${persona.apellido}`,
      [
        {
          text: t("cancelar"),
          style: "cancel",
        },
        {
          text: t("eliminar"),
          style: "destructive",
          onPress: async () => {
            try {
              await api.deletePersona(
                persona.id_persona
              );

              onEliminada();
            } catch (e: any) {
              Alert.alert(
                t("error"),
                e?.response?.data?.error ??
                  t("errorEliminar")
              );
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.fila}
      onPress={() => onVer(persona)}
      activeOpacity={0.7}
    >
      {/* DATOS */}

      <View style={styles.info}>
        <Text
          style={styles.nombre}
          numberOfLines={2}
        >
          {persona.nombre} {persona.apellido}
        </Text>

      <View style={styles.rolesContainer}>
        {rolesVisibles.length > 0 ? (
          rolesVisibles.map((r) => (
            <View
              key={r.id_rol}
              style={styles.badge}
            >
              <Text style={styles.badgeText}>
                {formatearRol(r.nombre)}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {t("filtroVoluntario")}
            </Text>
          </View>
        )}
      </View>
      </View>

      {/* EMAIL */}

      <Text
        style={styles.email}
        numberOfLines={1}
      >
        {persona.email ?? "—"}
      </Text>

      {/* ACCIONES */}

      <View style={styles.acciones}>
        <TouchableOpacity
          onPress={handleEliminar}
          style={styles.btnAccion}
        >
          <MaterialIcons
          name="delete-outline"
          size={20}
          color="#ef4444"
        />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onEditar(persona)}
          style={styles.btnAccion}
        >
          <MaterialIcons
          name="edit"
          size={20}
          color={Colors.primary}
        />
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
    borderBottomColor: Colors.borderLight,
  },

  info: {
    flex: 1.4,
  },

  nombre: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  
  rolesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    gap: 4,
  },

  badge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  badgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "600",
  },

  email: {
    flex: 1,
    fontSize: 12,
    color: Colors.textMuted,
    paddingHorizontal: 4,
  },

  acciones: {
    flexDirection: "row",
    gap: 4,
  },

  btnAccion: {
    padding: 6,
  },

});