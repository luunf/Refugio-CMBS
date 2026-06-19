import React, { useState } from "react";

import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";

import { useTranslation } from "react-i18next";

import { api } from "@/config/api";
import { Colors } from "@/constants/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreado: () => void;
}

export default function ModalCrearUsuario({
  visible,
  onClose,
  onCreado,
}: Props) {

  const { t } =
    useTranslation("usuarios");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("Temporal123!");

  const [tipo, setTipo] =
    useState<"admin" | "estandar">(
      "estandar"
    );

  const [loading, setLoading] =
    useState(false);

  const cerrar = () => {

    setEmail("");

    setPassword(
      "Temporal123!"
    );

    setTipo("estandar");

    onClose();
  };

  
  
  const crear = async () => {

    if (!email.trim()) {
        Alert.alert(
        t("error"),
        t("emailObligatorio")
        );
        return;
    }

    setLoading(true);

    try {

        const personaExistente =
        await api.buscarPersonaPorEmail(
            email.trim()
        );

        if (personaExistente) {

        setLoading(false);

        Alert.alert(
            t("personaExisteTitulo"),

            `${personaExistente.nombre ?? ""} ${personaExistente.apellido ?? ""}`,

            [
            {
                text: t("crearOtro"),
                style: "cancel",
            },

            {
                text: t("usarPersona"),

                onPress: async () => {

                try {

                    setLoading(true);

                    await api.createUsuario({
                    email: email.trim(),
                    password,
                    tipo,
                    persona_id:
                        personaExistente.id_persona,
                    });

                    onCreado();
                    cerrar();

                } catch (e: any) {

                    Alert.alert(
                    t("error"),
                    e?.response?.data?.error ??
                        t("errorCrear")
                    );

                } finally {

                    setLoading(false);
                }
                },
            },
            ]
        );

        return;
        }

        await api.createUsuario({
        email: email.trim(),
        password,
        tipo,
        });

        onCreado();
        cerrar();

    } catch (e: any) {

        Alert.alert(
        t("error"),
        e?.response?.data?.error ??
            t("errorCrear")
        );

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
      <View style={styles.overlay}>
        <View style={styles.container}>

          <Text style={styles.titulo}>
            {t("crearUsuario")}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="email@email.com"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>
            {t("tipo")}
          </Text>

          <View style={styles.row}>

            <TouchableOpacity
              style={[
                styles.tipoBtn,
                tipo === "estandar" &&
                  styles.tipoActivo,
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
                styles.tipoBtn,
                tipo === "admin" &&
                  styles.tipoActivo,
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

          <TouchableOpacity
            style={styles.btnGuardar}
            onPress={crear}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color="white"
              />
            ) : (
              <Text
                style={
                  styles.btnTexto
                }
              >
                {t("crear")}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={cerrar}
          >
            <Text
              style={styles.cancelar}
            >
              {t("cancelar")}
            </Text>
          </TouchableOpacity>

        </View>
      </View>
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

  titulo:{
    fontSize:20,
    fontWeight:"bold",
    marginBottom:16,
  },

  input:{
    borderWidth:1,
    borderColor:"#ddd",
    borderRadius:12,
    padding:12,
    marginBottom:12,
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

  tipoBtn:{
    flex:1,
    borderWidth:1,
    borderColor:"#ddd",
    padding:12,
    borderRadius:12,
    alignItems:"center",
  },

  tipoActivo:{
    backgroundColor:
      Colors.primaryLight,
  },

  btnGuardar:{
    backgroundColor:
      Colors.primary,
    borderRadius:14,
    padding:14,
    alignItems:"center",
  },

  btnTexto:{
    color:"white",
    fontWeight:"bold",
  },

  cancelar:{
    textAlign:"center",
    marginTop:14,
  },
});