import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import {
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import {
  Redirect,
  router,
} from "expo-router";

export default function HomeScreen() {
  const { t } = useTranslation("home");

  const {
    usuario,
    esAdmin,
    perfilCompleto,
  } = useAuth();

  if (
    usuario &&
    !perfilCompleto
  ) {
    return (
      <Redirect href="/(tabs)/perfil" />
    );
  }

  const botonesBase = [
    {
      label: t("animales"),
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
      label: t("calendario"),
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
      label: t("tratamientos"),
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
      label: t("personas"),
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

  const botonUsuarios = {
    label: t("usuarios"),
    icono: (
      <Feather
        name="user"
        size={48}
        color={Colors.primary}
      />
    ),
    ruta: "/usuarios",
  };

  const botones = esAdmin
    ? [...botonesBase, botonUsuarios]
    : botonesBase;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTexto}>
          {t("opciones")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.grilla}
      >
        {botones.map((btn) => (
          <TouchableOpacity
            key={btn.label}
            style={styles.boton}
            onPress={() =>
              router.push(btn.ruta as any)
            }
            activeOpacity={0.7}
          >
            <View>{btn.icono}</View>

            <Text style={styles.botonLabel}>
              {btn.label}
            </Text>
          </TouchableOpacity>
        ))}
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
    paddingVertical: 20,
    alignItems: "center",
  },

  headerTexto: {
    color: Colors.surface,
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
    backgroundColor: Colors.surface,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,

    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  botonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSoft,
  },
});