import React, { useState } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet
} from "react-native";
import { api } from "@/config/api";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreada: () => void;
  mesActual: number;
  yearActual: number;
}

export default function ModalNuevaTarea({
  visible, onClose, onCreada, mesActual, yearActual
}: Props) {
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState(
    `${yearActual}-${String(mesActual).padStart(2, "0")}-01`
  );
  const [hora, setHora] = useState("");
  const [esTodoElDia, setEsTodoElDia] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCrear = async () => {
    if (!nombre || !fecha) return;
    setLoading(true);
    try {
      await api.createTarea({
        nombre,
        fecha,
        hora: esTodoElDia ? null : hora || null,
        es_todo_el_dia: esTodoElDia,
        completada: false,
        personas_ids: [],
      });
      onCreada();
      onClose();
      setNombre("");
      setHora("");
      setEsTodoElDia(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Nueva tarea</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Nombre*</Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Limpiar caniles"
              style={styles.input}
            />

            <Text style={styles.label}>Fecha*</Text>
            <TextInput
              value={fecha}
              onChangeText={setFecha}
              placeholder="YYYY-MM-DD"
              style={styles.input}
            />

            <Text style={styles.label}>Horario*</Text>
            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => setEsTodoElDia(false)}
                style={[styles.btnTipo, !esTodoElDia && styles.btnTipoActivo]}
              >
                <Text style={!esTodoElDia ? styles.btnTipoTextoActivo : styles.btnTipoTexto}>
                  Puntual
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setEsTodoElDia(true)}
                style={[styles.btnTipo, esTodoElDia && styles.btnTipoActivo]}
              >
                <Text style={esTodoElDia ? styles.btnTipoTextoActivo : styles.btnTipoTexto}>
                  Todo el día
                </Text>
              </TouchableOpacity>
            </View>

            {!esTodoElDia && (
              <>
                <Text style={styles.label}>Hora (HH:MM)</Text>
                <TextInput
                  value={hora}
                  onChangeText={setHora}
                  placeholder="Ej: 10:00"
                  style={styles.input}
                />
              </>
            )}

            <TouchableOpacity
              onPress={handleCrear}
              disabled={loading}
              style={styles.btnCrear}
            >
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.btnCrearTexto}>Crear nueva tarea</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container: {
    backgroundColor: "#fff7ed",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  cerrar: {
    fontSize: 22,
    color: "#6b7280",
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#111827",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  btnTipo: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#ffedd5",
  },
  btnTipoActivo: {
    backgroundColor: "#f97316",
  },
  btnTipoTexto: {
    color: "#f97316",
    fontWeight: "600",
  },
  btnTipoTextoActivo: {
    color: "white",
    fontWeight: "600",
  },
  btnCrear: {
    backgroundColor: "#f97316",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  btnCrearTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});