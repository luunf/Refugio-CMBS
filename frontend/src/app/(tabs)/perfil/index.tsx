import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { api } from "@/config/api";
import { useAuth } from "@/context/AuthContext";
import RolSelector from "@/components/personas/RolSelector";
import { Colors } from "@/constants/theme";

import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import { router } from "expo-router";
import {
  sendPasswordResetEmail,
} from "firebase/auth";


export default function PerfilScreen() {
  const { usuario, recargar } = useAuth();
  const { t } = useTranslation("perfil");

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [rolIds, setRolIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [editando, setEditando] = useState(false);

  const [original, setOriginal] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    rolIds: [] as number[],
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
          rolIds:
            data.roles
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
      Alert.alert("Error", t("camposObligatorios"));
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

      setOriginal({
        nombre,
        apellido,
        telefono,
        direccion,
        rolIds,
      });

      setEditando(false);

      Alert.alert(t("perfilActualizado"));
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.error ?? t("errorActualizar")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPassword =
    async () => {

      if (!usuario?.email) return;

      try {

        await sendPasswordResetEmail(
          auth,
          usuario.email
        );
        console.log(
          "Firebase Project:",
          auth.app.options.projectId
        );

        console.log(
          "Email:",
          usuario.email
        );

        Alert.alert(
          t("exito"),
          t("passwordResetOk")
        );

      } catch {

        Alert.alert(
          t("error"),
          t("passwordResetError")
        );
      }
    };
  const handleLogout = async () => {
    try {

      await signOut(auth);


      router.replace("/login");
    } catch (error) {
      console.error(error);

      Alert.alert(
        t("error"),
        t("logoutError")
      );
    }
  };

  if (loadingDatos) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={{ marginTop: 60 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTexto}>{t("title")}</Text>

        {!editando && (
          <TouchableOpacity
            onPress={() => setEditando(true)}
            style={styles.btnEditarHeader}
          >
            <Text style={styles.btnEditarHeaderTexto}>
              {t("editar")}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>
              {nombre ? nombre.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>

          <Text style={styles.emailTexto}>
            {usuario?.email}
          </Text>

          <View style={styles.tipoBadge}>
            <Text style={styles.tipoTexto}>
              {usuario?.tipo}
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>{t("nombre")}</Text>

          {editando ? (
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              style={styles.input}
              placeholderTextColor={Colors.textFaint}
            />
          ) : (
            <View style={styles.valorContainer}>
              <Text style={styles.valorTexto}>
                {nombre || t("sinDato")}
              </Text>
            </View>
          )}

          <Text style={styles.label}>{t("apellido")}</Text>

          {editando ? (
            <TextInput
              value={apellido}
              onChangeText={setApellido}
              style={styles.input}
              placeholderTextColor={Colors.textFaint}
            />
          ) : (
            <View style={styles.valorContainer}>
              <Text style={styles.valorTexto}>
                {apellido || t("sinDato")}
              </Text>
            </View>
          )}

          <Text style={styles.label}>{t("telefono")}</Text>

          {editando ? (
            <TextInput
              value={telefono}
              onChangeText={setTelefono}
              style={styles.input}
              keyboardType="phone-pad"
              placeholderTextColor={Colors.textFaint}
            />
          ) : (
            <View style={styles.valorContainer}>
              <Text style={styles.valorTexto}>
                {telefono || t("sinDato")}
              </Text>
            </View>
          )}

          <Text style={styles.label}>{t("direccion")}</Text>

          {editando ? (
            <TextInput
              value={direccion}
              onChangeText={setDireccion}
              style={styles.input}
              placeholderTextColor={Colors.textFaint}
            />
          ) : (
            <View style={styles.valorContainer}>
              <Text style={styles.valorTexto}>
                {direccion || t("sinDato")}
              </Text>
            </View>
          )}

          <Text style={styles.label}>{t("roles")}</Text>

          {editando ? (
            <RolSelector
              value={rolIds}
              onChange={setRolIds}
              excluir={["voluntario"]}
              placeholder={t("seleccionarRoles")}
            />
          ) : (
            <View style={styles.valorContainer}>
              <Text style={styles.valorTexto}>
                {usuario?.roles
                  ?.filter((r) => r !== "voluntario")
                  .join(", ") || t("sinDato")}
              </Text>
            </View>
          )}

          {editando && (
            <View style={styles.botonesRow}>
              <TouchableOpacity
                onPress={handleCancelar}
                style={styles.btnCancelar}
              >
                <Text style={styles.btnCancelarTexto}>
                  {t("cancelar")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGuardar}
                disabled={loading}
                style={styles.btnGuardar}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.btnGuardarTexto}>
                    {t("guardar")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

        {/* BOTON CERRAR SESION */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>
            {t("cerrarSesion")}
          </Text>
        </TouchableOpacity>

        {/* BOTON CAMBIAR CONTRASEÑA */}
        <TouchableOpacity
          style={styles.passwordBtn}
          onPress={handleCambiarPassword}
        >
          <Text style={styles.passwordText}>
            {t("cambiarContrasena")}
          </Text>
        </TouchableOpacity>

      </View>

        <View style={{ height: 32 }} />
      </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTexto: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  btnEditarHeader: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },

  btnEditarHeaderTexto: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },

  avatarContainer: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  avatarTexto: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },

  emailTexto: {
    color: Colors.textMuted,
    fontSize: 14,
  },

  tipoBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  tipoTexto: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },

  form: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  label: {
    fontWeight: "600",
    marginBottom: 6,
    color: Colors.textSoft,
    fontSize: 14,
    marginTop: 4,
  },

  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 16,
    fontSize: 14,
    color: Colors.text,
  },

  valorContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 16,
  },

  valorTexto: {
    fontSize: 14,
    color: Colors.text,
  },

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
    backgroundColor: Colors.borderLight,
  },

  btnCancelarTexto: {
    color: Colors.textSoft,
    fontWeight: "600",
    fontSize: 16,
  },

  btnGuardar: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
  },

  btnGuardarTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  logoutBtn: {
    backgroundColor: "#dc2626",
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  logoutText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  passwordBtn: {
    backgroundColor: Colors.primary,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  passwordText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});