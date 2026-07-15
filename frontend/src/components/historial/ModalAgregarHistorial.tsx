import React, { useEffect, useState } from "react";
import {
  Modal, View, Text, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet, Alert,
} from "react-native";
import { api } from "@/config/api";
import { Colors } from "@/constants/theme";
import { useTranslation } from "react-i18next";
import SingleSelector from "@/components/animales/SingleSelector";
import AnimalDatePickerModal from "@/components/animales/AnimalDatePickerModal";

interface Estado {
  id_estado: number;
  nombre: string;
}

interface Persona {
  id_persona: number;
  nombre: string;
  apellido: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreado: () => void;
  animalId: number;
}

const ESTADO_CALCULADO = "En tratamiento";

const hoy = new Date().toISOString().split("T")[0];

function formatFecha(fechaStr: string): string {
  if (!fechaStr) return "";
  const [year, month, day] = fechaStr.split("-");
  return `${parseInt(day)}/${parseInt(month)}/${year}`;
}

const nombreCompleto = (p: Persona) =>
  [p.nombre, p.apellido].filter(Boolean).join(" ") || "Usuario sin nombre";

export default function ModalAgregarHistorial({ visible, onClose, onCreado, animalId }: Props) {
  const { t } = useTranslation("animales");

  const [loading, setLoading] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [adoptantes, setAdoptantes] = useState<Persona[]>([]);
  const [hogares, setHogares] = useState<Persona[]>([]);

  const [estadoId, setEstadoId] = useState<number | null>(null);
  const [personaId, setPersonaId] = useState<number | null>(null);
  const [fechaDesde, setFechaDesde] = useState(hoy);
  const [fechaHasta, setFechaHasta] = useState("");
  const [esActual, setEsActual] = useState(true);

  const [pickerDesde, setPickerDesde] = useState(false);
  const [pickerHasta, setPickerHasta] = useState(false);

  const estadoSeleccionado = estados.find((e) => e.id_estado === estadoId);
  const esTransito = estadoSeleccionado?.nombre === "En tránsito";
  const esAdoptado = estadoSeleccionado?.nombre === "Adoptado";
  const requierePersona = esTransito || esAdoptado;

  useEffect(() => {
    if (visible) cargarDatos();
  }, [visible]);

  const cargarDatos = async () => {
    try {
      const [estadosData, adoptantesData, hogaresData] = await Promise.all([
        api.getEstados(),
        api.getPersonas("adoptante"),
        api.getPersonas("hogar_transito"),
      ]);
      const lista = Array.isArray(estadosData) ? estadosData : [];
      setEstados(lista.filter((e: Estado) => e.nombre !== ESTADO_CALCULADO));
      setAdoptantes(Array.isArray(adoptantesData) ? adoptantesData : []);
      setHogares(Array.isArray(hogaresData) ? hogaresData : []);
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setEstadoId(null);
    setPersonaId(null);
    setFechaDesde(hoy);
    setFechaHasta("");
    setEsActual(true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCrear = async () => {
    if (!estadoId) return Alert.alert(t("error"), t("errorEstadoHistorial"));
    if (!fechaDesde) return Alert.alert(t("error"), t("errorFechaDesde"));
    if (fechaDesde > hoy) return Alert.alert(t("error"), t("errorFechaDesdeFutura"));

    if (!esActual) {
      if (!fechaHasta) return Alert.alert(t("error"), t("errorFechaHasta"));
      if (fechaHasta > hoy) return Alert.alert(t("error"), t("errorFechaHastaFutura"));
      if (fechaDesde > fechaHasta) return Alert.alert(t("error"), t("errorFechaDesdeMayorHasta"));
    }

    if (requierePersona && !personaId) {
      return Alert.alert(t("error"), esTransito ? t("errorHogarRequerido") : t("errorAdoptanteRequerido"));
    }

    setLoading(true);
    try {
      await api.createHistorial(animalId, {
        estado_id: estadoId,
        persona_id: requierePersona ? personaId : null,
        fecha_desde: fechaDesde,
        fecha_hasta: esActual ? null : fechaHasta,
      });
      onCreado();
      handleClose();
      Alert.alert(t("success"), t("successRegistrarHistorial"));
    } catch (e: any) {
      Alert.alert(t("error"), e?.response?.data?.error ?? t("errorRegistrarHistorial"));
    } finally {
      setLoading(false);
    }
  };

  const estadosItems = estados.map((e) => ({ id: e.id_estado, nombre: e.nombre }));
  const adoptantesItems = adoptantes.map((p) => ({ id: p.id_persona, nombre: nombreCompleto(p) }));
  const hogaresItems = hogares.map((p) => ({ id: p.id_persona, nombre: nombreCompleto(p) }));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.titulo}>{t("titleNuevoHistorial")}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.cerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Estado */}
            <Text style={styles.label}>{t("labelEstadoHistorial")}{t("requiredSymbol")}</Text>
            <SingleSelector
              value={estadoId}
              onChange={(id) => { setEstadoId(id); setPersonaId(null); }}
              items={estadosItems}
              placeholder={t("placeholderSeleccionarEstado")}
              searchable
            />

            {/* Hogar de tránsito (solo En tránsito) */}
            {esTransito && (
              <>
                <Text style={styles.label}>{t("labelHogarTransito")}{t("requiredSymbol")}</Text>
                <SingleSelector
                  value={personaId}
                  onChange={setPersonaId}
                  items={hogaresItems}
                  placeholder={t("placeholderSeleccionarHogar")}
                  searchable
                />
              </>
            )}

            {/* Adoptante (solo Adoptado) */}
            {esAdoptado && (
              <>
                <Text style={styles.label}>{t("labelAdoptante")}{t("requiredSymbol")}</Text>
                <SingleSelector
                  value={personaId}
                  onChange={setPersonaId}
                  items={adoptantesItems}
                  placeholder={t("placeholderSeleccionarAdoptante")}
                  searchable
                />
              </>
            )}

            {/* Fecha desde */}
            <Text style={styles.label}>{t("labelFechaDesde")}{t("requiredSymbol")}</Text>
            <TouchableOpacity style={styles.inputFecha} onPress={() => setPickerDesde(true)}>
              <Text style={fechaDesde ? styles.fechaTexto : styles.fechaPlaceholder}>
                {fechaDesde ? formatFecha(fechaDesde) : t("placeholderSeleccionarFecha")}
              </Text>
            </TouchableOpacity>

            {/* Estado actual / finalizado */}
            <Text style={styles.label}>{t("labelSituacion")}</Text>
            <View style={styles.opcionesRow}>
              <TouchableOpacity
                style={[styles.badge, esActual && styles.badgeActivo]}
                onPress={() => { setEsActual(true); setFechaHasta(""); }}
              >
                <Text style={esActual ? styles.badgeTextoActivo : styles.badgeTexto}>
                  {t("optionEstadoActual")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.badge, !esActual && styles.badgeActivo]}
                onPress={() => setEsActual(false)}
              >
                <Text style={!esActual ? styles.badgeTextoActivo : styles.badgeTexto}>
                  {t("optionEstadoFinalizado")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Fecha hasta (solo si no es actual) */}
            {!esActual && (
              <>
                <Text style={styles.label}>{t("labelFechaHasta")}{t("requiredSymbol")}</Text>
                <TouchableOpacity style={styles.inputFecha} onPress={() => setPickerHasta(true)}>
                  <Text style={fechaHasta ? styles.fechaTexto : styles.fechaPlaceholder}>
                    {fechaHasta ? formatFecha(fechaHasta) : t("placeholderSeleccionarFecha")}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity onPress={handleCrear} disabled={loading} style={styles.btnCrear}>
              {loading
                ? <ActivityIndicator color={Colors.surface} />
                : <Text style={styles.btnCrearTexto}>{t("btnCrear")}</Text>
              }
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>

      <AnimalDatePickerModal
        visible={pickerDesde}
        onClose={() => setPickerDesde(false)}
        onSelectDate={(d) => setFechaDesde(d)}
        titulo={t("titleSeleccionarFechaDesde")}
        fechaSeleccionada={fechaDesde}
        maxDate={fechaHasta && !esActual ? fechaHasta : hoy}
      />
      <AnimalDatePickerModal
        visible={pickerHasta}
        onClose={() => setPickerHasta(false)}
        onSelectDate={(d) => setFechaHasta(d)}
        titulo={t("titleSeleccionarFechaHasta")}
        fechaSeleccionada={fechaHasta || fechaDesde}
        minDate={fechaDesde}
        maxDate={hoy}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  container: { backgroundColor: Colors.primaryFaint, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "92%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  titulo: { fontSize: 20, fontWeight: "bold", color: Colors.text },
  cerrar: { fontSize: 22, color: Colors.textMuted },
  label: { fontWeight: "600", marginBottom: 4, color: Colors.text, fontSize: 14, marginTop: 4 },
  inputFecha: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16 },
  fechaTexto: { fontSize: 14, color: Colors.text },
  fechaPlaceholder: { fontSize: 14, color: Colors.textFaint },
  opcionesRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  badge: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  badgeActivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  badgeTexto: { color: Colors.textSoft, fontSize: 14, fontWeight: "500" },
  badgeTextoActivo: { color: Colors.surface, fontSize: 14, fontWeight: "600" },
  btnCrear: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 20, alignItems: "center", marginBottom: 8 },
  btnCrearTexto: { color: Colors.surface, fontWeight: "bold", fontSize: 16 },
});