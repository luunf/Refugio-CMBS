import React, { useEffect, useState } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator
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
  const [personasIds, setPersonasIds] = useState<number[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      api.getPersonas().then(setPersonas).catch(console.error);
    }
  }, [visible]);

  const togglePersona = (id: number) => {
    setPersonasIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

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
        personas_ids: personasIds,
      });
      onCreada();
      onClose();
      // Reset
      setNombre("");
      setHora("");
      setEsTodoElDia(false);
      setPersonasIds([]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-orange-50 rounded-t-3xl p-6 max-h-[90%]">
          {/* Header modal */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold">Nueva tarea</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-2xl text-gray-500">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Nombre */}
            <Text className="font-semibold mb-1">Nombre*</Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Limpiar caniles"
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 mb-4"
            />

            {/* Fecha */}
            <Text className="font-semibold mb-1">Fecha*</Text>
            <TextInput
              value={fecha}
              onChangeText={setFecha}
              placeholder="YYYY-MM-DD"
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 mb-4"
            />

            {/* Horario */}
            <Text className="font-semibold mb-2">Horario*</Text>
            <View className="flex-row mb-4 gap-2">
              <TouchableOpacity
                onPress={() => setEsTodoElDia(false)}
                className={`flex-1 py-2 rounded-full items-center ${
                  !esTodoElDia ? "bg-orange-400" : "bg-orange-100"
                }`}
              >
                <Text className={!esTodoElDia ? "text-white font-semibold" : "text-orange-400"}>
                  Puntual
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setEsTodoElDia(true)}
                className={`flex-1 py-2 rounded-full items-center ${
                  esTodoElDia ? "bg-orange-400" : "bg-orange-100"
                }`}
              >
                <Text className={esTodoElDia ? "text-white font-semibold" : "text-orange-400"}>
                  Todo el día
                </Text>
              </TouchableOpacity>
            </View>

            {/* Hora (solo si es puntual) */}
            {!esTodoElDia && (
              <>
                <Text className="font-semibold mb-1">Hora (HH:MM)</Text>
                <TextInput
                  value={hora}
                  onChangeText={setHora}
                  placeholder="Ej: 10:00"
                  className="bg-white border border-gray-200 rounded-xl px-3 py-2 mb-4"
                />
              </>
            )}

            {/* Voluntarios */}
            <Text className="font-semibold mb-2">Voluntarios</Text>
            {personas.map((p) => (
              <TouchableOpacity
                key={p.id_persona}
                onPress={() => togglePersona(p.id_persona)}
                className={`flex-row items-center py-2 px-3 rounded-xl mb-2 ${
                  personasIds.includes(p.id_persona)
                    ? "bg-orange-400"
                    : "bg-white border border-gray-200"
                }`}
              >
                <Text className={personasIds.includes(p.id_persona) ? "text-white" : "text-gray-700"}>
                  {p.nombre} {p.apellido}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Botón crear */}
            <TouchableOpacity
              onPress={handleCrear}
              disabled={loading}
              className="bg-orange-400 py-3 rounded-full items-center mt-4 mb-2"
            >
              {loading
                ? <ActivityIndicator color="white" />
                : <Text className="text-white font-bold text-base">Crear nueva tarea</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}