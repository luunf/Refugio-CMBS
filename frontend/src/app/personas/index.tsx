import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import PersonaRow from "@/components/personas/PersonaRow";
import ModalAgregarPersona from "@/components/personas/ModalAgregarPersona";
import ModalEditarPersona from "@/components/personas/ModalEditarPersona";
import ModalVerPersona from "@/components/personas/ModalVerPersona";
import ModalCrearUsuario from "@/components/personas/ModalCrearUsuario";

const FILTROS_ROL = [
  { label: "Todos", valor: "Todos" },
  { label: "Veterinario", valor: "veterinario" },
  { label: "Voluntario", valor: "voluntario" },
  { label: "Adoptante", valor: "adoptante" },
  { label: "Hogar de tránsito", valor: "hogar_transito" },
];

interface Persona {
  id_persona: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  roles: { id_rol: number; nombre: string }[];
}

export default function PersonasScreen() {
  const { esAdmin } = useAuth();

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("Todos");

  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalVer, setModalVer] = useState(false);
  const [modalUsuario, setModalUsuario] = useState(false);
  const [personaSeleccionada, setPersonaSeleccionada] = useState<Persona | null>(null);

  const cargarPersonas = useCallback(async () => {
    setLoading(true);
    try {
      const rol = filtroRol !== "Todos" ? filtroRol.toLowerCase() : undefined;
      const data = await api.getPersonas(rol);
      setPersonas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filtroRol]);

  useEffect(() => {
    cargarPersonas();
  }, [cargarPersonas]);

  const personasFiltradas = personas.filter((p) => {
    const texto = busqueda.toLowerCase();
    return (
      p.nombre?.toLowerCase().includes(texto) ||
      p.apellido?.toLowerCase().includes(texto) ||
      p.email?.toLowerCase().includes(texto)
    );
  });

  const abrirEditar = (persona: Persona) => {
    setPersonaSeleccionada(persona);
    setModalEditar(true);
  };

  const abrirVer = (persona: Persona) => {
    setPersonaSeleccionada(persona);
    setModalVer(true);
  };

  const abrirCrearUsuario = (persona: Persona) => {
    setPersonaSeleccionada(persona);
    setModalUsuario(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Personas</Text>
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
        <TouchableOpacity
          style={styles.btnAgregar}
          onPress={() => setModalAgregar(true)}
        >
          <Text style={styles.btnAgregarTexto}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtrosGrilla}>
        {FILTROS_ROL.map((f) => (
          <TouchableOpacity
            key={f.valor}
            onPress={() => setFiltroRol(f.valor)}
            style={[styles.filtroBadge, filtroRol === f.valor && styles.filtroBadgeActivo]}
          >
            <Text style={filtroRol === f.valor ? styles.filtroTextoActivo : styles.filtroTexto}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tabla header */}
      <View style={styles.tablaHeader}>
        <Text style={[styles.tablaHeaderTexto, { width: 110 }]}>Nombre</Text>
        <Text style={[styles.tablaHeaderTexto, { flex: 1 }]}>Email</Text>
        <Text style={[styles.tablaHeaderTexto, { width: 80 }]}>Acción</Text>
      </View>

      {/* Lista */}
      {loading ? (
        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.lista}>
          {personasFiltradas.length === 0 ? (
            <Text style={styles.sinResultados}>No hay personas</Text>
          ) : (
            personasFiltradas.map((p) => (
              <PersonaRow
                key={p.id_persona}
                persona={p}
                esAdmin={esAdmin}
                onEditar={abrirEditar}
                onVer={abrirVer}
                onEliminada={cargarPersonas}
              />
            ))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* Modals */}
      <ModalAgregarPersona
        visible={modalAgregar}
        onClose={() => setModalAgregar(false)}
        onCreada={cargarPersonas}
      />
      <ModalEditarPersona
        visible={modalEditar}
        persona={personaSeleccionada}
        onClose={() => setModalEditar(false)}
        onActualizada={cargarPersonas}
      />
      <ModalVerPersona
        visible={modalVer}
        persona={personaSeleccionada}
        onClose={() => setModalVer(false)}
      />
      {esAdmin && (
        <ModalCrearUsuario
          visible={modalUsuario}
          onClose={() => setModalUsuario(false)}
          onCreado={cargarPersonas}
        />
      )}
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
  buscadorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    gap: 10,
  },
  buscadorContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buscadorIcono: {
    fontSize: 16,
    marginRight: 6,
  },
  buscadorInput: {
    flex: 1,
    fontSize: 14,
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
  btnAgregarTexto: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 28,
  },
  filtrosGrilla: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "white",
    gap: 8,
  },
  filtroBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  filtroBadgeActivo: {
    backgroundColor: "#f97316",
  },
  filtroTexto: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "500",
  },
  filtroTextoActivo: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  tablaHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffedd5",
    borderBottomWidth: 1,
    borderBottomColor: "#fed7aa",
  },
  tablaHeaderTexto: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  lista: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sinResultados: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 40,
    fontSize: 16,
  },
});
