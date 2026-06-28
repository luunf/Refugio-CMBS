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

interface TratamientoExistente {
  id_tratamiento: number;
  tipo: string;
  descripcion?: string | null;
  fecha_inicio: string;
  fecha_fin?: string | null;
}

interface TratamientoForm {
  key: string;
  id_tratamiento?: number; 
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  pickerInicio: boolean;
  pickerFin: boolean;
  eliminado: boolean;
}

interface Visita {
  id_visita: number;
  fecha: string;
  hora?: string | null;
  estado: string;
  procedimiento: string;
  info_adicional?: string | null;
  costo?: number | null;
  veterinario: {
    id_persona: number;
    nombre: string;
    apellido: string;
  };
  tratamientos: TratamientoExistente[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onEditada: () => void;
  visita: Visita;
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

const esHoraPasada = (fechaStr: string, hora: string): boolean => {
  if (!esHoraValida(hora)) return false;
  if (fechaStr !== hoy) return false;
  const ahora = new Date();
  const [h, m] = hora.split(':').map(Number);
  const horaVisita = new Date();
  horaVisita.setHours(h, m, 0, 0);
  return horaVisita < ahora;
};

const esHoraFutura = (fechaStr: string, hora: string): boolean => {
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

export default function ModalEditarVisita({ visible, onClose, onEditada, visita }: Props) {
  const { t } = useTranslation('visitas');

  const ESTADOS = [
    { label: t('optionProxima'), valor: "proxima" },
    { label: t('optionRealizada'), valor: "realizada" },
  ];

  const [loading, setLoading] = useState(false);
  const [veterinarios, setVeterinarios] = useState<Persona[]>([]);

  const [fecha, setFecha] = useState(visita.fecha);
  const [hora, setHora] = useState(visita.hora ?? "");
  const [procedimiento, setProcedimiento] = useState(visita.procedimiento);
  const [veterinarioId, setVeterinarioId] = useState<number | null>(visita.veterinario.id_persona);
  const [estado, setEstado] = useState<string | null>(visita.estado);
  const [infoAdicional, setInfoAdicional] = useState(visita.info_adicional ?? "");
  const [costo, setCosto] = useState(visita.costo ? String(visita.costo) : "");
  const [pickerFecha, setPickerFecha] = useState(false);
  const [tratamientos, setTratamientos] = useState<TratamientoForm[]>([]);

  const fechaMin = estado === "proxima" ? hoy : undefined;
  const fechaMax = estado === "realizada" ? hoy : undefined;

  const fechaInvalida = !!estado && ((estado === "proxima" && fecha < hoy) || (estado === "realizada" && fecha > hoy));
  const horaInvalida = estado === "proxima" ? esHoraPasada(fecha, hora) : estado === "realizada" ? esHoraFutura(fecha, hora) : false;
  const horaFormatoInvalido = hora.length > 0 && !esHoraValida(hora);

  useEffect(() => {
    if (visible) {
      cargarDatos();
      precargarDatos();
    }
  }, [visible]);

  const precargarDatos = () => {
    setFecha(visita.fecha);
    setHora(visita.hora ?? "");
    setProcedimiento(visita.procedimiento);
    setVeterinarioId(visita.veterinario.id_persona);
    setEstado(visita.estado);
    setInfoAdicional(visita.info_adicional ?? "");
    setCosto(visita.costo ? String(visita.costo) : "");
    setTratamientos(
      visita.tratamientos.map((t) => ({
        key: String(t.id_tratamiento),
        id_tratamiento: t.id_tratamiento,
        tipo: t.tipo,
        fecha_inicio: t.fecha_inicio,
        fecha_fin: t.fecha_fin ?? "",
        descripcion: t.descripcion ?? "",
        pickerInicio: false,
        pickerFin: false,
        eliminado: false,
      }))
    );
  };

  const cargarDatos = async () => {
    try {
      const vets = await api.getPersonas("veterinario");
      setVeterinarios(Array.isArray(vets) ? vets : []);
    } catch (e) {
      console.error(e);
    }
  };

  const nuevoTratamiento = (): TratamientoForm => ({
    key: Date.now().toString() + Math.random().toString(36).slice(2),
    tipo: "",
    fecha_inicio: fecha,
    fecha_fin: "",
    descripcion: "",
    pickerInicio: false,
    pickerFin: false,
    eliminado: false,
  });

  const agregarTratamiento = () =>
    setTratamientos((prev) => [...prev, nuevoTratamiento()]);

  const eliminarTratamiento = (key: string) =>
    setTratamientos((prev) =>
      prev.map((t) =>
        t.key === key
          ? t.id_tratamiento
            ? { ...t, eliminado: true } // existente: marcar como eliminado
            : null                      // nuevo: sacar de la lista
          : t
      ).filter(Boolean) as TratamientoForm[]
    );

  const actualizarTratamiento = (key: string, campo: Partial<TratamientoForm>) =>
    setTratamientos((prev) =>
      prev.map((t) => (t.key === key ? { ...t, ...campo } : t))
    );

  const handleGuardar = async () => {
    if (!fecha) return Alert.alert(t('error'), t('errorFecha'));
    if (fechaInvalida) {return Alert.alert(t('error'), estado === "proxima" ? t('errorFechaDebeSerFutura') : t('errorFechaDebeSerPasada'));}
    if (hora && !esHoraValida(hora)) return Alert.alert(t('error'), t('errorHoraInvalida'));
    if (horaInvalida) {return Alert.alert(t('error'), estado === "proxima" ? t('errorHoraDebeSerFutura') : t('errorHoraDebeSerPasada'));}
    if (!procedimiento.trim()) return Alert.alert(t('error'), t('errorProcedimiento'));
    if (!veterinarioId) return Alert.alert(t('error'), t('errorVeterinario'));
    if (!estado) return Alert.alert(t('error'), t('errorEstado'));

    const costoNumero = costo ? parseFloat(costo.replace(",", ".")) : null;
    if (costo && isNaN(costoNumero!)) {
      return Alert.alert(t('error'), t('errorCostoInvalido'));
    }

    const tratamientosActivos = tratamientos.filter((t) => !t.eliminado);
    for (const tratamiento of tratamientosActivos) {
      if (!tratamiento.tipo.trim()) return Alert.alert(t('error'), t('errorTipo'));
      if (!tratamiento.fecha_inicio) return Alert.alert(t('error'), t('errorFechaInicio'));
      if (fechaInicioTratamientoInvalida(tratamiento.fecha_inicio, fecha)) {
        return Alert.alert(t('error'), t('errorFechaInicioTratamiento'));
      }
      if (fechaFinTratamientoInvalida(tratamiento.fecha_fin, tratamiento.fecha_inicio)) {
        return Alert.alert(t('error'), t('errorFechaFinTratamiento'));
      }
    }

    setLoading(true);
    try {
      // Actualizar visita
      const respuesta = await api.updateVisita(visita.id_visita, {
        fecha,
        hora: hora || null,
        procedimiento: procedimiento.trim(),
        veterinario_id: veterinarioId,
        estado,
        info_adicional: infoAdicional.trim() || null,
        costo: estado === "realizada" ? costoNumero : null,
      });

      // Tratamientos eliminados
      const aEliminar = tratamientos.filter((t) => t.eliminado && t.id_tratamiento);
      for (const t of aEliminar) {
        await api.deleteTratamiento(t.id_tratamiento!);
      }

      // Tratamientos nuevos (sin id_tratamiento)
      const nuevos = tratamientosActivos.filter((t) => !t.id_tratamiento);
      for (const t of nuevos) {
        await api.createTratamientoEnVisita(visita.id_visita, {
          tipo: t.tipo.trim(),
          descripcion: t.descripcion.trim() || null,
          fecha_inicio: t.fecha_inicio,
          fecha_fin: t.fecha_fin || null,
        });
      }

      // Tratamientos existentes
      const existentes = tratamientosActivos.filter((t) => t.id_tratamiento);
      for (const t of existentes) {
        await api.updateTratamiento(t.id_tratamiento!, {
          tipo: t.tipo.trim(),
          descripcion: t.descripcion.trim() || null,
          fecha_inicio: t.fecha_inicio,
          fecha_fin: t.fecha_fin || null,
        });
      }

      onEditada();
      onClose();
      const successMessage = respuesta.tarea_creada
        ? `${t('successEditar')}\n${t('successTareaAgendada', { nombre: respuesta.tarea_nombre })}`
        : t('successEditar');
      Alert.alert(t('success'), successMessage);
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.error ?? t('errorEditar'));
    } finally {
      setLoading(false);
    }
  };

  const veterinariosItems = veterinarios.map((p) => ({
    id: p.id_persona,
    nombre: `${p.nombre} ${p.apellido}`,
  }));

  const tratamientosVisibles = tratamientos.filter((t) => !t.eliminado);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>

          <View style={styles.header}>
            <Text style={styles.titulo}>{t('titleEditarVisita')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            <Text style={styles.label}>{t('labelFecha')}{t('requiredSymbol')}</Text>
            <TouchableOpacity style={styles.inputFecha} onPress={() => setPickerFecha(true)}>
              <Text style={fecha ? styles.fechaTexto : styles.fechaPlaceholder}>
                {fecha ? formatFecha(fecha) : t('placeholderSeleccionarFecha')}
              </Text>
            </TouchableOpacity>
            {fechaInvalida && (
              <Text style={styles.fechaErrorTexto}>
                {estado === "proxima" ? t('errorFechaDebeSerFutura') : t('errorFechaDebeSerPasada')}
              </Text>
            )}

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
              {horaFormatoInvalido && (
                <Text style={styles.fechaErrorTexto}>{t('errorHoraInvalida')}</Text>
              )}
              {horaInvalida && (
                <Text style={styles.fechaErrorTexto}>
                  {estado === "proxima" ? t('errorHoraDebeSerFutura') : t('errorHoraDebeSerPasada')}
                </Text>
              )}

            <Text style={styles.label}>{t('labelProcedimiento')}{t('requiredSymbol')}</Text>
            <TextInput
              value={procedimiento}
              onChangeText={setProcedimiento}
              style={styles.input}
              placeholder={t('placeholderProcedimiento')}
              placeholderTextColor={Colors.textFaint}
            />

            <Text style={styles.label}>{t('labelVeterinario')}{t('requiredSymbol')}</Text>
            <SingleSelector
              value={veterinarioId}
              onChange={setVeterinarioId}
              items={veterinariosItems}
              placeholder={t('placeholderSeleccionarVeterinario')}
              searchable
            />

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

            {tratamientosVisibles.map((tr, idx) => (
              <TratamientoItem
                key={tr.key}
                index={idx}
                tratamiento={tr}
                fechaVisita={fecha} 
                onChange={(campo) => actualizarTratamiento(tr.key, campo)}
                onEliminar={() => eliminarTratamiento(tr.key)}
              />
            ))}

            <TouchableOpacity style={styles.btnAnadirTratamiento} onPress={agregarTratamiento}>
              <Text style={styles.btnAnadirTratamientoTexto}>{t('btnAnadirTratamiento')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleGuardar} disabled={loading} style={styles.btnCrear}>
              {loading
                ? <ActivityIndicator color={Colors.surface} />
                : <Text style={styles.btnCrearTexto}>{t('btnGuardar')}</Text>
              }
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>

      <AnimalDatePickerModal
        visible={pickerFecha}
        onClose={() => setPickerFecha(false)}
        onSelectDate={(d) => setFecha(d)}
        titulo={t('titleSeleccionarFechaVisita')}
        fechaSeleccionada={fecha}
        minDate={fechaMin}
        maxDate={fechaMax}
      />
    </Modal>
  );
}

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

  return (
    <View style={itemStyles.container}>
      <View style={itemStyles.header}>
        <Text style={itemStyles.titulo}>{t('subtitleTratamiento')} {index + 1}</Text>
        <TouchableOpacity onPress={onEliminar} style={itemStyles.btnEliminar}>
          <Text style={itemStyles.btnEliminarTexto}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={itemStyles.label}>{t('labelTipo')}{t('requiredSymbol')}</Text>
      <TextInput
        value={tratamiento.tipo}
        onChangeText={(v) => onChange({ tipo: v })}
        style={itemStyles.input}
        placeholder={t('placeholderTipo')}
        placeholderTextColor={Colors.textFaint}
      />

      <Text style={itemStyles.label}>{t('labelFechaInicio')}{t('requiredSymbol')}</Text>
      <TouchableOpacity style={itemStyles.inputFecha} onPress={() => onChange({ pickerInicio: true })}>
        <Text style={tratamiento.fecha_inicio ? itemStyles.fechaTexto : itemStyles.fechaPlaceholder}>
          {tratamiento.fecha_inicio ? formatFecha(tratamiento.fecha_inicio) : t('placeholderSeleccionarFecha')}
        </Text>
      </TouchableOpacity>
      {fechaInicioInvalida && (
        <Text style={itemStyles.fechaErrorTexto}>{t('errorFechaInicioTratamiento')}</Text>
      )}

      <Text style={itemStyles.label}>{t('labelFechaFin')}</Text>
      <TouchableOpacity style={itemStyles.inputFecha} onPress={() => onChange({ pickerFin: true })}>
        <Text style={tratamiento.fecha_fin ? itemStyles.fechaTexto : itemStyles.fechaPlaceholder}>
          {tratamiento.fecha_fin ? formatFecha(tratamiento.fecha_fin) : t('placeholderSeleccionarFecha')}
        </Text>
      </TouchableOpacity>
      {fechaFinInvalida && (
        <Text style={itemStyles.fechaErrorTexto}>{t('errorFechaFinTratamiento')}</Text>
      )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  container: { backgroundColor: Colors.primaryFaint, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "92%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  titulo: { fontSize: 20, fontWeight: "bold", color: Colors.text },
  cerrar: { fontSize: 22, color: Colors.textMuted },
  label: { fontWeight: "600", marginBottom: 4, color: Colors.text, fontSize: 14, marginTop: 4 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, fontSize: 14, color: Colors.text },
  inputMultiline: { textAlignVertical: "top" },
  inputFecha: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16 },
  fechaTexto: { fontSize: 14, color: Colors.text },
  fechaPlaceholder: { fontSize: 14, color: Colors.textFaint },
  opcionesRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  badge: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  badgeActivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  badgeTexto: { color: Colors.textSoft, fontSize: 14, fontWeight: "500" },
  badgeTextoActivo: { color: Colors.surface, fontSize: 14, fontWeight: "600" },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 20 },
  seccionTitulo: { fontSize: 16, fontWeight: "700", color: Colors.text, marginBottom: 12 },
  btnAnadirTratamiento: { borderWidth: 1.5, borderColor: Colors.primary, borderStyle: "dashed", borderRadius: 12, paddingVertical: 12, alignItems: "center", marginBottom: 20 },
  btnAnadirTratamientoTexto: { color: Colors.primary, fontWeight: "600", fontSize: 14 },
  btnCrear: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 20, alignItems: "center", marginBottom: 8 },
  btnCrearTexto: { color: Colors.surface, fontWeight: "bold", fontSize: 16 },
  fechaErrorTexto: { color: Colors.delete, fontSize: 12, marginTop: -10, marginBottom: 14,},
});

const itemStyles = StyleSheet.create({
  container: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.primary },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  titulo: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  btnEliminar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.borderLight, alignItems: "center", justifyContent: "center" },
  btnEliminarTexto: { fontSize: 13, color: Colors.textMuted, fontWeight: "bold" },
  label: { fontWeight: "600", marginBottom: 4, color: Colors.text, fontSize: 13, marginTop: 2 },
  input: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 12, fontSize: 13, color: Colors.text },
  inputMultiline: { textAlignVertical: "top" },
  inputFecha: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 12 },
  fechaTexto: { fontSize: 13, color: Colors.text },
  fechaPlaceholder: { fontSize: 13, color: Colors.textFaint },
  fechaErrorTexto: { color: Colors.delete, fontSize: 11, marginTop: -8, marginBottom: 10 },
});