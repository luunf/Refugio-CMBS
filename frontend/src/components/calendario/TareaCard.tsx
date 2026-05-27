import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
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

  const voluntarios = tarea.personas?.map((p: any) => p.nombre).join(", ")
    || "Sin asignar";

  return (
    <TouchableOpacity
      onPress={() => setExpandida(!expandida)}
      className="mb-2"
    >
      <View className="flex-row items-center justify-between py-2">
        {/* Nombre y hora */}
        <View className="flex-1">
          <Text
            className={`text-base ${tarea.completada ? "line-through text-gray-400" : "text-gray-800"}`}
            numberOfLines={expandida ? undefined : 1}
          >
            {tarea.nombre}
          </Text>
        </View>

        {/* Hora */}
        {hora ? (
          <Text className="text-gray-500 text-sm mx-2">{hora}</Text>
        ) : null}

        {/* Voluntarios */}
        <View className="bg-orange-50 border border-orange-200 rounded-full px-2 py-1">
          <Text className="text-orange-600 text-xs" numberOfLines={1}>
            {voluntarios}
          </Text>
        </View>

        {/* Chevron */}
        <Text className="text-orange-400 ml-2">{expandida ? "▲" : "▼"}</Text>
      </View>

      {/* Detalle expandido */}
      {expandida && (
        <View className="bg-orange-50 rounded-xl p-3 mt-1">
          <Text className="text-gray-600 text-sm">
            <Text className="font-semibold">Horario: </Text>
            {hora}
          </Text>
          <Text className="text-gray-600 text-sm mt-1">
            <Text className="font-semibold">Voluntarios: </Text>
            {voluntarios}
          </Text>
          <TouchableOpacity
            onPress={toggleCompletada}
            className={`mt-3 py-2 rounded-full items-center ${
              tarea.completada ? "bg-gray-300" : "bg-orange-400"
            }`}
          >
            <Text className="text-white font-semibold text-sm">
              {tarea.completada ? "Marcar pendiente" : "Marcar completada"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}