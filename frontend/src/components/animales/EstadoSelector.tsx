import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, Modal,
  FlatList, StyleSheet
} from "react-native";
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import { Feather } from "@expo/vector-icons";

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

export default function EstadoSelector({ value, onChange, estados, placeholder }: Props) {
  const { t } = useTranslation('animales');

  const textoPlaceholder = placeholder ?? t('placeholderSeleccionarEstados');

  const [open, setOpen] = useState(false);

  const estadosSeleccionables = estados.filter(e => e.nombre !== "En tratamiento");

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
    ? textoPlaceholder
    : estados.filter(e => value.includes(e.id_estado)).map(e => e.nombre).join(", ");

  return (
    <>
      <TouchableOpacity style={styles.selector} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={value.length > 0 ? styles.textoSeleccionado : styles.placeholder} numberOfLines={1}>
          {etiqueta}
        </Text>
        <Feather name="chevron-down" size={16} color={Colors.primary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.dropdown}>
            <FlatList
              data={estadosSeleccionables}
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
    backgroundColor: "white",
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
  opcionActiva: { backgroundColor: Colors.primaryFaint },
  opcionTexto: { fontSize: 15, color: Colors.textSoft },
  opcionTextoActivo: { color: Colors.primary, fontWeight: "600" },
  check: { color: Colors.primary, fontWeight: "bold" },
  btnListo: { backgroundColor: Colors.primary, padding: 14, alignItems: "center" },
  btnListoTexto: { color: "white", fontWeight: "bold", fontSize: 15 },
});