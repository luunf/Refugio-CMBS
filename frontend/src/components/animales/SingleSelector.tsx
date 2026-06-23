import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, Modal,
  FlatList, StyleSheet, TextInput
} from "react-native";
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from "@expo/vector-icons";

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

export default function SingleSelector({ value, onChange, items, placeholder, searchable = false }: Props) {
  const { t } = useTranslation('animales');
  const textoPlaceholder = placeholder ?? t('placeholderSeleccionar');

  const [open, setOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const itemsFiltrados = searchable
    ? items.filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : items;

  const etiqueta = value === null
    ? textoPlaceholder
    : items.find(i => i.id === value)?.nombre ?? placeholder;

  return (
    <>
      <TouchableOpacity style={styles.selector} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={value !== null ? styles.textoSeleccionado : styles.placeholder} numberOfLines={1}>
          {etiqueta}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={18} color={Colors.primary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => { setOpen(false); setBusqueda(""); }}>
          <View style={styles.dropdown}>
            {searchable && (
              <TextInput
                value={busqueda}
                onChangeText={setBusqueda}
                placeholder={t('placeholderBuscar')}
                placeholderTextColor={Colors.textFaint}
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
                    onPress={() => { onChange(seleccionado ? null : item.id); }}
                  >
                    <Text style={[styles.opcionTexto, seleccionado && styles.opcionTextoActivo]}>
                      {item.nombre}
                    </Text>
                    {seleccionado && <Text style={styles.check}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.sinResultados}>{t('sinResultadosSelector')}</Text>
              }
            />
            <TouchableOpacity style={styles.btnListo} onPress={() => { setOpen(false); setBusqueda(""); }}>
              <Text style={styles.btnListoTexto}>{t('btnListo')}</Text>
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
  placeholder: { color: Colors.textFaint, fontSize: 14 },
  textoSeleccionado: { color: Colors.text, fontSize: 14, flex: 1 },
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
    maxHeight: 350,
  },
  buscador: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
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
  opcionActiva: { backgroundColor: Colors.primaryFaint },
  opcionTexto: { fontSize: 15, color: Colors.textSoft },
  opcionTextoActivo: { color: Colors.primary, fontWeight: "600" },
  check: { color: Colors.primary, fontWeight: "bold" },
  sinResultados: { textAlign: "center", color: Colors.textFaint, padding: 16 },
  btnListo: { backgroundColor: Colors.primary, padding: 14, alignItems: "center" },
  btnListoTexto: { color: Colors.surface, fontWeight: "bold", fontSize: 15 },
});