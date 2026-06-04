import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, TextInput, FlatList, Image,
  Modal, Pressable
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import ModalAgregarAnimal from "@/components/animales/ModalAgregarAnimal";

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

const FILTROS_TIPO = [
  { label: "Todos", valor: null },
  { label: "Perro", valor: "perro" },
  { label: "Gato", valor: "gato" },
];

export default function AnimalesScreen() {

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

  useEffect(() => {
    cargarAnimales();
  }, [cargarAnimales]);

  const animalesFiltrados = animales.filter((a) =>
    a.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Animales</Text>
      </View>

      {/* Buscador */}
      <View style={styles.buscadorRow}>
      <View style={styles.buscadorContainer}>
        <Text style={styles.buscadorIcono}>🔍</Text>
        <TextInput
        value={busqueda}
        onChangeText={setBusqueda}
        placeholder="Buscar..."
        style={styles.buscadorInput}
        placeholderTextColor="#9ca3af"
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
            {filtroTipo ? FILTROS_TIPO.find((f) => f.valor === filtroTipo)?.label : "Tipo: Todos"}
          </Text>
          <Text style={filtroTipo ? styles.filtroTextoActivo : styles.filtroTexto}> ▾</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filtroBadge, filtroEstado && styles.filtroBadgeActivo]}
          onPress={() => setModalEstado(true)}
        >
          <Text style={filtroEstado ? styles.filtroTextoActivo : styles.filtroTexto}>
            {filtroEstado ? filtroEstado.nombre : "Estado: Todos"}
          </Text>
          <Text style={filtroEstado ? styles.filtroTextoActivo : styles.filtroTexto}> ▾</Text>
        </TouchableOpacity>
      </View>

      {/* Grilla */}
      {loading ? (
        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={animalesFiltrados}
          keyExtractor={(item) => item.id_animal.toString()}
          numColumns={2}
          contentContainerStyle={styles.grilla}
          columnWrapperStyle={styles.columna}
          ListEmptyComponent={
            <Text style={styles.sinResultados}>No hay animales</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => {}}>
              <Image
                source={
                  item.url_imagen
                    ? { uri: item.url_imagen }
                    : item.tipo === "perro"
                      ? require("@/assets/images/icono-perro.png")
                      : require("@/assets/images/icono-gato.png")
                }
                style={[styles.cardImagen, { flex: 1 }]}
                resizeMode="cover"
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
            <Text style={styles.modalTitulo}>Filtrar por tipo</Text>
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
            <Text style={styles.modalTitulo}>Filtrar por estado</Text>
            <TouchableOpacity
              style={[styles.modalOpcion, filtroEstado === null && styles.modalOpcionActiva]}
              onPress={() => { setFiltroEstado(null); setModalEstado(false); }}
            >
              <Text style={filtroEstado === null ? styles.modalOpcionTextoActivo : styles.modalOpcionTexto}>
                Todos
              </Text>
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
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: { backgroundColor: "#f97316", paddingHorizontal: 16, paddingVertical: 16 },
  headerText: { color: "white", fontSize: 24, fontWeight: "bold" },
  buscadorRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: "#f3f4f6", gap: 10,
  },
  buscadorContainer: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: "white", borderRadius: 25,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: "#e5e7eb",
  },
  buscadorInput: { flex: 1, fontSize: 14, color: "#111827" },
  buscadorIcono: { fontSize: 16 },
  btnAgregar: {
    backgroundColor: "#f97316", width: 44, height: 44,
    borderRadius: 22, alignItems: "center", justifyContent: "center",
  },
  btnAgregarTexto: { color: "white", fontSize: 26, fontWeight: "bold", lineHeight: 30 },
  filtrosRow: { flexDirection: "row", paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
  filtroBadge: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: "white",
    borderWidth: 1, borderColor: "#e5e7eb",
  },
  filtroBadgeActivo: { backgroundColor: "#f97316", borderColor: "#f97316" },
  filtroTexto: { color: "#374151", fontSize: 14, fontWeight: "600" },
  filtroTextoActivo: { color: "white", fontSize: 14, fontWeight: "600" },
  grilla: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  columna: { justifyContent: "space-between", marginBottom: 16 },
  card: { width: "48%", backgroundColor: "white", borderRadius: 16, overflow: "hidden", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardImagen: { width: "100%", height: 150},
  cardFooter: { backgroundColor: "#f97316", paddingHorizontal: 12, paddingVertical: 8, height: 70 },
  cardNombre: { color: "white", fontWeight: "bold", fontSize: 15 },
  cardEstado: { color: "white", fontSize: 11, opacity: 0.85, marginTop: 2 },
  sinResultados: { textAlign: "center", color: "#9ca3af", marginTop: 40, fontSize: 16 },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center", alignItems: "center",
  },
  modalContenido: { backgroundColor: "white", borderRadius: 16, padding: 20, width: "75%" },
  modalTitulo: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 },
  modalOpcion: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginBottom: 6 },
  modalOpcionActiva: { backgroundColor: "#ffedd5" },
  modalOpcionTexto: { fontSize: 15, color: "#374151" },
  modalOpcionTextoActivo: { fontSize: 15, color: "#f97316", fontWeight: "700" },
});