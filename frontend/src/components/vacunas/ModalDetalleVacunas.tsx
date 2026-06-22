import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { api } from "@/config/api";
import { Colors } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import ModalEditarVacuna from "./ModalEditarVacunas";
import { useTranslation } from "react-i18next";
import { Vacuna } from "./AnimalVacunas";

interface Props {
  visible: boolean;
  onClose: () => void;
  vacuna: Vacuna | null;
  onActualizada: () => void;
  onEliminada: () => void;
}

function formatFecha(fechaStr: string | null): string {
  if (!fechaStr) return "—";
  const [year, month, day] = fechaStr.split("-");
  return `${parseInt(day)}/${parseInt(month)}/${year}`;
}

export default function ModalDetalleVacuna({
  visible,
  onClose,
  vacuna,
  onActualizada,
  onEliminada,
}: Props) {
  const { t } = useTranslation("vacunas");
  const [modalEditar, setModalEditar] = useState(false);

  if (!vacuna) return null;

  const handleEliminar = () => {
    console.log("handleEliminar ejecutado");
    Alert.alert(t("confirmTitleEliminar"), t("confirmMessageEliminar"), [
      { text: t("btnCancelar"), style: "cancel" },
      {
        text: t("btnEliminar"),
        style: "destructive",
        onPress: async () => {
          try {
            await api.deleteVacuna(vacuna.id_vacuna);
            onEliminada();
            onClose();
          } catch (e: any) {
            Alert.alert(
              t("error"),
              e?.response?.data?.error ?? t("errorEliminar"),
            );
          }
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.titulo}>{t("titleDetalleVacuna")}</Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <TouchableOpacity onPress={() => setModalEditar(true)}>
                <MaterialIcons name="edit" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEliminar}>
                <MaterialIcons
                  name="delete-outline"
                  size={20}
                  color={Colors.delete}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cerrar}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.seccionCard}>
              <View style={styles.fila}>
                <Text style={styles.filaLabel}>{t("labelNombre")}</Text>
                <Text style={styles.filaValor}>{vacuna.nombre}</Text>
              </View>

              <View style={styles.separador} />

              <View style={styles.fila}>
                <Text style={styles.filaLabel}>
                  {t("labelFechaAplicacion")}
                </Text>
                <Text style={styles.filaValor}>
                  {formatFecha(vacuna.fecha_aplicacion)}
                </Text>
              </View>

              <View style={styles.separador} />

              <View style={styles.fila}>
                <Text style={styles.filaLabel}>
                  {t("labelRequiereProxDosis")}
                </Text>
                <Text style={styles.filaValor}>
                  {vacuna.requiere_prox_dosis ? t("si") : t("no")}
                </Text>
              </View>

              {vacuna.requiere_prox_dosis && vacuna.fecha_prox_dosis && (
                <>
                  <View style={styles.separador} />
                  <View style={styles.fila}>
                    <Text style={styles.filaLabel}>
                      {t("labelFechaProxDosis")}
                    </Text>
                    <Text style={styles.filaValor}>
                      {formatFecha(vacuna.fecha_prox_dosis)}
                    </Text>
                  </View>
                </>
              )}

              {vacuna.costo_aplicacion != null && (
                <>
                  <View style={styles.separador} />
                  <View style={styles.fila}>
                    <Text style={styles.filaLabel}>{t("labelCosto")}</Text>
                    <Text style={styles.filaValor}>
                      ${vacuna.costo_aplicacion.toLocaleString("es-AR")}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          {modalEditar && (
            <ModalEditarVacuna
              visible={modalEditar}
              onClose={() => setModalEditar(false)}
              onEditada={() => {
                setModalEditar(false);
                onActualizada();
                onClose();
              }}
              vacuna={vacuna}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titulo: { fontSize: 20, fontWeight: "bold", color: Colors.text },
  cerrar: { fontSize: 22, color: Colors.textMuted },
  seccionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
  },
  filaLabel: {
    fontSize: 14,
    color: Colors.textSoft,
  },
  filaValor: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  separador: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
});
