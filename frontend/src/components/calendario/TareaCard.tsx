import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { api } from "@/config/api";

interface Props {
  tarea: any;
  onActualizar: () => void;
}

export default function TareaCard({ tarea, onActualizar }: Props) {
  const [expandida, setExpandida] = useState(false);

  const toggleCompletada = async () => {
    await api.updateTarea(tarea.id_tarea, { completada: !tarea.completada });
    onActualizar();
  };

  const hora = tarea.hora
    ? tarea.hora.substring(0, 5)
    : tarea.es_todo_el_dia ? "Todo el día" : "";

  const voluntarios = tarea.personas?.map((p: any) => p.nombre).join(", ") || "Sin asignar";

  return (
    <TouchableOpacity onPress={() => setExpandida(!expandida)} style={styles.container}>
      <View style={styles.fila}>
        <Text style={[styles.nombre, tarea.completada && styles.completada]} numberOfLines={expandida ? undefined : 1}>
          {tarea.nombre}
        </Text>
        {hora ? <Text style={styles.hora}>{hora}</Text> : null}
        <View style={styles.voluntariosBadge}>
          <Text style={styles.voluntariosText} numberOfLines={1}>{voluntarios}</Text>
        </View>
        <Text style={styles.chevron}>{expandida ? "▲" : "▼"}</Text>
      </View>

      {expandida && (
        <View style={styles.detalle}>
          <Text style={styles.detalleTexto}><Text style={styles.bold}>Horario: </Text>{hora || "—"}</Text>
          <Text style={styles.detalleTexto}><Text style={styles.bold}>Voluntarios: </Text>{voluntarios}</Text>
          <TouchableOpacity
            onPress={toggleCompletada}
            style={[styles.btnCompletar, tarea.completada && styles.btnCompletarGris]}
          >
            <Text style={styles.btnCompletarText}>
              {tarea.completada ? "Marcar pendiente" : "Marcar completada"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  fila: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  nombre: { flex: 1, fontSize: 15, color: "#1f2937" },
  completada: { textDecorationLine: "line-through", color: "#9ca3af" },
  hora: { fontSize: 13, color: "#6b7280", marginHorizontal: 8 },
  voluntariosBadge: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 120,
  },
  voluntariosText: { color: "#ea580c", fontSize: 12 },
  chevron: { color: "#f97316", marginLeft: 8 },
  detalle: { backgroundColor: "#fff7ed", borderRadius: 12, padding: 12, marginTop: 4 },
  detalleTexto: { color: "#4b5563", fontSize: 13, marginBottom: 4 },
  bold: { fontWeight: "600" },
  btnCompletar: {
    backgroundColor: "#f97316",
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 8,
  },
  btnCompletarGris: { backgroundColor: "#d1d5db" },
  btnCompletarText: { color: "white", fontWeight: "600", fontSize: 13 },
});