import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { api } from "@/config/api";
import { Colors } from "@/constants/theme";
import Feather from "@expo/vector-icons/build/Feather";
import ModalAgregarVisita from "@/components/visitas/ModalAgregarVisita";
import { useTranslation } from 'react-i18next'

interface Visita {
  id_visita: number;
  procedimiento: string;
  fecha: string;
  estado: string;
}

type FiltroEstado = "todas" | "proxima" | "realizada";

interface Props {
  animalId: number;
}

function formatFecha(fechaStr: string): string {
  if (!fechaStr) return "";
  const [year, month, day] = fechaStr.split("-");
  return `${parseInt(day)}/${parseInt(month)}/${year}`;
}

export default function AnimalVisitas({ animalId }: Props) {
  const { t } = useTranslation('visitas')

  const FILTROS: { label: string; valor: FiltroEstado }[] = [
    { label: t('optionTodas'), valor: "todas"     },
    { label: t('optionProximas'), valor: "proxima"   },
    { label: t('optionRealizadas'), valor: "realizada" },
  ];

  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroEstado>("todas");
  const [modalVisible, setModalVisible] = useState(false);

  const cargarVisitas = useCallback(async () => {
    setLoading(true);
    try {
      const estado = filtro === "todas" ? undefined : filtro;
      const data = await api.getVisitasAnimal(animalId, estado);
      setVisitas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [animalId, filtro]);

  useFocusEffect(
    useCallback(() => {
      cargarVisitas();
    }, [cargarVisitas])
  );

  const visitasFiltradas = visitas.filter((v) => {
    const textoBusqueda = busqueda.toLowerCase();

    return (
      v.procedimiento?.toLowerCase().includes(textoBusqueda) ||
      formatFecha(v.fecha).includes(textoBusqueda)
    );
  }
  );

  const getEstadoStyle = (estado: string) => {
    if (estado === "proxima")   return styles.badgeProxima;
    if (estado === "realizada") return styles.badgeRealizada;
    return styles.badgeDefault;
  };

  const getEstadoTextoStyle = (estado: string) => {
    if (estado === "proxima")   return styles.badgeProximaTexto;
    if (estado === "realizada") return styles.badgeRealizadaTexto;
    return styles.badgeDefaultTexto;
  };

  const getEstadoLabel = (estado: string) => {
    if (estado === "proxima")   return "Próxima";
    if (estado === "realizada") return "Realizada";
    return estado;
  };

  return (
    <View style={styles.container}>

      {/* Buscador */}
      <View style={styles.buscadorRow}>
        <View style={styles.buscadorContainer}>
          <Feather name="search" size={18} color={Colors.textFaint} style={{ marginRight: 6 }}/>
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder={t('placeholderBuscarVisita')}
            style={styles.buscadorInput}
            placeholderTextColor={Colors.textFaint}
          />
        </View>
        <TouchableOpacity
          style={styles.btnAgregar}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.btnAgregarTexto}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosRow}>
        {FILTROS.map((f) => (
          <TouchableOpacity
            key={f.valor}
            style={[styles.filtroBadge, filtro === f.valor && styles.filtroBadgeActivo]}
            onPress={() => setFiltro(f.valor)}
          >
            <Text style={[styles.filtroTexto, filtro === f.valor && styles.filtroTextoActivo]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={visitasFiltradas}
          keyExtractor={(item) => item.id_visita.toString()}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.sinResultados}>No hay visitas registradas</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => { /* próximamente: detalle de visita */ }}
              activeOpacity={0.75}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardProcedimiento} numberOfLines={1}>
                  {item.procedimiento}
                </Text>
                <Text style={styles.cardFecha}>{formatFecha(item.fecha)}</Text>
              </View>
              <View style={styles.cardRight}>
                <View style={[styles.estadoBadge, getEstadoStyle(item.estado)]}>
                  <Text style={[styles.estadoTexto, getEstadoTextoStyle(item.estado)]}>
                    {getEstadoLabel(item.estado)}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.textFaint}/>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <ModalAgregarVisita
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreada={cargarVisitas}
        animalId={animalId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  buscadorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    gap: 10,
  },
  buscadorContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buscadorInput: { flex: 1, fontSize: 14, color: Colors.text },
  btnAgregar: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  btnAgregarTexto: {
    color: Colors.surface,
    fontSize: 26,
    fontWeight: "bold",
    lineHeight: 30,
  },
  filtrosRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    gap: 8,
  },
  filtroBadge: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 14, 
    paddingVertical: 6,
    borderRadius: 20, 
    backgroundColor: Colors.background,
  },
  filtroBadgeActivo: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filtroTexto: { fontSize: 13, fontWeight: "600", color: Colors.textSoft },
  filtroTextoActivo: { color: Colors.surface },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 10,
    gap: 10,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  cardLeft: { flex: 1, marginRight: 12 },
  cardProcedimiento: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 3,
  },
  cardFecha: { fontSize: 13, color: Colors.textFaint },
  cardRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  estadoTexto: { fontSize: 12, fontWeight: "600" },
  badgeProxima: { backgroundColor: Colors.primaryLight },
  badgeProximaTexto: { color: Colors.primary },
  badgeRealizada: { backgroundColor: "#e5e7eb" },
  badgeRealizadaTexto: { color: Colors.textMuted },
  badgeDefault: { backgroundColor: Colors.borderLight },
  badgeDefaultTexto: { color: Colors.textFaint },
  sinResultados: {
    textAlign: "center",
    color: Colors.textFaint,
    marginTop: 40,
    fontSize: 15,
  },
});
