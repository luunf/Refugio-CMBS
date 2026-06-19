import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

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

import Feather from "@expo/vector-icons/Feather";

import { useTranslation } from "react-i18next";

import { api } from "@/config/api";
import { auth } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";

import { Colors } from "@/constants/theme";

import UsuarioRow from "../../components/usuarios/UsuarioRow";
import ModalCrearUsuario from "../../components/usuarios/ModalCrearUsuario";
import ModalEditarUsuario from "../../components/usuarios/ModalEditarUsuario";

interface Usuario {
  id_usuario: number;
  email: string;
  tipo: "admin" | "estandar";
  activo: boolean;

  persona: {
    id_persona: number;
    nombre: string;
    apellido: string;
    telefono?: string;
    direccion?: string;
    email?: string;
  };
}

export default function UsuariosScreen() {
  const { t } = useTranslation("usuarios");

  const { esAdmin } = useAuth();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);

  const [busqueda, setBusqueda] = useState("");

  const [modalCrear, setModalCrear] =
    useState(false);

  const [modalEditar, setModalEditar] =
    useState(false);

  const [usuarioSeleccionado,
    setUsuarioSeleccionado] =
    useState<Usuario | null>(null);

  const cargarUsuarios =
    useCallback(async () => {

      setLoading(true);

      try {

        const data =
          await api.getUsuarios();

        setUsuarios(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }

    }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const usuariosFiltrados =
    usuarios.filter((u) => {

      const texto =
        busqueda.toLowerCase();

      return (
        u.email
          ?.toLowerCase()
          .includes(texto) ||

        u.persona?.nombre
          ?.toLowerCase()
          .includes(texto) ||

        u.persona?.apellido
          ?.toLowerCase()
          .includes(texto)
      );
    });

  const abrirEditar =
    (usuario: Usuario) => {

      setUsuarioSeleccionado(
        usuario
      );

      setModalEditar(true);
    };

  if (!esAdmin) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.sinPermiso}
        >
          <Text
            style={
              styles.sinPermisoTexto
            }
          >
            {t("sinPermiso")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Text
          style={styles.headerText}
        >
          {t("title")}
        </Text>
      </View>

      {/* BUSCADOR */}

      <View
        style={styles.buscadorRow}
      >
        <View
          style={
            styles.buscadorContainer
          }
        >
          <Feather
            name="search"
            size={18}
            color="#9ca3af"
            style={{
              marginRight: 6,
            }}
          />

          <TextInput
            value={busqueda}
            onChangeText={
              setBusqueda
            }
            placeholder={
              t("buscar")
            }
            style={
              styles.buscadorInput
            }
            placeholderTextColor={
              Colors.textFaint
            }
          />
        </View>

        <TouchableOpacity
          style={styles.btnAgregar}
          onPress={() =>
            setModalCrear(true)
          }
        >
          <Text
            style={
              styles.btnAgregarTexto
            }
          >
            +
          </Text>
        </TouchableOpacity>
      </View>

      {/* TABLA */}

      <View
        style={styles.tablaHeader}
      >
        <Text
          style={[
            styles.tablaHeaderTexto,
            {
              width: 120,
            },
          ]}
        >
          {t("nombre")}
        </Text>

        <Text
          style={[
            styles.tablaHeaderTexto,
            {
              flex: 1,
            },
          ]}
        >
          {t("email")}
        </Text>
        
        <Text
          style={[
            styles.tablaHeaderTexto,
            {
              width: 80,
            },
          ]}
        >
          {t("accion")}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={{
            marginTop: 40,
          }}
        />
      ) : (
        <ScrollView
          style={styles.lista}
        >
          {usuariosFiltrados
            .length === 0 ? (
            <Text
              style={
                styles.sinResultados
              }
            >
              {t(
                "sinResultados"
              )}
            </Text>
          ) : (
            usuariosFiltrados.map(
              (usuario) => (
                <UsuarioRow
                  key={
                    usuario.id_usuario
                  }
                  usuario={
                    usuario
                  }
                  onEditar={
                    abrirEditar
                  }
                />
              )
            )
          )}

          <View
            style={{
              height: 30,
            }}
          />
        </ScrollView>
      )}

      <ModalCrearUsuario
        visible={modalCrear}
        onClose={() =>
          setModalCrear(false)
        }
        onCreado={
          cargarUsuarios
        }
      />

      <ModalEditarUsuario
        visible={modalEditar}
        usuario={
          usuarioSeleccionado
        }
        onClose={() =>
          setModalEditar(false)
        }
        onActualizado={
          cargarUsuarios
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor:
      Colors.background,
  },

  header: {
    backgroundColor:
      Colors.primary,
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
    backgroundColor:
      Colors.surface,
    gap: 10,
  },

  buscadorContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      Colors.background,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  buscadorInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },

  btnAgregar: {
    backgroundColor:
      Colors.primary,
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
  },

  tablaHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor:
      Colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor:
      Colors.border,
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
    marginTop: 40,
    color: Colors.textMuted,
  },

  sinPermiso: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  sinPermisoTexto: {
    fontSize: 18,
    color: Colors.textMuted,
  },
});