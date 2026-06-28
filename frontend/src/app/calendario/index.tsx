import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTareas } from '@/hooks/useTareas';
import TareaCard from '@/components/calendario/TareaCard';
import ModalNuevaTarea from '@/components/calendario/ModalNuevaTarea';
import ModalEditarTarea from '@/components/calendario/ModalEditarTarea';
import { Colors } from '@/constants/theme';

export default function CalendarioScreen() {
  const { t } = useTranslation('calendario');

  const MESES = Object.values(t('meses', { returnObjects: true })) as string[];
  const DIAS_SEMANA = Object.values(t('diasSemana', { returnObjects: true })) as string[];

  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [year, setYear] = useState(hoy.getFullYear());
  const [modalVisible, setModalVisible] = useState(false);
  const [tareaEditando, setTareaEditando] = useState<any | null>(null);

  const { tareas, loading, cargarTareas, crearTarea, actualizarTarea, eliminarTarea } = useTareas(mes, year);

  useEffect(() => {
    cargarTareas();
  }, [mes, year]);

  const cambiarMes = (direccion: number) => {
    let nuevoMes = mes + direccion;
    let nuevoYear = year;
    if (nuevoMes > 12) { nuevoMes = 1; nuevoYear++; }
    if (nuevoMes < 1) { nuevoMes = 12; nuevoYear--; }
    setMes(nuevoMes);
    setYear(nuevoYear);
  };

  const handleCrearTarea = async (nuevaTarea: any) => {
    try {
      await crearTarea(nuevaTarea);
      
      Alert.alert(
        t('alert.exito'),
        t('alert.tareaCreada'),
        [{ text: "OK" }]
      );
    } catch (error: any) {
      if (error?.response?.status === 400) {
        console.log("Error controlado del backend (400):", error?.response?.data?.error);
      } else {
        console.error("Error inesperado al crear tarea:", error);
      }

      let mensajeError = t('alert.errorGenerico');

      if (error?.response?.data?.error) {
        mensajeError = error.response.data.error;
      } else if (error?.response?.data?.message) {
        mensajeError = error.response.data.message;
      }

      Alert.alert(
        t('alert.error'),
        mensajeError,
        [{ text: "OK" }]
      );
    }
  };

  const handleActualizarTarea = async (id: number, data: any) => {
    try {
      await actualizarTarea(id, data);
      
      Alert.alert(
        t('alert.exito'),
        t('alert.tareaActualizada'),
        [{ text: "OK" }]
      );
    } catch (error: any) {
      if (error?.response?.status === 400 || error?.response?.status === 404) {
        console.log("Error controlado:", error?.response?.data?.error);
      } else {
        console.error("Error inesperado al actualizar tarea:", error);
      }

      let mensajeError = t('alert.errorGenerico');

      if (error?.response?.data?.error) {
        mensajeError = error.response.data.error;
      }

      Alert.alert(
        t('alert.error'),
        mensajeError,
        [{ text: "OK" }]
      );
    }
  };

  const tareasPorDia: Record<number, any[]> = {};
  tareas.forEach((tarea) => {
    const dia = new Date(tarea.fecha + "T00:00:00").getDate();
    if (!tareasPorDia[dia]) tareasPorDia[dia] = [];
    tareasPorDia[dia].push(tarea);
  });
  const diasConTareas = Object.keys(tareasPorDia).map(Number).sort((a, b) => a - b);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{t('headerTitulo')}</Text>
      </View>

      <View style={styles.selectorMes}>
        <TouchableOpacity onPress={() => cambiarMes(-1)}>
          <Text style={styles.chevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.mesText}>{MESES[mes - 1]} {year}</Text>
        <TouchableOpacity onPress={() => cambiarMes(1)}>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnAgregar} onPress={() => setModalVisible(true)}>
          <Text style={styles.btnAgregarText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
          {diasConTareas.length === 0 ? (
            <Text style={styles.sinTareas}>{t('sinTareas')}</Text>
          ) : (
            diasConTareas.map((dia) => {
              const fechaObj = new Date(year, mes - 1, dia);
              const nombreDia = DIAS_SEMANA[fechaObj.getDay()];
              return (
                <View key={dia} style={styles.diaCard}>
                  <View style={styles.diaHeader}>
                    <Text style={styles.diaNumero}>{dia}</Text>
                    <Text style={styles.diaNombre}>{nombreDia}</Text>
                  </View>
                  {tareasPorDia[dia].map((tarea) => (
                    <TareaCard
                      key={tarea.id_tarea}
                      tarea={tarea}
                      onUpdate={() => actualizarTarea(tarea.id_tarea, { completada: !tarea.completada })}
                      onDelete={() => eliminarTarea(tarea.id_tarea)}
                      onEdit={() => setTareaEditando(tarea)}
                    />
                  ))}
                </View>
              );
            })
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      <ModalNuevaTarea
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCrearTarea}
        mesActual={mes}
        yearActual={year}
      />

      <ModalEditarTarea
        visible={!!tareaEditando}
        onClose={() => setTareaEditando(null)}
        onUpdate={handleActualizarTarea}
        tarea={tareaEditando}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 16 },
  headerText: { color: Colors.surface, fontSize: 24, fontWeight: "bold" },
  selectorMes: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  chevron: { fontSize: 28, color: Colors.primary },
  mesText: { fontSize: 18, fontWeight: "600", color: Colors.text },
  btnAgregar: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  btnAgregarText: { color: Colors.surface, fontSize: 24, fontWeight: "bold", lineHeight: 28 },
  sinTareas: { textAlign: "center", color: Colors.textFaint, marginTop: 40, fontSize: 16 },
  diaCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  diaHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  diaNumero: { fontSize: 32, fontWeight: "300", color: Colors.textSoft },
  diaNombre: { fontSize: 18, color: Colors.textMuted, alignSelf: "flex-end" },
});