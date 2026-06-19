import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { api } from "@/config/api";
import { useAuth } from "@/context/AuthContext";

import { Colors } from "@/constants/theme";

import PersonaRow from "@/components/personas/PersonaRow";
import ModalAgregarPersona from "@/components/personas/ModalAgregarPersona";
import ModalEditarPersona from "@/components/personas/ModalEditarPersona";
import ModalVerPersona from "@/components/personas/ModalVerPersona";
import Feather from "@expo/vector-icons/build/Feather";

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
  const { t } = useTranslation("personas");

  const FILTROS_ROL = [
    { label: t("filtroTodos"), valor: "Todos" },
    { label: t("filtroVeterinario"), valor: "veterinario" },
    { label: t("filtroVoluntario"), valor: "voluntario" },
    { label: t("filtroAdoptante"), valor: "adoptante" },
    { label: t("filtroHogar"), valor: "hogar_transito" },
  ];

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("Todos");

  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalVer, setModalVer] = useState(false);
  const [modalUsuario, setModalUsuario] = useState(false);

  const [personaSeleccionada, setPersonaSeleccionada] =
    useState<Persona | null>(null);

  const cargarPersonas = useCallback(async () => {
    setLoading(true);

    try {
      const rol =
        filtroRol !== "Todos"
          ? filtroRol.toLowerCase()
          : undefined;

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
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.headerText}>
          {t("title")}
        </Text>
      </View>

      {/* BUSCADOR */}

      <View style={styles.buscadorRow}>
        <View style={styles.buscadorContainer}>
          <Feather
              name="search"
              size={18}
              color="#9ca3af"
              style={{ marginRight: 6 }}
            />

          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder={t("buscar")}
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

      {/* FILTROS */}

      <View style={styles.filtrosGrilla}>
        {FILTROS_ROL.map((f) => (
          <TouchableOpacity
            key={f.valor}
            onPress={() => setFiltroRol(f.valor)}
            style={[
              styles.filtroBadge,
              filtroRol === f.valor &&
                styles.filtroBadgeActivo,
            ]}
          >
            <Text
              style={
                filtroRol === f.valor
                  ? styles.filtroTextoActivo
                  : styles.filtroTexto
              }
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* HEADER TABLA */}

      <View style={styles.tablaHeader}>
        <Text
          style={[
            styles.tablaHeaderTexto,
            { width: 110 },
          ]}
        >
          {t("nombre")}
        </Text>

        <Text
          style={[
            styles.tablaHeaderTexto,
            { flex: 1 },
          ]}
        >
          {t("email")}
        </Text>

        <Text
          style={[
            styles.tablaHeaderTexto,
            { width: 80 },
          ]}
        >
          {t("accion")}
        </Text>
      </View>

      {/* LISTA */}

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <ScrollView style={styles.lista}>
          {personasFiltradas.length === 0 ? (
            <Text style={styles.sinResultados}>
              {t("sinResultados")}
            </Text>
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

      {/* MODALS */}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  headerText: {
    color: Colors.surface,
    fontSize: 24,
    fontWeight: "bold",
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

  buscadorIcono: {
    fontSize: 16,
    marginRight: 6,
  },

  buscadorInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },

  btnAgregar: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  btnAgregarTexto: {
    color: Colors.surface,
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 28,
  },

  filtrosGrilla: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    gap: 8,
  },

  filtroBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },

  filtroBadgeActivo: {
    backgroundColor: Colors.primary,
  },

  filtroTexto: {
    color: Colors.textSoft,
    fontSize: 13,
    fontWeight: "500",
  },

  filtroTextoActivo: {
    color: Colors.surface,
    fontSize: 13,
    fontWeight: "600",
  },

  tablaHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  tablaHeaderTexto: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSoft,
  },

  lista: {
    flex: 1,
    paddingHorizontal: 16,
  },

  sinResultados: {
    textAlign: "center",
    color: Colors.textFaint,
    marginTop: 40,
    fontSize: 16,
  },
});