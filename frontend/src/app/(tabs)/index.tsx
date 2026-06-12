import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import {
  MaterialCommunityIcons,
  Feather
} from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

const BOTONES_BASE = [
  {
    label: "Animales",
    icono: (
      <MaterialCommunityIcons
        name="paw"
        size={48}
        color={Colors.primary}
      />
    ),
    ruta: "/animales",
  },
  {
    label: "Calendario",
    icono: (
      <Feather
        name="calendar"
        size={48}
        color={Colors.primary}
      />
    ),
    ruta: "/calendario",
  },
  {
    label: "Tratamientos",
    icono: (
      <MaterialCommunityIcons
        name="medical-bag"
        size={48}
        color={Colors.primary}
      />
    ),
    ruta: "/tratamientos",
  },
  {
    label: "Personas",
    icono: (
      <Feather
        name="users"
        size={48}
        color={Colors.primary}
      />
    ),
    ruta: "/personas",
  },
];

const BOTON_USUARIOS = {
  label: "Usuarios",
  icono: (
    <Feather
      name="user"
      size={48}
      color={Colors.primary}
    />
  ),
  ruta: "/usuarios",
};

export default function HomeScreen() {
  const { usuario, esAdmin } = useAuth();

  const botones = esAdmin ? [...BOTONES_BASE, BOTON_USUARIOS] : BOTONES_BASE;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTexto}>Opciones:</Text>
      </View>

      {/* Grilla */}
      <ScrollView contentContainerStyle={styles.grilla}>
        {botones.map((btn) => (
          <TouchableOpacity
            key={btn.label}
            style={styles.boton}
            onPress={() => router.push(btn.ruta as any)}
            activeOpacity={0.7}
          >
            <View>{btn.icono}</View>
            <Text style={styles.botonLabel}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    paddingVertical: 20,
    alignItems: "center",
  },
  headerTexto: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
  },
  grilla: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 16,
    justifyContent: "center",
  },
  boton: {
    width: "44%",
    aspectRatio: 1,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  botonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
});
