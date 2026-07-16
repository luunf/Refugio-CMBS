import React, {
  useEffect,
  useState,
} from "react";

import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useTranslation } from "react-i18next";

import { api } from "@/config/api";
import { Colors } from "@/constants/theme";

interface Usuario {
  id_usuario: number;
  email: string;
  tipo: string;
  activo: boolean;
}

interface Props {
  visible: boolean;
  usuario: Usuario | null;
  onClose: () => void;
  onActualizado: () => void;
}

export default function ModalEditarUsuario({
  visible,
  usuario,
  onClose,
  onActualizado,
}: Props) {
  const { t } =
    useTranslation("usuarios");

  const [tipo, setTipo] =
    useState("estandar");

  const [activo, setActivo] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (!usuario) return;

    setTipo(usuario.tipo);
    setActivo(usuario.activo);
  }, [usuario]);

  const guardar = async () => {
    if (!usuario) return;

    setLoading(true);
    console.log("Enviando:", { tipo, activo });

    try {
      await api.updateUsuario(
        usuario.id_usuario,
        {
          tipo,
          activo,
        }
      );

      onActualizado();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>

          <Text style={styles.title}>
            {t("editarUsuario")}
          </Text>

          <Text style={styles.email}>
            {usuario?.email}
          </Text>

          <Text style={styles.label}>
            {t("tipo")}
          </Text>

          <View style={styles.row}>

            <TouchableOpacity
              style={[
                styles.option,
                tipo === "estandar" &&
                  styles.selected,
              ]}
              onPress={() =>
                setTipo("estandar")
              }
            >
              <Text>
                {t("estandar")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                tipo === "admin" &&
                  styles.selected,
              ]}
              onPress={() =>
                setTipo("admin")
              }
            >
              <Text>
                {t("admin")}
              </Text>
            </TouchableOpacity>

          </View>

          <Text style={styles.label}>
            {t("estado")}
          </Text>

          <View style={styles.row}>

            <TouchableOpacity
              style={[
                styles.option,
                activo &&
                  styles.selected,
              ]}
              onPress={() =>
                setActivo(true)
              }
            >
              <Text>
                {t("activo")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                !activo &&
                  styles.selected,
              ]}
              onPress={() =>
                setActivo(false)
              }
            >
              <Text>
                {t("inactivo")}
              </Text>
            </TouchableOpacity>

          </View>

          <TouchableOpacity
            style={styles.btn}
            onPress={guardar}
          >
            {loading ? (
              <ActivityIndicator
                color="white"
              />
            ) : (
              <Text
                style={styles.btnText}
              >
                {t("guardar")}
              </Text>
            )}
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:{
    flex:1,
    justifyContent:"flex-end",
    backgroundColor:
      "rgba(0,0,0,.4)",
  },

  container:{
    backgroundColor:"white",
    padding:24,
    borderTopLeftRadius:24,
    borderTopRightRadius:24,
  },

  title:{
    fontSize:20,
    fontWeight:"bold",
  },

  email:{
    marginTop:8,
    marginBottom:20,
    color:"#666",
  },

  label:{
    marginBottom:8,
    fontWeight:"600",
  },

  row:{
    flexDirection:"row",
    gap:8,
    marginBottom:20,
  },

  option:{
    flex:1,
    borderWidth:1,
    borderColor:"#ddd",
    padding:12,
    borderRadius:12,
    alignItems:"center",
  },

  selected:{
    backgroundColor:
      Colors.primaryLight,
  },

  btn:{
    backgroundColor:
      Colors.primary,
    padding:14,
    borderRadius:14,
    alignItems:"center",
  },

  btnText:{
    color:"white",
    fontWeight:"bold",
  },
});