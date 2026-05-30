import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, Modal,
  FlatList, StyleSheet, ActivityIndicator
} from "react-native";
import { api } from "@/config/api";

interface Rol {
  id_rol: number;
  nombre: string;
}

interface Props {
  value: number[];                    // ← ahora es array
  onChange: (ids: number[]) => void;  // ← devuelve array
  placeholder?: string;
  excluir?: string[];
}

export default function RolSelector({
  value,
  onChange,
  placeholder = "Seleccionar roles",
  excluir = [],
}: Props) {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await api.getRoles();
        setRoles(data.filter((r: Rol) => !excluir.includes(r.nombre)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const toggleRol = (id: number) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const etiqueta = value.length === 0
    ? placeholder
    : roles
        .filter((r) => value.includes(r.id_rol))
        .map((r) => r.nombre.charAt(0).toUpperCase() + r.nombre.slice(1))
        .join(", ");

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#f97316" />
        ) : (
          <Text style={value.length > 0 ? styles.textoSeleccionado : styles.placeholder}>
            {etiqueta}
          </Text>
        )}
        <Text style={styles.chevron}>⌄</Text>
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
              keyExtractor={(item) => String(item.id_rol)}
              renderItem={({ item }) => {
                const seleccionado = value.includes(item.id_rol);
                return (
                  <TouchableOpacity
                    style={[styles.opcion, seleccionado && styles.opcionActiva]}
                    onPress={() => toggleRol(item.id_rol)}
                  >
                    <Text style={[styles.opcionTexto, seleccionado && styles.opcionTextoActivo]}>
                      {item.nombre.charAt(0).toUpperCase() + item.nombre.slice(1)}
                    </Text>
                    {seleccionado && <Text style={styles.check}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity style={styles.btnListo} onPress={() => setOpen(false)}>
              <Text style={styles.btnListoTexto}>Listo</Text>
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
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  placeholder: { color: "#9ca3af", fontSize: 14 },
  textoSeleccionado: { color: "#111827", fontSize: 14, flex: 1 },
  chevron: { fontSize: 18, color: "#f97316" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  dropdown: {
    backgroundColor: "white",
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
    borderBottomColor: "#f3f4f6",
  },
  opcionActiva: { backgroundColor: "#fff7ed" },
  opcionTexto: { fontSize: 15, color: "#374151" },
  opcionTextoActivo: { color: "#f97316", fontWeight: "600" },
  check: { color: "#f97316", fontWeight: "bold" },
  btnListo: {
    backgroundColor: "#f97316",
    padding: 14,
    alignItems: "center",
  },
  btnListoTexto: { color: "white", fontWeight: "bold", fontSize: 15 },
});