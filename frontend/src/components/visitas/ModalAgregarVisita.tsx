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
import TimePickerModal from '@/components/calendario/TimePickerModal';

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
  frecuencia_horas: number | null;
  hora_administracion: string;
  pickerInicio: boolean;
  pickerFin: boolean;
  pickerHora: boolean;
}

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

function getFechaLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const esHoraValida = (hora: string): boolean => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(hora);
};

const esHoraPasada = (fechaStr: string, hora: string, hoy: string): boolean => {
  if (!esHoraValida(hora)) return false;
  if (fechaStr !== hoy) return false;
  const ahora = new Date();
  const [h, m] = hora.split(':').map(Number);
  const horaVisita = new Date();
  horaVisita.setHours(h, m, 0, 0);
  return horaVisita < ahora;
};

const esHoraFutura = (fechaStr: string, hora: string, hoy: string): boolean => {
  if (!esHoraValida(hora)) return false;
  if (fechaStr !== hoy) return false;
  const ahora = new Date();
  const [h, m] = hora.split(':').map(Number);
  const horaVisita = new Date();
  horaVisita.setHours(h, m, 0, 0);
  return horaVisita > ahora;
};

const fechaInicioTratamientoInvalida = (fechaInicio: string, fechaVisita: string): boolean => {
  if (!fechaInicio) return false;
  return fechaInicio < fechaVisita;
};

const fechaFinTratamientoInvalida = (fechaFin: string, fechaInicio: string): boolean => {
  if (!fechaFin) return false;
  return fechaFin < fechaInicio;
};

export default function ModalRegistrarVisita({ visible, onClose, onCreada, animalId }: Props) {
  const { t } = useTranslation('visitas');
  const hoy = getFechaLocal(new Date());

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
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tratamientos, setTratamientos] = useState<TratamientoForm[]>([]);

  const fechaMin = estado === "proxima" ? hoy : undefined;
  const fechaMax = estado === "realizada" ? hoy : undefined;

  const fechaInvalida = !!estado && ((estado === "proxima" && fecha < hoy) || (estado === "realizada" && fecha > hoy));
  const horaInvalida = estado === "proxima" ? esHoraPasada(fecha, hora, hoy) : estado === "realizada" ? esHoraFutura(fecha, hora, hoy) : false;
  const horaFormatoInvalido = hora.length > 0 && !esHoraValida(hora);

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
    frecuencia_horas: null,
    hora_administracion: "",
    pickerInicio: false,
    pickerFin: false,
    pickerHora: false,
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
    if (fechaInvalida) { return Alert.alert(t('error'), estado === "proxima" ? t('errorFechaDebeSerFutura') : t('errorFechaDebeSerPasada'));}
    if (hora && !esHoraValida(hora)) return Alert.alert(t('error'), t('errorHoraInvalida'));
    if (horaInvalida) {return Alert.alert(t('error'), estado === "proxima" ? t('errorHoraDebeSerFutura') : t('errorHoraDebeSerPasada'));}
    if (!procedimiento.trim()) return Alert.alert(t('error'), t('errorProcedimiento'));
    if (!veterinarioId) return Alert.alert(t('error'), t('errorVeterinario'));
    if (!estado) return Alert.alert(t('error'), t('errorEstado'));

    const costoNumero = costo ? parseFloat(costo.replace(",", ".")) : null;
    if (costo && isNaN(costoNumero!)) {
      return Alert.alert(t('error'), t('errorCostoInvalido'));
    }

    for (const tratamiento of tratamientos) {
      if (!tratamiento.tipo.trim()) return Alert.alert(t('error'), t('errorTipo'));
      if (!tratamiento.fecha_inicio) return Alert.alert(t('error'), t('errorFechaInicio'));
      if (fechaInicioTratamientoInvalida(tratamiento.fecha_inicio, fecha)) {
        return Alert.alert(t('error'), t('errorFechaInicioTratamiento'));
      }
      if (fechaFinTratamientoInvalida(tratamiento.fecha_fin, tratamiento.fecha_inicio)) {
        return Alert.alert(t('error'), t('errorFechaFinTratamiento'));
      }
      if (tratamiento.frecuencia_horas && !esHoraValida(tratamiento.hora_administracion)) {
        return Alert.alert(t('error'), t('errorPrimeraDosis'));
      }
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
        costo: estado === "realizada" ? costoNumero : null,
      });

      // Crear tratamientos asociados
      for (const t of tratamientos) {
        await api.createTratamientoEnVisita(visita.id_visita, {
          tipo: t.tipo.trim(),
          descripcion: t.descripcion.trim() || null,
          fecha_inicio: t.fecha_inicio,
          fecha_fin: t.fecha_fin || null,
          frecuencia_horas: t.frecuencia_horas,
          hora_administracion: t.hora_administracion || null,
        });
      }

      onCreada();
      handleClose();
      const successMessage = visita.tarea_creada
        ? `${t('successRegistrar')}\n${t('successTareaAgendada', { nombre: visita.tarea_nombre })}`
        : t('successRegistrar');
      Alert.alert(t('success'), successMessage);
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
            {fechaInvalida && (
              <Text style={styles.fechaErrorTexto}>
                {estado === "proxima" ? t('errorFechaDebeSerFutura') : t('errorFechaDebeSerPasada')}
              </Text>
            )}

            {/* Hora */}
            <Text style={styles.label}>{t('labelHora')}</Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={styles.input}
              >
                <Text style={hora ? styles.horaTexto : { color: Colors.textFaint }}>
                  {hora || t('placeholderHora')}
                </Text>
              </TouchableOpacity>
              {horaInvalida && (
                <Text style={styles.fechaErrorTexto}>
                  {estado === "proxima" ? t('errorHoraDebeSerFutura') : t('errorHoraDebeSerPasada')}
                </Text>
              )}

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
                fechaVisita={fecha}
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
        minDate={fechaMin}
        maxDate={fechaMax}
      />

      {/* Picker hora visita */}
      <TimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onSelectTime={(h) => setHora(h)}
        initialTime={hora || '08:00'}
      />
    </Modal>
  );
}

