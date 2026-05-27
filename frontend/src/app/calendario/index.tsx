import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView
} from "react-native";
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

  // Agrupar tareas por día
  const tareasPorDia: Record<number, any[]> = {};
  tareas.forEach((t) => {
    const dia = new Date(t.fecha + "T00:00:00").getDate();
    if (!tareasPorDia[dia]) tareasPorDia[dia] = [];
    tareasPorDia[dia].push(t);
  });

  const diasConTareas = Object.keys(tareasPorDia)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-orange-400 px-4 py-4">
        <Text className="text-white text-2xl font-bold">Calendario</Text>
      </View>

      {/* Selector de mes */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white">
        <TouchableOpacity onPress={() => cambiarMes(-1)}>
          <Text className="text-2xl text-orange-400">‹</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold">
          {MESES[mes - 1]} {year}
        </Text>
        <TouchableOpacity onPress={() => cambiarMes(1)}>
          <Text className="text-2xl text-orange-400">›</Text>
        </TouchableOpacity>

        {/* Botón + */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-orange-400 w-10 h-10 rounded-full items-center justify-center ml-2"
        >
          <Text className="text-white text-2xl font-bold">+</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de días */}
      {loading ? (
        <ActivityIndicator size="large" color="#f97316" className="mt-10" />
      ) : (
        <ScrollView className="flex-1 px-4 pt-2">
          {diasConTareas.length === 0 ? (
            <Text className="text-center text-gray-400 mt-10">
              No hay tareas este mes
            </Text>
          ) : (
            diasConTareas.map((dia) => {
              const fecha = new Date(year, mes - 1, dia);
              const nombreDia = DIAS_SEMANA[fecha.getDay()];
              return (
                <View key={dia} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                  {/* Encabezado del día */}
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-3xl font-light text-gray-700">{dia}</Text>
                    <Text className="text-lg text-gray-500 self-end">{nombreDia}</Text>
                  </View>
                  {/* Tareas del día */}
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
          <View className="h-6" />
        </ScrollView>
      )}

      {/* Modal nueva tarea */}
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