import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, Modal,
  FlatList, StyleSheet, TextInput
} from "react-native";

interface Item {
  id: number;
  nombre: string;
}

interface Props {
  value: number | null;
  onChange: (id: number | null) => void;
  items: Item[];
  placeholder?: string;
  searchable?: boolean;
}

export default function SingleSelector({ value, onChange, items, placeholder = "Seleccionar", searchable = false }: Props) {
  const [open, setOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const itemsFiltrados = searchable
    ? items.filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : items;

  const etiqueta = value === null
    ? placeholder
    : items.find(i => i.id === value)?.nombre ?? placeholder;

  return (
    <>
      <TouchableOpacity style={styles.selector} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={value !== null ? styles.textoSeleccionado : styles.placeholder} numberOfLines={1}>
          {etiqueta}
        </Text>
        <Text style={styles.chevron}>⌄</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => { setOpen(false); setBusqueda(""); }}>
          <View style={styles.dropdown}>
            {searchable && (
              <TextInput
                value={busqueda}
                onChangeText={setBusqueda}
                placeholder="Buscar..."
                placeholderTextColor="#9ca3af"
                style={styles.buscador}
                autoFocus
              />
            )}
            <FlatList
              data={itemsFiltrados}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => {
                const seleccionado = value === item.id;
                return (
                  <TouchableOpacity
                    style={[styles.opcion, seleccionado && styles.opcionActiva]}
                    onPress={() => { onChange(seleccionado ? null : item.id); setOpen(false); setBusqueda(""); }}
                  >
                    <Text style={[styles.opcionTexto, seleccionado && styles.opcionTextoActivo]}>
                      {item.nombre}
                    </Text>
                    {seleccionado && <Text style={styles.check}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.sinResultados}>Sin resultados</Text>
              }
            />
            <TouchableOpacity style={styles.btnListo} onPress={() => { setOpen(false); setBusqueda(""); }}>
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
    maxHeight: 350,
  },
  buscador: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
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
  sinResultados: { textAlign: "center", color: "#9ca3af", padding: 16 },
  btnListo: { backgroundColor: "#f97316", padding: 14, alignItems: "center" },
  btnListoTexto: { color: "white", fontWeight: "bold", fontSize: 15 },
});