// TratamientoItem

interface TratamientoItemProps {
  index: number;
  tratamiento: TratamientoForm;
  fechaVisita: string;
  onChange: (campo: Partial<TratamientoForm>) => void;
  onEliminar: () => void;
}

function TratamientoItem({ index, tratamiento, fechaVisita, onChange, onEliminar }: TratamientoItemProps) {
    const { t } = useTranslation('visitas');

    const fechaInicioInvalida = fechaInicioTratamientoInvalida(tratamiento.fecha_inicio, fechaVisita);
    const fechaFinInvalida = fechaFinTratamientoInvalida(tratamiento.fecha_fin, tratamiento.fecha_inicio);

    const FRECUENCIAS = [
      { label: t('frecuencia8'), value: 8 },
      { label: t('frecuencia12'), value: 12 },
      { label: t('frecuencia24'), value: 24 },
    ];

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
            ? formatFecha(tratamiento.fecha_inicio)
            : t('placeholderSeleccionarFecha')}
        </Text>
      </TouchableOpacity>
      {fechaInicioInvalida && (
        <Text style={itemStyles.fechaErrorTexto}>{t('errorFechaInicioTratamiento')}</Text>
      )}

      {/* Fecha fin */}
      <Text style={itemStyles.label}>{t('labelFechaFin')}</Text>
      <TouchableOpacity
        style={itemStyles.inputFecha}
        onPress={() => onChange({ pickerFin: true })}
      >
        <Text style={tratamiento.fecha_fin ? itemStyles.fechaTexto : itemStyles.fechaPlaceholder}>
          {tratamiento.fecha_fin
            ? formatFecha(tratamiento.fecha_fin)
            : t('placeholderSeleccionarFecha')}
        </Text>
      </TouchableOpacity>
      {fechaFinInvalida && (
        <Text style={itemStyles.fechaErrorTexto}>{t('errorFechaFinTratamiento')}</Text>
      )}

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

      {/* Frecuencia */}
      <Text style={itemStyles.label}>{t('labelFrecuencia')}</Text>
      <View style={itemStyles.frecuenciaContainer}>
        {FRECUENCIAS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => onChange({ frecuencia_horas: f.value })}
            style={[
              itemStyles.btnFrecuencia,
              tratamiento.frecuencia_horas === f.value && itemStyles.btnFrecuenciaActivo,
            ]}
          >
            <Text style={[
              itemStyles.btnFrecuenciaText,
              tratamiento.frecuencia_horas === f.value && itemStyles.btnFrecuenciaTextActivo,
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => onChange({ frecuencia_horas: null, hora_administracion: "" })}
          style={[
            itemStyles.btnFrecuencia,
            tratamiento.frecuencia_horas === null && itemStyles.btnFrecuenciaActivo,
          ]}
        >
          <Text style={[
            itemStyles.btnFrecuenciaText,
            tratamiento.frecuencia_horas === null && itemStyles.btnFrecuenciaTextActivo,
          ]}>
            {t('frecuenciaFija')}
          </Text>
        </TouchableOpacity>
      </View>

      {tratamiento.frecuencia_horas !== null && (
        <>
          <Text style={itemStyles.label}>{t('labelPrimeraDosis')}{t('requiredSymbol')}</Text>
          <TouchableOpacity
            onPress={() => onChange({ pickerHora: true })}
            style={itemStyles.inputFecha}
          >
            <Text style={tratamiento.hora_administracion ? itemStyles.fechaTexto : itemStyles.fechaPlaceholder}>
              {tratamiento.hora_administracion || t('placeholderPrimeraDosis')}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Pickers internos del tratamiento */}
      <AnimalDatePickerModal
        visible={tratamiento.pickerInicio}
        onClose={() => onChange({ pickerInicio: false })}
        onSelectDate={(d) => onChange({ fecha_inicio: d, pickerInicio: false })}
        titulo={t('titleSeleccionarFechaInicio')}
        fechaSeleccionada={tratamiento.fecha_inicio}
        minDate={fechaVisita}
      />
      <AnimalDatePickerModal
        visible={tratamiento.pickerFin}
        onClose={() => onChange({ pickerFin: false })}
        onSelectDate={(d) => onChange({ fecha_fin: d, pickerFin: false })}
        titulo={t('titleSeleccionarFechaFin')}
        fechaSeleccionada={tratamiento.fecha_fin || tratamiento.fecha_inicio || fechaVisita}
        minDate={tratamiento.fecha_inicio || fechaVisita}
      />
      <TimePickerModal
        visible={tratamiento.pickerHora}
        onClose={() => onChange({ pickerHora: false })}
        onSelectTime={(h) => onChange({ hora_administracion: h, pickerHora: false })}
        initialTime={tratamiento.hora_administracion || '08:00'}
      />
    </View>
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
  horaTexto: { fontSize: 14, color: Colors.text },
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
  fechaErrorTexto: {
    color: Colors.delete,
    fontSize: 12,
    marginTop: -10,
    marginBottom: 14,
  },
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
  fechaErrorTexto: {
    color: Colors.delete,
    fontSize: 11,
    marginTop: -8,
    marginBottom: 10,
  },
  frecuenciaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  btnFrecuencia: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  btnFrecuenciaActivo: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  btnFrecuenciaText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  btnFrecuenciaTextActivo: {
    color: Colors.surface,
    fontWeight: '600',
  },
});
