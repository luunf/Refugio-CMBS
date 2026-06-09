import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { api } from "@/config/api";
import { Colors } from "@/constants/theme";
import AnimalInfo from "@/components/animales/AnimalInfo";

type Pestaña = "informacion" | "ficha" | "vacunas";

interface Animal {
  id_animal: number;
  nombre: string;
  tipo: string;
  genero: string;
  tamanio: string;
  raza?: string;
  colores?: string;
  fecha_nacimiento?: string;
  fecha_ingreso: string;
  info_adicional?: string;
  comportamiento?: string;
  esterilizado: boolean;
  url_imagen?: string;
  estados: { id_estado: number; nombre: string }[];
  compatibilidades: { id_compatibilidad: number; nombre: string }[];
  voluntarios: { id_persona: number; nombre: string; apellido: string }[];
  hogar_transito?: { id_persona: number; nombre: string; apellido: string };
  adoptante?: { id_persona: number; nombre: string; apellido: string };
}

export default function AnimalDetalleScreen() {
  const { animalId } = useLocalSearchParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [pestaña, setPestaña] = useState<Pestaña>("informacion");

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await api.getAnimal(Number(animalId));
        setAnimal(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [animalId]);

  if (loading) return <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 80 }} />;
  if (!animal) return <Text style={styles.error}>Animal no encontrado</Text>;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Animales</Text>
      </View>

      {/* Foto + nombre + estados */}
      <View style={styles.infoTop}>
        <Image
          source={
            animal.url_imagen
              ? { uri: animal.url_imagen }
              : animal.tipo === "perro"
                ? require("@/assets/images/icono-perro.png")
                : require("@/assets/images/icono-gato.png")
          }
          style={styles.foto}
          resizeMode="cover"
        />
        <View style={styles.infoTopTextos}>
          <View style={styles.nombreRow}>
            <Text style={styles.nombre} numberOfLines={1}>{animal.nombre}</Text>
            <View style={styles.acciones}>
                <TouchableOpacity onPress={() => {}}>
                <Text style={styles.accionIcono}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {}}>
                <Text style={styles.accionIcono}>🗑</Text>
                </TouchableOpacity>
            </View>
            </View>
          <View style={styles.estadosRow}>
            {animal.estados.map((e) => (
              <View key={e.id_estado} style={styles.estadoBadge}>
                <Text style={styles.estadoTexto}>{e.nombre}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Pestañas */}
      <View style={styles.pestañas}>
        {(["informacion", "ficha", "vacunas"] as Pestaña[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.pestaña, pestaña === p && styles.pestañaActiva]}
            onPress={() => setPestaña(p)}
          >
            <Text style={[styles.pestañaTexto, pestaña === p && styles.pestañaTextoActivo]}>
              {p === "informacion" ? "Información" : p === "ficha" ? "Ficha veterinaria" : "Vacunas"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenido */}
      {pestaña === "informacion" && <AnimalInfo animal={animal} />}
      {pestaña === "ficha" && (<Text>Próximamente</Text>)}
      {pestaña === "vacunas" && (<Text>Próximamente</Text>)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 16 },
  headerText: { color: Colors.surface, fontSize: 24, fontWeight: "bold" },
  btnVolver: { width: 36, height: 36, justifyContent: "center" },
  btnVolverTexto: { color: Colors.surface, fontSize: 24 },
  headerTexto: { color: Colors.surface, fontSize: 24, fontWeight: "bold" },
  infoTop: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  foto: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  infoTopTextos: {
    flex: 1,
    gap: 6,
  },
  nombre: { color: Colors.surface, fontSize: 20, fontWeight: "bold" },
  nombreRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  acciones: { flexDirection: "row", gap: 8 },
  accionIcono: { fontSize: 18 },
  estadosRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  estadoBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  estadoTexto: { color: Colors.surface, fontSize: 11, fontWeight: "600" },
  pestañas: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pestaña: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  pestañaActiva: { borderBottomColor: Colors.primary },
  pestañaTexto: { fontSize: 13, fontWeight: "600", color: Colors.textFaint },
  pestañaTextoActivo: { color: Colors.primary },
  error: { textAlign: "center", marginTop: 80, color: Colors.textFaint },
});