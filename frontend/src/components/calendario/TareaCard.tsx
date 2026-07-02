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
  const tieneVoluntarios = tarea.personas && tarea.personas.length > 0;

  const toggleCompletada = async () => {
    if (!tieneVoluntarios) {
      Alert.alert(
        t('alert.error'),
        t('tareaCard.errorSinVoluntariosMensaje')
      );
      return;
    }

    try {
      await onUpdate();
    } catch (error: any) {
      if (error?.response?.status === 400) {
        console.log("Error controlado al actualizar estado:", error?.response?.data?.error);
      } else {
        console.error("Error inesperado:", error);
      }
      Alert.alert(
        t('alert.error'),
        error?.response?.data?.error || t('alert.errorGenerico')
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
                t('alert.exito'),
                t('alert.tareaEliminada'),
                [{ text: "OK" }]
              );
            } catch (error: any) {
              console.error("Error al eliminar tarea:", error);
              Alert.alert(
                t('alert.error'),
                error?.response?.data?.error || t('alert.errorEliminar'),
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
        
        <View style={[
          styles.voluntariosBadge,
          !tieneVoluntarios && styles.voluntariosBadgeSinAsignar
        ]}>
          <Text style={[
            styles.voluntariosText,
            !tieneVoluntarios && styles.voluntariosTextSinAsignar
          ]} numberOfLines={1}>
            {voluntarios}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation(); onEdit(); }}
          style={styles.btnLapiz}
        >
          <MaterialIcons name="edit" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <MaterialIcons name={expandida ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={18} color={Colors.primary} />
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

          {tarea.descripcion && (
            <Text style={[styles.detalleTexto, styles.descripcionText]}>
              <Text style={styles.bold}>{t('tareaCard.descripcionLabel')}</Text>
              {tarea.descripcion}
            </Text>
          )}

          {tarea.tratamiento_frecuencia && (
            <Text style={[styles.detalleTexto, styles.frecuenciaText]}>
              <Text style={styles.bold}>{t('tareaCard.frecuenciaLabel')}</Text>
              Cada {tarea.tratamiento_frecuencia} horas
            </Text>
          )}

          <TouchableOpacity
            onPress={toggleCompletada}
            disabled={!tieneVoluntarios}
            style={[
              styles.btnCompletar,
              tarea.completada && styles.btnCompletarGris,
              !tieneVoluntarios && styles.btnCompletarDisabled
            ]}
          >
            <Text style={[
              styles.btnCompletarText,
              !tieneVoluntarios && styles.btnCompletarTextDisabled
            ]}>
              {tarea.completada ? t('tareaCard.btnMarcarPendiente') : t('tareaCard.btnMarcarCompletada')}
            </Text>
          </TouchableOpacity>

          {!tieneVoluntarios && !tarea.completada && (
            <Text style={styles.mensajeAyuda}>
              {t('tareaCard.errorSinVoluntarios')}
            </Text>
          )}

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
  voluntariosBadgeSinAsignar: {
    backgroundColor: Colors.borderLight,
    borderColor: Colors.border,
  },
  voluntariosText: { color: Colors.primary, fontSize: 12 },
  voluntariosTextSinAsignar: {
    color: Colors.textFaint,
    fontStyle: 'italic',
  },
  btnLapiz: { marginLeft: 8, padding: 4 },
  chevron: { color: Colors.primary, marginLeft: 4 },
  detalle: { backgroundColor: Colors.primaryFaint, borderRadius: 12, padding: 12, marginTop: 4 },
  detalleTexto: { color: Colors.textSoft, fontSize: 13, marginBottom: 4 },
  descripcionText: {
    color: Colors.text,
    fontSize: 13,
    marginBottom: 4,
  },
  frecuenciaText: {
    color: Colors.primary,
    fontSize: 13,
    marginBottom: 4,
  },
  bold: { fontWeight: "600" },
  btnCompletar: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 8,
  },
  btnCompletarGris: { backgroundColor: Colors.border },
  btnCompletarDisabled: {
    backgroundColor: Colors.border,
    borderWidth: 1,
    borderColor: Colors.border,
    opacity: 0.6,
  },
  btnCompletarText: { color: Colors.surface, fontWeight: "600", fontSize: 13 },
  btnCompletarTextDisabled: {
    color: Colors.textFaint,
  },
  mensajeAyuda: {
    color: Colors.textFaint,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  btnEliminar: {
    backgroundColor: Colors.delete,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 8,
  },
  btnEliminarText: { color: Colors.surface, fontWeight: "600", fontSize: 13 },
});