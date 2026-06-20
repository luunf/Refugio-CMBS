import React, { useEffect, useState } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet, Alert,
} from "react-native";
import { api } from "@/config/api";
import { Colors } from "@/constants/theme";
import { useTranslation } from 'react-i18next';
import SingleSelector from "@/components/animales/SingleSelector";
import AnimalDatePickerModal from "@/components/animales/AnimalDatePickerModal";

interface Persona {
  id_persona: number;
  nombre: string;
  apellido: string;
}

interface TratamientoForm {
  key: string;          
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  pickerInicio: boolean;
  pickerFin: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreada: () => void;
  animalId: number;
}

const hoy = new Date().toISOString().split("T")[0];

function formatFecha(fechaStr: string): string {
  if (!fechaStr) return "";
  const [year, month, day] = fechaStr.split("-");
  return `${parseInt(day)}/${parseInt(month)}/${year}`;
}

const esHoraValida = (hora: string): boolean => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(hora);
};

export default function ModalRegistrarVisita({ visible, onClose, onCreada, animalId }: Props) {
  const { t } = useTranslation('visitas');

  const ESTADOS = [
    { label: t('optionProxima'),   valor: "proxima"   },
    { label: t('optionRealizada'), valor: "realizada" },
  ];

  const [loading, setLoading]       = useState(false);
  const [veterinarios, setVeterinarios] = useState<Persona[]>([]);

  const [fecha, setFecha]                   = useState(hoy);
  const [hora, setHora]                     = useState("");
  const [procedimiento, setProcedimiento]   = useState("");
  const [veterinarioId, setVeterinarioId]   = useState<number | null>(null);
  const [estado, setEstado]                 = useState<string | null>(null);
  const [infoAdicional, setInfoAdicional]   = useState("");
  const [costo, setCosto]                   = useState("");

  const [pickerFecha, setPickerFecha] = useState(false);

  const [tratamientos, setTratamientos] = useState<TratamientoForm[]>([]);

  useEffect(() => {
    if (visible) cargarDatos();
  }, [visible]);

  const cargarDatos = async () => {
    try {
      const vets = await api.getPersonas("veterinario");
      setVeterinarios(Array.isArray(vets) ? vets : []);
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setFecha(hoy);
    setHora("");
    setProcedimiento("");
    setVeterinarioId(null);
    setEstado(null);
    setInfoAdicional("");
    setCosto("");
    setTratamientos([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const nuevoTratamiento = (): TratamientoForm => ({
    key: Date.now().toString() + Math.random().toString(36).slice(2),
    tipo: "",
    fecha_inicio: fecha, 
    fecha_fin: "",
    descripcion: "",
    pickerInicio: false,
    pickerFin: false,
  });

  const agregarTratamiento = () =>
    setTratamientos((prev) => [...prev, nuevoTratamiento()]);

  const eliminarTratamiento = (key: string) =>
    setTratamientos((prev) => prev.filter((t) => t.key !== key));

  const actualizarTratamiento = (key: string, campo: Partial<TratamientoForm>) =>
    setTratamientos((prev) =>
      prev.map((t) => (t.key === key ? { ...t, ...campo } : t))
    );

  const handleCrear = async () => {
    if (!fecha) return Alert.alert(t('error'), t('errorFecha'));
    if (hora && !esHoraValida(hora)) return Alert.alert(t('error'), t('errorHoraInvalida'));
    if (!procedimiento.trim()) return Alert.alert(t('error'), t('errorProcedimiento'));
    if (!veterinarioId) return Alert.alert(t('error'), t('errorVeterinario'));
    if (!estado) return Alert.alert(t('error'), t('errorEstado'));

    for (const tratamiento of tratamientos) {
      if (!tratamiento.tipo.trim()) return Alert.alert(t('error'), t('errorTipo'));
      if (!tratamiento.fecha_inicio) return Alert.alert(t('error'), t('errorFechaInicio'));
    }

    setLoading(true);
    try {
      // Crear visita
      const visita = await api.createVisita(animalId, {
        fecha,
        hora: hora || null,
        procedimiento: procedimiento.trim(),
        veterinario_id: veterinarioId,
        estado,
        info_adicional: infoAdicional.trim() || null,
        costo: estado === "realizada" && costo ? parseFloat(costo) : null,
      });

      // Crear tratamientos asociados
      for (const t of tratamientos) {
        await api.createTratamientoEnVisita(visita.id_visita, {
          tipo: t.tipo.trim(),
          descripcion: t.descripcion.trim() || null,
          fecha_inicio: t.fecha_inicio,
          fecha_fin: t.fecha_fin || null,
        });
      }

      onCreada();
      handleClose();
      Alert.alert(t('success'), t('successRegistrar'));
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.error ?? t('errorRegistrar'));
    } finally {
      setLoading(false);
    }
  };

  const veterinariosItems = veterinarios.map((p) => ({id: p.id_persona, nombre: `${p.nombre} ${p.apellido}`,}));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.titulo}>{t('titleNuevaVisita')}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.cerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Fecha */}
            <Text style={styles.label}>{t('labelFecha')}{t('requiredSymbol')}</Text>
            <TouchableOpacity
              style={styles.inputFecha}
              onPress={() => setPickerFecha(true)}
            >
              <Text style={fecha ? styles.fechaTexto : styles.fechaPlaceholder}>
                {fecha ? formatFecha(fecha) : t('placeholderSeleccionarFecha')}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>{t('labelHora')}</Text>
              <TextInput
                value={hora}
                onChangeText={setHora}
                style={styles.input}
                placeholder={t('placeholderHora')}
                placeholderTextColor={Colors.textFaint}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />

            {/* Procedimiento */}
            <Text style={styles.label}>{t('labelProcedimiento')}{t('requiredSymbol')}</Text>
            <TextInput
              value={procedimiento}
              onChangeText={setProcedimiento}
              style={styles.input}
              placeholder={t('placeholderProcedimiento')}
              placeholderTextColor={Colors.textFaint}
            />

            {/* Veterinario */}
            <Text style={styles.label}>{t('labelVeterinario')}{t('requiredSymbol')}</Text>
            <SingleSelector
              value={veterinarioId}
              onChange={setVeterinarioId}
              items={veterinariosItems}
              placeholder={t('placeholderSeleccionarVeterinario')}
              searchable
            />

            {/* Estado */}
            <Text style={styles.label}>{t('labelEstado')}{t('requiredSymbol')}</Text>
            <View style={styles.opcionesRow}>
              {ESTADOS.map((e) => (
                <TouchableOpacity
                  key={e.valor}
                  style={[styles.badge, estado === e.valor && styles.badgeActivo]}
                  onPress={() => setEstado(e.valor)}
                >
                  <Text style={estado === e.valor ? styles.badgeTextoActivo : styles.badgeTexto}>
                    {e.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Info adicional */}
            <Text style={styles.label}>{t('labelInfoAdicional')}</Text>
            <TextInput
              value={infoAdicional}
              onChangeText={setInfoAdicional}
              style={[styles.input, styles.inputMultiline]}
              placeholder={t('placeholderInfoAdicional')}
              placeholderTextColor={Colors.textFaint}
              multiline
              numberOfLines={3}
            />

            {/* Costo (realizada) */}
            {estado === "realizada" && (
              <>
                <Text style={styles.label}>{t('labelCosto')}</Text>
                <TextInput
                  value={costo}
                  onChangeText={setCosto}
                  style={styles.input}
                  placeholder={t('placeholderCosto')}
                  placeholderTextColor={Colors.textFaint}
                  keyboardType="decimal-pad"
                />
              </>
            )}

            <View style={styles.divider} />
            <Text style={styles.seccionTitulo}>{t('titleTratamientos')}</Text>
            
            {/* Tratamientos */}
            {tratamientos.map((t, idx) => (
              <TratamientoItem
                key={t.key}
                index={idx}
                tratamiento={t}
                onChange={(campo) => actualizarTratamiento(t.key, campo)}
                onEliminar={() => eliminarTratamiento(t.key)}
              />
            ))}

            {/* Botón añadir tratamiento */}
            <TouchableOpacity
              style={styles.btnAnadirTratamiento}
              onPress={agregarTratamiento}
            >
              <Text style={styles.btnAnadirTratamientoTexto}>{t('btnAnadirTratamiento')}</Text>
            </TouchableOpacity>

            {/* Botón crear */}
            <TouchableOpacity
              onPress={handleCrear}
              disabled={loading}
              style={styles.btnCrear}
            >
              {loading
                ? <ActivityIndicator color={Colors.surface} />
                : <Text style={styles.btnCrearTexto}>{t('btnCrear')}</Text>
              }
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>

      {/* Picker fecha visita */}
      <AnimalDatePickerModal
        visible={pickerFecha}
        onClose={() => setPickerFecha(false)}
        onSelectDate={(d) => setFecha(d)}
        titulo={t('titleSeleccionarFechaVisita')}
        fechaSeleccionada={fecha}
      />
    </Modal>
  );
}

// TratamientoItem

interface TratamientoItemProps {
  index: number;
  tratamiento: TratamientoForm;
  onChange: (campo: Partial<TratamientoForm>) => void;
  onEliminar: () => void;
}

function TratamientoItem({ index, tratamiento, onChange, onEliminar }: TratamientoItemProps) {
    const { t } = useTranslation('visitas');

    return (
    <View style={itemStyles.container}>

      {/* Header del tratamiento */}
      <View style={itemStyles.header}>
        <Text style={itemStyles.titulo}>{t('subtitleTratamiento')} {index + 1}</Text>
        <TouchableOpacity onPress={onEliminar} style={itemStyles.btnEliminar}>
          <Text style={itemStyles.btnEliminarTexto}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Tipo */}
      <Text style={itemStyles.label}>{t('labelTipo')}{t('requiredSymbol')}</Text>
      <TextInput
        value={tratamiento.tipo}
        onChangeText={(v) => onChange({ tipo: v })}
        style={itemStyles.input}
        placeholder={t('placeholderTipo')}
        placeholderTextColor={Colors.textFaint}
      />

      {/* Fecha inicio */}
      <Text style={itemStyles.label}>{t('labelFechaInicio')}{t('requiredSymbol')}</Text>
      <TouchableOpacity
        style={itemStyles.inputFecha}
        onPress={() => onChange({ pickerInicio: true })}
      >
        <Text style={tratamiento.fecha_inicio ? itemStyles.fechaTexto : itemStyles.fechaPlaceholder}>
          {tratamiento.fecha_inicio
            ? formatFechaItem(tratamiento.fecha_inicio)
            : t('placeholderSeleccionarFecha')}
        </Text>
      </TouchableOpacity>

      {/* Fecha fin */}
      <Text style={itemStyles.label}>{t('labelFechaFin')}</Text>
      <TouchableOpacity
        style={itemStyles.inputFecha}
        onPress={() => onChange({ pickerFin: true })}
      >
        <Text style={tratamiento.fecha_fin ? itemStyles.fechaTexto : itemStyles.fechaPlaceholder}>
          {tratamiento.fecha_fin
            ? formatFechaItem(tratamiento.fecha_fin)
            : t('placeholderSeleccionarFecha')}
        </Text>
      </TouchableOpacity>

      {/* Descripción */}
      <Text style={itemStyles.label}>{t('labelDescripcion')}</Text>
      <TextInput
        value={tratamiento.descripcion}
        onChangeText={(v) => onChange({ descripcion: v })}
        style={[itemStyles.input, itemStyles.inputMultiline]}
        placeholder={t('placeholderDescripcion')}
        placeholderTextColor={Colors.textFaint}
        multiline
        numberOfLines={2}
      />

      {/* Pickers internos del tratamiento */}
      <AnimalDatePickerModal
        visible={tratamiento.pickerInicio}
        onClose={() => onChange({ pickerInicio: false })}
        onSelectDate={(d) => onChange({ fecha_inicio: d, pickerInicio: false })}
        titulo={t('titleSeleccionarFechaInicio')}
        fechaSeleccionada={tratamiento.fecha_inicio}
      />
      <AnimalDatePickerModal
        visible={tratamiento.pickerFin}
        onClose={() => onChange({ pickerFin: false })}
        onSelectDate={(d) => onChange({ fecha_fin: d, pickerFin: false })}
        titulo={t('titleSeleccionarFechaFin')}
        fechaSeleccionada={tratamiento.fecha_fin || new Date().toISOString().split("T")[0]}
      />
    </View>
  );
}

function formatFechaItem(fechaStr: string): string {
  if (!fechaStr) return "";
  const [year, month, day] = fechaStr.split("-");
  return `${parseInt(day)}/${parseInt(month)}/${year}`;
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
  inputMultiline: { textAlignVertical: "top" },
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
  opcionesRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  badge: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeActivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  badgeTexto: { color: Colors.textSoft, fontSize: 14, fontWeight: "500" },
  badgeTextoActivo: { color: Colors.surface, fontSize: 14, fontWeight: "600" },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  btnAnadirTratamiento: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  btnAnadirTratamientoTexto: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 14,
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

const itemStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titulo: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  btnEliminar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  btnEliminarTexto: { fontSize: 13, color: Colors.textMuted, fontWeight: "bold" },
  label: {
    fontWeight: "600",
    marginBottom: 4,
    color: Colors.text,
    fontSize: 13,
    marginTop: 2,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
    fontSize: 13,
    color: Colors.text,
  },
  inputMultiline: { textAlignVertical: "top" },
  inputFecha: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12,
  },
  fechaTexto: { fontSize: 13, color: Colors.text },
  fechaPlaceholder: { fontSize: 13, color: Colors.textFaint },
});
