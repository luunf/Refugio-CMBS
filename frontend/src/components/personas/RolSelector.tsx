import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";

import { api } from "@/config/api";
import { Colors } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";

interface Rol {
  id_rol: number;
  nombre: string;
}

interface Props {
  value: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  excluir?: string[];
}

export default function RolSelector({
  value,
  onChange,
  placeholder,
  excluir = [],
}: Props) {
  const { t } = useTranslation("personas");

  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);

      try {
        const data = await api.getRoles();

        setRoles(
          data.filter((r: Rol) => !excluir.includes(r.nombre))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const toggleRol = (rol: Rol) => {

    if (value.includes(rol.id_rol)) {
      onChange(
        value.filter(
          (v) => v !== rol.id_rol
        )
      );
    } else {
      onChange([
        ...value,
        rol.id_rol,
      ]);
    }
  };

  const etiqueta =
    value.length === 0
      ? placeholder ?? t("seleccionarRoles")
      : roles
          .filter((r) => value.includes(r.id_rol))
          .map(
            (r) =>
              r.nombre.charAt(0).toUpperCase() +
              r.nombre.slice(1)
          )
          .join(", ");

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={Colors.primary}
          />
        ) : (
          <Text
            style={
              value.length > 0
                ? styles.textoSeleccionado
                : styles.placeholder
            }
          >
            {etiqueta}
          </Text>
        )}

        <MaterialIcons name="keyboard-arrow-down" size={18} color={Colors.primary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.dropdown}>
            <FlatList
              data={roles}
              keyExtractor={(item) =>
                String(item.id_rol)
              }
              renderItem={({ item }) => {
                const seleccionado = value.includes(
                  item.id_rol
                );

                return (
                  <TouchableOpacity
                    style={[
                      styles.opcion,
                      seleccionado &&
                        styles.opcionActiva,
                    ]}
                    onPress={() =>
                      toggleRol(item)
                    }
                  >
                    <Text
                      style={[
                        styles.opcionTexto,
                        seleccionado &&
                          styles.opcionTextoActivo,
                      ]}
                    >
                      {item.nombre.charAt(0).toUpperCase() +
                        item.nombre.slice(1)}
                    </Text>

                    {seleccionado && (
                      <Text style={styles.check}>
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              style={styles.btnListo}
              onPress={() => setOpen(false)}
            >
              <Text style={styles.btnListoTexto}>
                {t("cerrar")}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: Colors.surface,

    borderWidth: 1,
    borderColor: Colors.border,

    borderRadius: 12,

    paddingHorizontal: 12,
    paddingVertical: 10,

    marginBottom: 16,
  },

  placeholder: {
    color: Colors.textFaint,
    fontSize: 14,
  },

  textoSeleccionado: {
    color: Colors.text,
    fontSize: 14,
    flex: 1,
  },
  
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  dropdown: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    maxHeight: 300,
  },

  opcion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 16,
    paddingVertical: 14,

    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },

  opcionActiva: {
    backgroundColor: Colors.primaryFaint,
  },

  opcionTexto: {
    fontSize: 15,
    color: Colors.textSoft,
  },

  opcionTextoActivo: {
    color: Colors.primary,
    fontWeight: "600",
  },

  check: {
    color: Colors.primary,
    fontWeight: "bold",
  },

  btnListo: {
    backgroundColor: Colors.primary,
    padding: 14,
    alignItems: "center",
  },

  btnListoTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
});