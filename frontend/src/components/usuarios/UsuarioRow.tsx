import React from "react";

import {
View,
Text,
TouchableOpacity,
StyleSheet,
Alert,
} from "react-native";

import {
MaterialIcons,
} from "@expo/vector-icons";

import { useTranslation } from "react-i18next";

import { api } from "@/config/api";
import { Colors } from "@/constants/theme";

interface Props {
usuario: any;
onEditar: (u: any) => void;
onActualizado: () => void;
}

export default function UsuarioRow({
usuario,
onEditar,
onActualizado,
}: Props) {

const { t } =
useTranslation("usuarios");

const confirmarEliminar =
() => {

  Alert.alert(
    t("eliminarUsuario"),

    `${t("eliminarUsuarioMensaje")}\n\n${usuario.email}`,

    [
      {
        text:
          t("cancelar"),
        style:
          "cancel",
      },

      {
        text:
          t("conservarPersona"),

        onPress:
          () =>
            eliminarUsuario(
              false
            ),
      },

      {
        text:
          t(
            "eliminarPersonaTambien"
          ),

        style:
          "destructive",

        onPress:
          () =>
            eliminarUsuario(
              true
            ),
      },
    ]
  );
};


const eliminarUsuario =
async (
eliminarPersona: boolean
) => {

  try {

    await api.deleteUsuario(
      usuario.id_usuario,
      eliminarPersona
    );

    onActualizado();

  } catch (error) {

    console.error(error);

    Alert.alert(
      t("error"),
      t(
        "errorEliminarUsuario"
      )
    );
  }
};

  return ( <View style={styles.row}>

    <View style={styles.info}>

      <Text style={styles.nombre}>
        {usuario.persona?.nombre ||
          t("sinNombre")}{" "}
        {usuario.persona?.apellido ||
          ""}
      </Text>

      <Text style={styles.email}>
        {usuario.email}
      </Text>

    </View>

    <View style={styles.badges}>

      <View
        style={[
          styles.badge,

          usuario.activo
            ? styles.activo
            : styles.inactivo,
        ]}
      >
        <Text
          style={
            styles.badgeTexto
          }
        >
          {usuario.activo
            ? t("activo")
            : t(
                "inactivo"
              )}
        </Text>
      </View>

      <View
        style={styles.badge}
      >
        <Text
          style={
            styles.badgeTexto
          }
        >
          {usuario.tipo}
        </Text>
      </View>

    </View>

    <View
      style={styles.actions}
    >

      <TouchableOpacity
        onPress={() =>
          onEditar(usuario)
        }
      >
        <MaterialIcons
          name="edit"
          size={22}
          color={
            Colors.primary
          }
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={
          confirmarEliminar
        }
      >
        <MaterialIcons
          name="delete"
          size={22}
          color={
            Colors.delete
          }
        />
      </TouchableOpacity>

    </View>

  </View>

  );
}

const styles =
StyleSheet.create({

row: {
  flexDirection:
    "row",
  alignItems:
    "center",
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor:
    Colors.border,
},

info: {
  flex: 1,
},

nombre: {
  fontWeight: "600",
  color:
    Colors.text,
  fontSize: 14,
},

email: {
  color:
    Colors.textMuted,
  fontSize: 12,
  marginTop: 2,
},

badges: {
  marginRight: 12,
  gap: 4,
},

badge: {
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 10,
  backgroundColor:
    Colors.background,
  alignItems:
    "center",
},

badgeTexto: {
  color:
    Colors.textSoft,
  fontSize: 12,
  fontWeight: "600",
},

activo: {
  backgroundColor:
    "#dcfce7",
},

inactivo: {
  backgroundColor:
    "#fee2e2",
},

actions: {
  flexDirection:
    "row",
  alignItems:
    "center",
  gap: 10,
},


});
