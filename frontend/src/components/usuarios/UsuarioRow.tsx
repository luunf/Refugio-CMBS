import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import {
  MaterialIcons,
} from "@expo/vector-icons";

import { Colors } from "@/constants/theme";

interface Props {
  usuario: any;
  onEditar: (u:any) => void;
}

export default function UsuarioRow({
  usuario,
  onEditar,
}: Props) {

  return (
    <View style={styles.row}>

      <View style={styles.info}>

        <Text style={styles.nombre}>
          {usuario.persona?.nombre || "Sin nombre"}{" "}
          {usuario.persona?.apellido || ""}
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
          <Text>
            {usuario.activo
              ? "Activo"
              : "Inactivo"}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text>
            {usuario.tipo}
          </Text>
        </View>

      </View>

      <TouchableOpacity
        onPress={() =>
          onEditar(usuario)
        }
      >
        <MaterialIcons
          name="edit"
          size={22}
          color={Colors.primary}
        />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  row:{
    flexDirection:"row",
    alignItems:"center",
    paddingVertical:12,
    borderBottomWidth:1,
    borderBottomColor:"#eee",
  },

  info:{
    flex:1,
  },

  nombre:{
    fontWeight:"600",
  },

  email:{
    color:"#666",
    fontSize:12,
  },

  badges:{
    marginRight:12,
    gap:4,
  },

  badge:{
    paddingHorizontal:8,
    paddingVertical:3,
    borderRadius:10,
    backgroundColor:"#eee",
  },

  activo:{
    backgroundColor:"#dcfce7",
  },

  inactivo:{
    backgroundColor:"#fee2e2",
  },
});