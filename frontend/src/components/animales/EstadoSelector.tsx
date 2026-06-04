import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, Modal,
  FlatList, StyleSheet
} from "react-native";

interface Estado {
  id_estado: number;
  nombre: string;
}

interface Props {
  value: number[];
  onChange: (ids: number[]) => void;
  estados: Estado[];
  placeholder?: string;
}

const INCOMPATIBLES: Record<string, string> = {
  "En adopción": "Adoptado",
  "Adoptado": "En adopción",
  "En refugio": "En tránsito",
  "En tránsito": "En refugio",
};

export default function EstadoSelector({ value, onChange, estados, placeholder = "Seleccionar estados" }: Props) {
  const [open, setOpen] = useState(false);

  const toggle = (id: number) => {
    const nombreEstado = estados.find(e => e.id_estado === id)?.nombre ?? "";
    const nombreIncompatible = INCOMPATIBLES[nombreEstado];
    const idIncompatible = estados.find(e => e.nombre === nombreIncompatible)?.id_estado;

    if (value.includes(id)) {
      onChange(value.filter(e => e !== id));
    } else {
      const sinIncompatible = idIncompatible
        ? value.filter(e => e !== idIncompatible)
        : value;
      onChange([...sinIncompatible, id]);
    }
  };

  const etiqueta = value.length === 0
    ? placeholder
    : estados.filter(e => value.includes(e.id_estado)).map(e => e.nombre).join(", ");

  return (
    <>
      <TouchableOpacity style={styles.selector} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={value.length > 0 ? styles.textoSeleccionado : styles.placeholder} numberOfLines={1}>
          {etiqueta}
        </Text>
        <Text style={styles.chevron}>⌄</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.dropdown}>
            <FlatList
              data={estados}
              keyExtractor={item => String(item.id_estado)}
              renderItem={({ item }) => {
                const seleccionado = value.includes(item.id_estado);
                return (
                  <TouchableOpacity
                    style={[styles.opcion, seleccionado && styles.opcionActiva]}
                    onPress={() => toggle(item.id_estado)}
                  >
                    <Text style={[styles.opcionTexto, seleccionado && styles.opcionTextoActivo]}>
                      {item.nombre}
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
  btnListo: { backgroundColor: "#f97316", padding: 14, alignItems: "center" },
  btnListoTexto: { color: "white", fontWeight: "bold", fontSize: 15 },
});