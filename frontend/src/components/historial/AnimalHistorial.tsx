import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import { api } from "@/config/api";
import { Colors } from "@/constants/theme";
import { useTranslation } from "react-i18next";
import Feather from "@expo/vector-icons/build/Feather";
import { MaterialIcons } from "@expo/vector-icons";
import ModalAgregarHistorial from "@/components/historial/ModalAgregarHistorial";
import ModalEditarHistorial from "@/components/historial/ModalEditarHistorial";


interface RegistroHistorial {
  id: number;
  estado_id: number;
  estado_nombre: string;
  fecha_desde: string;
  fecha_hasta: string | null;
  persona: { id_persona: number; nombre: string; apellido: string } | null;
}

interface Props {
  animalId: number;
  onCambioHistorial: () => void;
}

const ESTADOS_CON_PERSONA = ["En tránsito", "Adoptado"];

function formatFecha(fechaStr?: string | null): string {
  if (!fechaStr) return "";
  const [year, month, day] = fechaStr.split("-");
  return `${parseInt(day)}/${parseInt(month)}/${year}`;
}

export default function AnimalHistorial({ animalId, onCambioHistorial }: Props) {
  const { t } = useTranslation("animales");

  const [historial, setHistorial] = useState<RegistroHistorial[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalEditar, setModalEditar] = useState<RegistroHistorial | null>(null);

  const cargarHistorial = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getHistorialAnimal(animalId);
      setHistorial(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
    onCambioHistorial?.();
  }, [animalId, onCambioHistorial]);

  useFocusEffect(
    useCallback(() => {
      cargarHistorial();
    }, [cargarHistorial])
  );

  const handleCambio = useCallback(() => {
    cargarHistorial();
    onCambioHistorial();
  }, [cargarHistorial, onCambioHistorial]);

  const historialFiltrado = historial.filter((h) => {
    const textoBusqueda = busqueda.toLowerCase();
    return (
      h.estado_nombre?.toLowerCase().includes(textoBusqueda) ||
      formatFecha(h.fecha_desde).includes(textoBusqueda) ||
      formatFecha(h.fecha_hasta).includes(textoBusqueda)
    );
  });

  const handleAgregar = () => {
    setModalAgregar(true);
  };

  const handleEditar = (registro: RegistroHistorial) => {
    setModalEditar(registro);
  };

  const handleEliminar = (registro: RegistroHistorial) => {
    Alert.alert(
      t("confirmTitleEliminarHistorial"),
      t("confirmMessageEliminarHistorial", { estado: registro.estado_nombre }),
      [
        { text: t("btnCancelar"), style: "cancel" },
        {
          text: t("btnEliminar"),
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteHistorial(registro.id);
              cargarHistorial();
            } catch (e: any) {
              Alert.alert(t("error"), e?.response?.data?.error ?? t("errorEliminarHistorial"));
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Buscador */}
      <View style={styles.buscadorRow}>
        <View style={styles.buscadorContainer}>
          <Feather name="search" size={18} color={Colors.textFaint} style={{ marginRight: 6 }} />
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder={t("placeholderBuscarHistorial")}
            style={styles.buscadorInput}
            placeholderTextColor={Colors.textFaint}
          />
        </View>
        <TouchableOpacity style={styles.btnAgregar} onPress={() => setModalAgregar(true)}>
          <Text style={styles.btnAgregarTexto}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={historialFiltrado}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.sinResultados}>{t("textNoHistorial")}</Text>
          }
          renderItem={({ item }) => {
            const mostrarPersona =
              ESTADOS_CON_PERSONA.includes(item.estado_nombre) && item.persona;

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardEstado} numberOfLines={1}>
                    {item.estado_nombre}
                  </Text>

                  <View style={styles.cardAcciones}>
                    <View
                      style={[
                        styles.estadoBadge,
                        item.fecha_hasta ? styles.badgeCerrado : styles.badgeAbierto,
                      ]}
                    >
                      <Text
                        style={[
                          styles.estadoTexto,
                          item.fecha_hasta ? styles.badgeCerradoTexto : styles.badgeAbiertoTexto,
                        ]}
                      >
                        {item.fecha_hasta ? t("estadoFinalizado") : t("estadoActual")}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleEditar(item)} hitSlop={8}>
                      <MaterialIcons name="edit" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleEliminar(item)} hitSlop={8}>
                      <MaterialIcons name="delete-outline" size={20} color={Colors.primary}/>
                    </TouchableOpacity>
                  </View>
                </View>

                {mostrarPersona && (
                  <Text style={styles.cardPersona}>
                    {item.persona!.nombre} {item.persona!.apellido}
                  </Text>
                )}

                <Text style={styles.cardFechas}>
                  {formatFecha(item.fecha_desde)}
                  {"  -  "}
                  {item.fecha_hasta ? formatFecha(item.fecha_hasta) : t("actualidad")}
                </Text>
              </View>
            );
          }}
        />
      )}

      <ModalAgregarHistorial
        visible={modalAgregar}
        onClose={() => setModalAgregar(false)}
        onCreado={cargarHistorial}
        animalId={animalId}
      />

      <ModalEditarHistorial
        visible={modalEditar !== null}
        onClose={() => setModalEditar(null)}
        onEditado={() => { setModalEditar(null); cargarHistorial(); }}
        registro={modalEditar}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  buscadorRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.surface, gap: 10 },
  buscadorContainer: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: Colors.background, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  buscadorInput: { flex: 1, fontSize: 14, color: Colors.text },
  btnAgregar: { backgroundColor: Colors.primary, width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  btnAgregarTexto: { color: Colors.surface, fontSize: 26, fontWeight: "bold", lineHeight: 30 },
  lista: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 10, gap: 10 },
  card: { backgroundColor: Colors.surface, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, gap: 6, elevation: 1, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardEstado: { flex: 1, fontSize: 15, fontWeight: "600", color: Colors.text },
  cardAcciones: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardPersona: { fontSize: 13, color: Colors.textSoft },
  cardFechas: { fontSize: 13, color: Colors.textFaint },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  estadoTexto: { fontSize: 11, fontWeight: "600" },
  badgeAbierto: { backgroundColor: Colors.primaryLight },
  badgeAbiertoTexto: { color: Colors.primary },
  badgeCerrado: { backgroundColor: "#e5e7eb" },
  badgeCerradoTexto: { color: Colors.textMuted },
  sinResultados: { textAlign: "center", color: Colors.textFaint, marginTop: 40, fontSize: 15 },
});