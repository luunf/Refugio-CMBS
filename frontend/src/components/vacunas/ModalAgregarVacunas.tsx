import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { api } from "@/config/api";
import { Colors } from "@/constants/theme";
import AnimalDatePickerModal from "@/components/animales/AnimalDatePickerModal";
import { useTranslation } from "react-i18next";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreada: () => void;
  animalId: number;
}

function formatFecha(fechaStr: string): string {
  if (!fechaStr) return "";
  const [year, month, day] = fechaStr.split("-");
  return `${parseInt(day)}/${parseInt(month)}/${year}`;
}

const hoy = new Date().toISOString().split("T")[0];

export default function ModalAgregarVacuna({
  visible,
  onClose,
  onCreada,
  animalId,
}: Props) {
  const { t } = useTranslation("vacunas");

  const [nombre, setNombre] = useState("");
  const [fechaAplicacion, setFechaAplicacion] = useState(hoy);
  const [requiereProxDosis, setRequiereProxDosis] = useState(false);
  const [fechaProxDosis, setFechaProxDosis] = useState("");
  const [costo, setCosto] = useState("");
  const [pickerFechaAplicacion, setPickerFechaAplicacion] = useState(false);
  const [pickerFechaProxDosis, setPickerFechaProxDosis] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setNombre("");
    setFechaAplicacion(hoy);
    setRequiereProxDosis(false);
    setFechaProxDosis("");
    setCosto("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const guardar = async () => {
    if (!nombre.trim()) {
      Alert.alert(t("error"), t("errorNombreRequerido"));
      return;
    }
    if (
      requiereProxDosis &&
      fechaProxDosis &&
      new Date(fechaProxDosis) < new Date(fechaAplicacion)
    ) {
      Alert.alert(t("error"), t("errorProxDosis"));
      return;
    }
    setLoading(true);
    try {
      await api.createVacuna(animalId, {
        nombre: nombre.trim(),
        fecha_aplicacion: fechaAplicacion,
        requiere_prox_dosis: requiereProxDosis,
        fecha_prox_dosis:
          requiereProxDosis && fechaProxDosis ? fechaProxDosis : null,
        costo_aplicacion: costo ? parseFloat(costo.replace(",", ".")) : null,
      });
      onCreada();
      handleClose();
    } catch (e: any) {
      Alert.alert(t("error"), e?.response?.data?.error ?? t("errorCrear"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.titulo}>{t("titleNuevaVacuna")}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.cerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>
              {t("labelNombre")}
              {t("requiredSymbol")}
            </Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              style={styles.input}
              placeholder={t("placeholderNombre")}
              placeholderTextColor={Colors.textFaint}
            />

            <Text style={styles.label}>{t("labelFechaAplicacion")}</Text>
            <TouchableOpacity
              style={styles.inputFecha}
              onPress={() => setPickerFechaAplicacion(true)}
            >
              <Text
                style={
                  fechaAplicacion ? styles.fechaTexto : styles.fechaPlaceholder
                }
              >
                {fechaAplicacion
                  ? formatFecha(fechaAplicacion)
                  : t("seleccionarFecha")}
              </Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                {t("labelRequiereProxDosis")}
              </Text>
              <Switch
                value={requiereProxDosis}
                onValueChange={setRequiereProxDosis}
              />
            </View>

            {requiereProxDosis && (
              <>
                <Text style={styles.label}>{t("labelFechaProxDosis")}</Text>
                <TouchableOpacity
                  style={styles.inputFecha}
                  onPress={() => setPickerFechaProxDosis(true)}
                >
                  <Text
                    style={
                      fechaProxDosis
                        ? styles.fechaTexto
                        : styles.fechaPlaceholder
                    }
                  >
                    {fechaProxDosis
                      ? formatFecha(fechaProxDosis)
                      : t("seleccionarFecha")}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <Text style={styles.label}>{t("labelCosto")}</Text>
            <TextInput
              value={costo}
              onChangeText={setCosto}
              style={styles.input}
              placeholder={t("placeholderCosto")}
              placeholderTextColor={Colors.textFaint}
              keyboardType="decimal-pad"
            />

            <TouchableOpacity
              onPress={guardar}
              disabled={loading}
              style={styles.btnCrear}
            >
              {loading ? (
                <ActivityIndicator color={Colors.surface} />
              ) : (
                <Text style={styles.btnCrearTexto}>{t("btnCrear")}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      <AnimalDatePickerModal
        visible={pickerFechaAplicacion}
        onClose={() => setPickerFechaAplicacion(false)}
        onSelectDate={(d) => {
          setFechaAplicacion(d);
          setPickerFechaAplicacion(false);
        }}
        titulo={t("labelFechaAplicacion")}
        fechaSeleccionada={fechaAplicacion}
      />
      <AnimalDatePickerModal
        visible={pickerFechaProxDosis}
        onClose={() => setPickerFechaProxDosis(false)}
        onSelectDate={(d) => {
          setFechaProxDosis(d);
          setPickerFechaProxDosis(false);
        }}
        titulo={t("labelFechaProxDosis")}
        fechaSeleccionada={fechaProxDosis || hoy}
      />
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
    backgroundColor: Colors.primaryFaint,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titulo: { fontSize: 20, fontWeight: "bold", color: Colors.text },
  cerrar: { fontSize: 22, color: Colors.textMuted },
  label: {
    fontWeight: "600",
    marginBottom: 4,
    color: Colors.text,
    fontSize: 14,
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
    color: Colors.text,
  },
  inputFecha: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  fechaTexto: { fontSize: 14, color: Colors.text },
  fechaPlaceholder: { fontSize: 14, color: Colors.textFaint },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  btnCrear: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 8,
  },
  btnCrearTexto: { color: Colors.surface, fontWeight: "bold", fontSize: 16 },
});
