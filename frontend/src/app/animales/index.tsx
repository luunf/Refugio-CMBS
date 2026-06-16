import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, TextInput, FlatList, 
  Modal, Pressable
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import ModalAgregarAnimal from "@/components/animales/ModalAgregarAnimal";
import { Colors } from '@/constants/theme';
import { router, useFocusEffect } from "expo-router";
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import Feather from "@expo/vector-icons/build/Feather";


interface Animal {
  id_animal: number;
  nombre: string;
  tipo: string;
  url_imagen?: string;
  estados: { id_estado: number; nombre: string }[];
}

interface Estado {
  id_estado: number;
  nombre: string;
}

export default function AnimalesScreen() {

  const { t } = useTranslation('animales');

  const FILTROS_TIPO = [
    { label: t('optionTodos'), valor: null },
    { label: t('optionPerro'), valor: "perro" },
    { label: t('optionGato'), valor: "gato" },
  ];

  const [animales, setAnimales] = useState<Animal[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<Estado | null>(null);
  const [modalTipo, setModalTipo] = useState(false);
  const [modalEstado, setModalEstado] = useState(false);
  const [modalAgregar, setModalAgregar] = useState(false);

  const cargarEstados = async () => {
    try {
      const data = await api.getEstados();
      setEstados(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const cargarAnimales = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAnimales(
        filtroTipo ?? undefined,
        filtroEstado?.id_estado ?? undefined
      );
      setAnimales(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filtroTipo, filtroEstado]);

  useEffect(() => {
    cargarEstados();
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarAnimales();
    }, [cargarAnimales])
  );

  const animalesFiltrados = animales.filter((a) =>
    a.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{t("title")}</Text>
      </View>

      {/* Buscador */}
      <View style={styles.buscadorRow}>
      <View style={styles.buscadorContainer}>
        <Feather name="search" size={18} color={Colors.textFaint} style={{ marginRight: 6 }}/>
        <TextInput
        value={busqueda}
        onChangeText={setBusqueda}
        placeholder={t('placeholderBuscarAnimal')}
        style={styles.buscadorInput}
        placeholderTextColor={Colors.textFaint}
        />
      </View>
      <TouchableOpacity style={styles.btnAgregar} onPress={() => setModalAgregar(true)}>
        <Text style={styles.btnAgregarTexto}>+</Text>
      </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosRow}>
        <TouchableOpacity
          style={[styles.filtroBadge, filtroTipo && styles.filtroBadgeActivo]}
          onPress={() => setModalTipo(true)}
        >
          <Text style={filtroTipo ? styles.filtroTextoActivo : styles.filtroTexto}>
            {filtroTipo ? FILTROS_TIPO.find((f) => f.valor === filtroTipo)?.label : t('filterTipo')}
          </Text>
          <Text style={filtroTipo ? styles.filtroTextoActivo : styles.filtroTexto}></Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filtroBadge, filtroEstado && styles.filtroBadgeActivo]}
          onPress={() => setModalEstado(true)}
        >
          <Text style={filtroEstado ? styles.filtroTextoActivo : styles.filtroTexto}>
            {filtroEstado ? filtroEstado.nombre : t('filterEstado')}
          </Text>
          <Text style={filtroEstado ? styles.filtroTextoActivo : styles.filtroTexto}></Text>
        </TouchableOpacity>
      </View>

      {/* Grilla */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={animalesFiltrados}
          keyExtractor={(item) => item.id_animal.toString()}
          numColumns={2}
          contentContainerStyle={styles.grilla}
          columnWrapperStyle={styles.columna}
          ListEmptyComponent={
            <Text style={styles.sinResultados}>{t('sinResultados')}</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => {router.push(`/animales/${item.id_animal}`)}}>
              <Image
                source={
                  item.url_imagen
                    ? { uri: item.url_imagen }
                    : item.tipo === "perro"
                      ? require("@/assets/images/icono-perro.png")
                      : require("@/assets/images/icono-gato.png")
                }
                style={[styles.cardImagen, { flex: 1 }]}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <View style={styles.cardFooter}>
                <Text style={styles.cardNombre}>{item.nombre}</Text>
                {item.estados?.length > 0 && (
                  <Text style={styles.cardEstado}>
                    {item.estados.map((e) => e.nombre).join(" · ")}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal Tipo */}
      <Modal visible={modalTipo} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalTipo(false)}>
          <View style={styles.modalContenido}>
            <Text style={styles.modalTitulo}>{t('titleFiltrarPorTipo')}</Text>
            {FILTROS_TIPO.map((f) => (
              <TouchableOpacity
                key={f.label}
                style={[styles.modalOpcion, filtroTipo === f.valor && styles.modalOpcionActiva]}
                onPress={() => { setFiltroTipo(f.valor); setModalTipo(false); }}
              >
                <Text style={filtroTipo === f.valor ? styles.modalOpcionTextoActivo : styles.modalOpcionTexto}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Modal Estado */}
      <Modal visible={modalEstado} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalEstado(false)}>
          <View style={styles.modalContenido}>
            <Text style={styles.modalTitulo}>{t('titleFiltrarPorEstado')}</Text>
            <TouchableOpacity
              style={[styles.modalOpcion, filtroEstado === null && styles.modalOpcionActiva]}
              onPress={() => { setFiltroEstado(null); setModalEstado(false); }}
            >
              <Text style={filtroEstado === null ? styles.modalOpcionTextoActivo : styles.modalOpcionTexto}>{t('optionTodos')}</Text>
            </TouchableOpacity>
            {estados.map((e) => (
              <TouchableOpacity
                key={e.id_estado}
                style={[styles.modalOpcion, filtroEstado?.id_estado === e.id_estado && styles.modalOpcionActiva]}
                onPress={() => { setFiltroEstado(e); setModalEstado(false); }}
              >
                <Text style={filtroEstado?.id_estado === e.id_estado ? styles.modalOpcionTextoActivo : styles.modalOpcionTexto}>
                  {e.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <ModalAgregarAnimal
        visible={modalAgregar}
        onClose={() => setModalAgregar(false)}
        onCreado={cargarAnimales}
      />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 16 },
  headerText: { color: Colors.surface, fontSize: 24, fontWeight: "bold" },
  buscadorRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.surface, gap: 10,
  },
  buscadorContainer: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.background, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  buscadorInput: { flex: 1, fontSize: 14, color: Colors.text },
  btnAgregar: {
    backgroundColor: Colors.primary, width: 40, height: 40,
    borderRadius: 20, alignItems: "center", justifyContent: "center",
  },
  btnAgregarTexto: { color: Colors.surface, fontSize: 26, fontWeight: "bold", lineHeight: 30 },
  filtrosRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.surface, gap: 8 },
  filtroBadge: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: Colors.background,
  },
  filtroBadgeActivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filtroTexto: { color: Colors.textSoft, fontSize: 13, fontWeight: "600" },
  filtroTextoActivo: { color: Colors.surface, fontSize: 14, fontWeight: "600" },
  grilla: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  columna: { justifyContent: "space-between", marginBottom: 16 },
  card: { width: "48%", backgroundColor: Colors.surface, borderRadius: 16, overflow: "hidden", elevation: 2, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardImagen: { width: "100%", height: 150},
  cardFooter: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 8, height: 70 },
  cardNombre: { color: Colors.surface, fontWeight: "bold", fontSize: 15 },
  cardEstado: { color: Colors.surface, fontSize: 11, opacity: 0.85, marginTop: 2 },
  sinResultados: { textAlign: "center", color: Colors.textFaint, marginTop: 40, fontSize: 16 },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center", alignItems: "center",
  },
  modalContenido: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, width: "75%" },
  modalTitulo: { fontSize: 16, fontWeight: "700", color: Colors.text, marginBottom: 12 },
  modalOpcion: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginBottom: 6 },
  modalOpcionActiva: { backgroundColor: Colors.primaryFaint },
  modalOpcionTexto: { fontSize: 15, color: Colors.textSoft},
  modalOpcionTextoActivo: { fontSize: 15, color: Colors.primary, fontWeight: "700" },
});