//tareacard
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { MaterialIcons } from "@expo/vector-icons";

interface Props {
  tarea: any;
  onUpdate: () => Promise<void>;
  onDelete: () => Promise<void>;
  onEdit: () => void;
}

export default function TareaCard({ tarea, onUpdate, onDelete, onEdit }: Props) {
  const { t } = useTranslation('calendario');
  const [expandida, setExpandida] = useState(false);

  const toggleCompletada = async () => {
    try {
      await onUpdate();
    } catch (error: any) {
      if (error?.response?.status === 400) {
        console.log("Error controlado al actualizar estado:", error?.response?.data?.error);
      } else {
        console.error("Error inesperado:", error);
      }
      Alert.alert(
        "Error",
        error?.response?.data?.error || "No se pudo actualizar la tarea"
      );
    }
  };

  const handleEliminar = () => {
    Alert.alert(
      t('tareaCard.confirmTitleEliminar'),
      t('tareaCard.confirmMessageEliminar'),
      [
        { text: t('tareaCard.btnCancelar'), style: "cancel" },
        {
          text: t('tareaCard.btnEliminar'),
          style: "destructive",
          onPress: async () => {
            try {
              await onDelete();
              Alert.alert(
                "Éxito",
                "Tarea eliminada correctamente",
                [{ text: "OK" }]
              );
            } catch (error: any) {
              console.error("Error al eliminar tarea:", error);
              Alert.alert(
                "Error",
                error?.response?.data?.error || "No se pudo eliminar la tarea",
                [{ text: "OK" }]
              );
            }
          }
        },
      ]
    );
  };

  const hora = tarea.hora
    ? tarea.hora.substring(0, 5)
    : tarea.es_todo_el_dia ? t('tareaCard.todoElDia') : "";

  const voluntarios = tarea.personas?.map((p: any) => p.nombre).join(", ") || t('tareaCard.sinAsignar');

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
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation(); onEdit(); }}
          style={styles.btnLapiz}
        >
          <MaterialIcons name="edit" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.chevron}>{expandida ? "▲" : "▼"}</Text>
      </View>

      {expandida && (
        <View style={styles.detalle}>
          <Text style={styles.detalleTexto}>
            <Text style={styles.bold}>{t('tareaCard.horarioLabel')}</Text>
            {hora || "—"}
          </Text>
          <Text style={styles.detalleTexto}>
            <Text style={styles.bold}>{t('tareaCard.voluntariosLabel')}</Text>
            {voluntarios}
          </Text>

          <TouchableOpacity
            onPress={toggleCompletada}
            style={[styles.btnCompletar, tarea.completada && styles.btnCompletarGris]}
          >
            <Text style={styles.btnCompletarText}>
              {tarea.completada ? t('tareaCard.btnMarcarPendiente') : t('tareaCard.btnMarcarCompletada')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleEliminar} style={styles.btnEliminar}>
            <Text style={styles.btnEliminarText}>{t('tareaCard.btnEliminar')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  fila: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  nombre: { flex: 1, fontSize: 15, color: Colors.text },
  completada: { textDecorationLine: "line-through", color: Colors.textFaint },
  hora: { fontSize: 13, color: Colors.textMuted, marginHorizontal: 8 },
  voluntariosBadge: {
    backgroundColor: Colors.primaryFaint,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 120,
  },
  voluntariosText: { color: Colors.primary, fontSize: 12 },
  btnLapiz: { marginLeft: 8, padding: 4 },
  chevron: { color: Colors.primary, marginLeft: 4 },
  detalle: { backgroundColor: Colors.primaryFaint, borderRadius: 12, padding: 12, marginTop: 4 },
  detalleTexto: { color: Colors.textSoft, fontSize: 13, marginBottom: 4 },
  bold: { fontWeight: "600" },
  btnCompletar: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 8,
  },
  btnCompletarGris: { backgroundColor: Colors.border },
  btnCompletarText: { color: Colors.surface, fontWeight: "600", fontSize: 13 },
  btnEliminar: {
    backgroundColor: Colors.delete,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 8,
  },
  btnEliminarText: { color: Colors.surface, fontWeight: "600", fontSize: 13 },
});