import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { api } from "@/config/api";
import { Colors } from "@/constants/theme";
import Feather from "@expo/vector-icons/build/Feather";
import ModalAgregarVacuna from "./ModalAgregarVacunas";
import ModalDetalleVacuna from "./ModalDetalleVacunas";
import { useTranslation } from "react-i18next";

export interface Vacuna {
  id_vacuna: number;
  nombre: string;
  fecha_aplicacion: string | null;
  requiere_prox_dosis: boolean;
  fecha_prox_dosis: string | null;
  costo_aplicacion: number | null;
}

function formatFecha(fechaStr: string | null): string {
  if (!fechaStr) return "";
  const [year, month, day] = fechaStr.split("-");
  return `${parseInt(day)}/${parseInt(month)}/${year}`;
}

interface Props {
  animalId: number;
  onCambioVacunas?: () => void;
}

export default function AnimalVacunas({ animalId, onCambioVacunas }: Props) {
  const { t } = useTranslation("vacunas");

  const [vacunas, setVacunas] = useState<Vacuna[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [modalAgregar, setModalAgregar] = useState(false);
  const [vacunaSeleccionada, setVacunaSeleccionada] = useState<Vacuna | null>(
    null,
  );

  const cargarVacunas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getVacunasAnimal(animalId);
      setVacunas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
    onCambioVacunas?.();
  }, [animalId, onCambioVacunas]);

  useFocusEffect(
    useCallback(() => {
      cargarVacunas();
    }, [cargarVacunas]),
  );

  const vacunasFiltradas = vacunas.filter((v) => {
    const texto = busqueda.toLowerCase();
    return (
      v.nombre?.toLowerCase().includes(texto) ||
      (v.fecha_aplicacion && formatFecha(v.fecha_aplicacion).includes(texto))
    );
  });

  return (
    <View style={styles.container}>
      {/* Buscador */}
      <View style={styles.buscadorRow}>
        <View style={styles.buscadorContainer}>
          <Feather
            name="search"
            size={18}
            color={Colors.textFaint}
            style={{ marginRight: 6 }}
          />
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder={t("placeholderBuscarVacuna")}
            style={styles.buscadorInput}
            placeholderTextColor={Colors.textFaint}
          />
        </View>
        <TouchableOpacity
          style={styles.btnAgregar}
          onPress={() => setModalAgregar(true)}
        >
          <Text style={styles.btnAgregarTexto}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={{ marginTop: 32 }}
        />
      ) : (
        <FlatList
          data={vacunasFiltradas}
          keyExtractor={(item) => item.id_vacuna.toString()}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.sinResultados}>{t("textNoVacunas")}</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setVacunaSeleccionada(item)}
              activeOpacity={0.75}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardProcedimiento} numberOfLines={1}>
                  {item.nombre}
                </Text>
                <Text style={styles.cardFecha}>
                  {item.fecha_aplicacion
                    ? formatFecha(item.fecha_aplicacion)
                    : t("sinFecha")}
                </Text>
              </View>
              <View style={styles.cardRight}>
                {item.requiere_prox_dosis && item.fecha_prox_dosis && (
                  <View style={styles.badgeProxima}>
                    <Text style={styles.badgeProximaTexto}>
                      {t("proximaDosis")}: {formatFecha(item.fecha_prox_dosis)}
                    </Text>
                  </View>
                )}
                <Feather
                  name="chevron-right"
                  size={18}
                  color={Colors.textFaint}
                />
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal agregar */}
      <ModalAgregarVacuna
        visible={modalAgregar}
        onClose={() => setModalAgregar(false)}
        onCreada={cargarVacunas}
        animalId={animalId}
      />

      {/* Modal detalle */}
      <ModalDetalleVacuna
        visible={vacunaSeleccionada !== null}
        onClose={() => setVacunaSeleccionada(null)}
        vacuna={vacunaSeleccionada}
        onActualizada={cargarVacunas}
        onEliminada={() => {
          setVacunaSeleccionada(null);
          cargarVacunas();
        }}
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
