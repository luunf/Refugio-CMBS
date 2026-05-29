import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/config/api";
import TareaCard from "@/components/calendario/TareaCard";
import ModalNuevaTarea from "@/components/calendario/ModalNuevaTarea";

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];
const DIAS_SEMANA = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

export default function CalendarioScreen() {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [year, setYear] = useState(hoy.getFullYear());
  const [tareas, setTareas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const cargarTareas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTareas(mes, year);
      setTareas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [mes, year]);

  useEffect(() => {
    cargarTareas();
  }, [cargarTareas]);

  const cambiarMes = (direccion: number) => {
    let nuevoMes = mes + direccion;
    let nuevoYear = year;
    if (nuevoMes > 12) { nuevoMes = 1; nuevoYear++; }
    if (nuevoMes < 1)  { nuevoMes = 12; nuevoYear--; }
    setMes(nuevoMes);
    setYear(nuevoYear);
  };

  const tareasPorDia: Record<number, any[]> = {};
  tareas.forEach((t) => {
    const dia = new Date(t.fecha + "T00:00:00").getDate();
    if (!tareasPorDia[dia]) tareasPorDia[dia] = [];
    tareasPorDia[dia].push(t);
  });

  const diasConTareas = Object.keys(tareasPorDia).map(Number).sort((a, b) => a - b);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Calendario</Text>
      </View>

      {/* Selector de mes */}
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

      {/* Lista */}
      {loading ? (
        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
          {diasConTareas.length === 0 ? (
            <Text style={styles.sinTareas}>No hay tareas este mes</Text>
          ) : (
            diasConTareas.map((dia) => {
              const fecha = new Date(year, mes - 1, dia);
              const nombreDia = DIAS_SEMANA[fecha.getDay()];
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
                      onActualizar={cargarTareas}
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
        onCreada={cargarTareas}
        mesActual={mes}
        yearActual={year}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    backgroundColor: "#f97316",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  selectorMes: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
  },
  chevron: {
    fontSize: 28,
    color: "#f97316",
  },
  mesText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  btnAgregar: {
    backgroundColor: "#f97316",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  btnAgregarText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 28,
  },
  sinTareas: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 40,
    fontSize: 16,
  },
  diaCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  diaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  diaNumero: {
    fontSize: 32,
    fontWeight: "300",
    color: "#374151",
  },
  diaNombre: {
    fontSize: 18,
    color: "#6b7280",
    alignSelf: "flex-end",
  },
});