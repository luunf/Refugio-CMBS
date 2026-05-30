import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import RolSelector from "@/components/personas/RolSelector";

export default function PerfilScreen() {
  const { usuario, recargar } = useAuth();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [rolIds, setRolIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [editando, setEditando] = useState(false);

  const [original, setOriginal] = useState({
    nombre: "", apellido: "", telefono: "", direccion: "", rolIds: [] as number[]
  });

  useEffect(() => {
    const cargar = async () => {
      if (!usuario?.persona_id) {
        setLoadingDatos(false);
        return;
      }
      try {
        const data = await api.getPersona(usuario.persona_id);
        const valores = {
          nombre: data.nombre ?? "",
          apellido: data.apellido ?? "",
          telefono: data.telefono ?? "",
          direccion: data.direccion ?? "",
          rolIds: data.roles
            ?.filter((r: any) => r.nombre !== "voluntario")
            .map((r: any) => r.id_rol) ?? [],
        };
        setNombre(valores.nombre);
        setApellido(valores.apellido);
        setTelefono(valores.telefono);
        setDireccion(valores.direccion);
        setRolIds(valores.rolIds);
        setOriginal(valores);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDatos(false);
      }
    };
    cargar();
  }, [usuario]);

  const handleCancelar = () => {
    setNombre(original.nombre);
    setApellido(original.apellido);
    setTelefono(original.telefono);
    setDireccion(original.direccion);
    setRolIds(original.rolIds);
    setEditando(false);
  };

  const handleGuardar = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert("Error", "Nombre y apellido son obligatorios");
      return;
    }
    if (!usuario?.persona_id) return;

    setLoading(true);
    try {
      await api.updatePersona(usuario.persona_id, {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim() || null,
        direccion: direccion.trim() || null,
        roles: rolIds,
      });
      await recargar();
      setOriginal({ nombre, apellido, telefono, direccion, rolIds });
      setEditando(false);
      Alert.alert("✓", "Perfil actualizado correctamente");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "No se pudo actualizar");
    } finally {
      setLoading(false);
    }
  };

  if (loadingDatos) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTexto}>Mi perfil</Text>
        {!editando && (
          <TouchableOpacity onPress={() => setEditando(true)} style={styles.btnEditarHeader}>
            <Text style={styles.btnEditarHeaderTexto}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>
              {nombre ? nombre.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>
          <Text style={styles.emailTexto}>{usuario?.email}</Text>
          <View style={styles.tipoBadge}>
            <Text style={styles.tipoTexto}>{usuario?.tipo}</Text>
          </View>
        </View>

        {/* Formulario */}
        <View style={styles.form}>

          <Text style={styles.label}>Nombre</Text>
          {editando ? (
            <TextInput value={nombre} onChangeText={setNombre} style={styles.input} placeholderTextColor="#9ca3af" />
          ) : (
            <View style={styles.valorContainer}>
              <Text style={styles.valorTexto}>{nombre || "—"}</Text>
            </View>
          )}

          <Text style={styles.label}>Apellido</Text>
          {editando ? (
            <TextInput value={apellido} onChangeText={setApellido} style={styles.input} placeholderTextColor="#9ca3af" />
          ) : (
            <View style={styles.valorContainer}>
              <Text style={styles.valorTexto}>{apellido || "—"}</Text>
            </View>
          )}

          <Text style={styles.label}>Teléfono</Text>
          {editando ? (
            <TextInput value={telefono} onChangeText={setTelefono} style={styles.input} keyboardType="phone-pad" placeholderTextColor="#9ca3af" />
          ) : (
            <View style={styles.valorContainer}>
              <Text style={styles.valorTexto}>{telefono || "—"}</Text>
            </View>
          )}

          <Text style={styles.label}>Dirección</Text>
          {editando ? (
            <TextInput value={direccion} onChangeText={setDireccion} style={styles.input} placeholderTextColor="#9ca3af" />
          ) : (
            <View style={styles.valorContainer}>
              <Text style={styles.valorTexto}>{direccion || "—"}</Text>
            </View>
          )}

          <Text style={styles.label}>Roles</Text>
          {editando ? (
            <RolSelector value={rolIds} onChange={setRolIds} placeholder="Seleccionar roles" />
          ) : (
            <View style={styles.valorContainer}>
              <Text style={styles.valorTexto}>
                {usuario?.roles?.filter(r => r !== "voluntario").join(", ") || "—"}
              </Text>
            </View>
          )}

          {editando && (
            <View style={styles.botonesRow}>
              <TouchableOpacity onPress={handleCancelar} style={styles.btnCancelar}>
                <Text style={styles.btnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleGuardar} disabled={loading} style={styles.btnGuardar}>
                {loading
                  ? <ActivityIndicator color="white" />
                  : <Text style={styles.btnGuardarTexto}>Guardar</Text>
                }
              </TouchableOpacity>
            </View>
          )}

        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: {
    backgroundColor: "#f97316",
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTexto: { color: "white", fontSize: 24, fontWeight: "bold" },
  btnEditarHeader: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  btnEditarHeaderTexto: { color: "white", fontWeight: "600", fontSize: 14 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  avatarContainer: { alignItems: "center", paddingVertical: 24, gap: 8 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarTexto: { color: "white", fontSize: 32, fontWeight: "bold" },
  emailTexto: { color: "#6b7280", fontSize: 14 },
  tipoBadge: {
    backgroundColor: "#ffedd5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tipoTexto: { color: "#f97316", fontWeight: "600", fontSize: 13 },
  form: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  label: { fontWeight: "600", marginBottom: 6, color: "#374151", fontSize: 14, marginTop: 4 },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 16,
    fontSize: 14,
    color: "#111827",
  },
  valorContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 16,
  },
  valorTexto: { fontSize: 14, color: "#111827" },
  botonesRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  btnCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  btnCancelarTexto: { color: "#374151", fontWeight: "600", fontSize: 16 },
  btnGuardar: {
    flex: 1,
    backgroundColor: "#f97316",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
  },
  btnGuardarTexto: { color: "white", fontWeight: "bold", fontSize: 16 },
});
