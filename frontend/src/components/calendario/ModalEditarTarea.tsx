import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet, Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import DatePickerModal from './DatePickerModal';
import TimePickerModal from './TimePickerModal';
import { Colors } from '@/constants/theme';
import { api } from '@/config/api';
import { MaterialIcons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: any) => Promise<void>;
  tarea: any;
}

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const esFechaPasada = (date: Date): boolean => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaSinHora = new Date(date);
  fechaSinHora.setHours(0, 0, 0, 0);
  return fechaSinHora < hoy;
};

const esHoraValida = (hora: string): boolean => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(hora);
};

const esHoraPasada = (fecha: Date, hora: string): boolean => {
  if (!esHoraValida(hora)) return false;
  const ahora = new Date();
  const esHoy = formatDate(fecha) === formatDate(ahora);
  if (!esHoy) return false;
  const [h, m] = hora.split(':').map(Number);
  const horaTarea = new Date(fecha);
  horaTarea.setHours(h, m, 0, 0);
  return horaTarea < ahora;
};

const parseFecha = (fechaStr: string): Date => {
  const [y, m, d] = fechaStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export default function ModalEditarTarea({ visible, onClose, onUpdate, tarea }: Props) {
  const { t } = useTranslation('calendario');

  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState('');
  const [esTodoElDia, setEsTodoElDia] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errorHora, setErrorHora] = useState('');

  const [descripcion, setDescripcion] = useState('');
  const [frecuenciaHoras, setFrecuenciaHoras] = useState<number | null>(null);
  const esTareaDeTratamiento = tarea?.tratamiento_id != null;

  const [voluntarios, setVoluntarios] = useState<any[]>([]);
  const [voluntariosSeleccionados, setVoluntariosSeleccionados] = useState<number[]>([]);
  const [showVoluntarios, setShowVoluntarios] = useState(false);
  const [loadingVoluntarios, setLoadingVoluntarios] = useState(false);

  useEffect(() => {
    if (visible && tarea) {
      setNombre(tarea.nombre ?? '');
      setFecha(tarea.fecha ? parseFecha(tarea.fecha) : new Date());
      setHora(tarea.hora ? tarea.hora.substring(0, 5) : '');
      setEsTodoElDia(!!tarea.es_todo_el_dia);
      setErrorHora('');
      
      setDescripcion(tarea.descripcion || '');
      setFrecuenciaHoras(tarea.tratamiento_frecuencia || null);
      
      const idsActuales = tarea.personas?.map((p: any) => p.id_persona) ?? [];
      setVoluntariosSeleccionados(idsActuales);

      setLoadingVoluntarios(true);
      api.getPersonas('voluntario')
        .then(setVoluntarios)
        .catch(console.error)
        .finally(() => setLoadingVoluntarios(false));
    }
  }, [visible, tarea]);

  const toggleVoluntario = (id: number) => {
    setVoluntariosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const handleSelectFecha = (nuevaFecha: Date) => {
    setFecha(nuevaFecha);
    if (hora.length === 5 && esHoraValida(hora)) {
      setErrorHora(esHoraPasada(nuevaFecha, hora) ? t('modalNuevaTarea.errorHoraPasada') : '');
    }
  };

  const handleSelectTime = (horaSeleccionada: string) => {
    setHora(horaSeleccionada);
    if (esHoraPasada(fecha, horaSeleccionada)) {
      setErrorHora(t('modalNuevaTarea.errorHoraPasada'));
    } else {
      setErrorHora('');
    }
  };

  const puedeGuardar = () => {
    if (!nombre) return false;
    if (!esTodoElDia) {
      if (!hora || !esHoraValida(hora)) return false;
      // if (esHoraPasada(fecha, hora)) return false;
    }
    return true;
  };

  const esTareaOriginalVencida = (): boolean => {
    if (!tarea) return false;
    
    if (tarea.completada) return false;
    
    if (tarea.es_todo_el_dia) return false;
    
    if (!tarea.hora) return false;
    
    const fechaOriginal = tarea.fecha ? parseFecha(tarea.fecha) : null;
    if (!fechaOriginal) return false;
    
    const horaOriginal = tarea.hora.substring(0, 5);
    if (!esHoraValida(horaOriginal)) return false;
    
    return esHoraPasada(fechaOriginal, horaOriginal) || esFechaPasada(fechaOriginal);
  };

  const handleGuardar = async () => {
    if (!puedeGuardar() || !tarea) return;
    
    const tareaOriginalVencida = esTareaOriginalVencida();
    
    if (tareaOriginalVencida) {
      Alert.alert(
        t('modalEditarTarea.confirmTitulo'), 
        t('modalEditarTarea.confirmMensaje'), 
        [
          {
            text: t('modalEditarTarea.confirmCancelar') || 'Cancelar',
            style: 'cancel',
          },
          {
            text: t('modalEditarTarea.confirmAceptar') || 'Sí, editar',
            onPress: guardarTarea,
            style: 'default',
          },
        ]
      );
    } else {
      guardarTarea();
    }
  };

  const guardarTarea = async () => {
    setLoading(true);
    try {
      const dataToSend: any = {
        nombre,
        fecha: formatDate(fecha),
        hora: esTodoElDia ? null : hora || null,
        es_todo_el_dia: esTodoElDia,
        personas_ids: voluntariosSeleccionados,
      };

      if (esTareaDeTratamiento) {
        dataToSend.descripcion = descripcion;
        dataToSend.frecuencia_horas = frecuenciaHoras;
      }

      await onUpdate(tarea.id_tarea, dataToSend);
      onClose();
    } catch (e) {
      console.error(e);
      Alert.alert(
        t('alert.error'),
        t('alert.errorGenerico')
      );
    } finally {
      setLoading(false);
    }
  };

  const FRECUENCIAS = [
    { label: t('modalEditarTarea.frecuencia8'), value: 8 },
    { label: t('modalEditarTarea.frecuencia12'), value: 12 },
    { label: t('modalEditarTarea.frecuencia24'), value: 24 },
  ];

  const fechaStr = formatDate(fecha);
  const fechaInvalida = esFechaPasada(fecha);

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.titulo}>{t('modalEditarTarea.titulo')}</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cerrar}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>{t('modalNuevaTarea.nombreLabel')}</Text>
              <TextInput
                value={nombre}
                onChangeText={setNombre}
                placeholder={t('modalNuevaTarea.nombrePlaceholder')}
                style={styles.input}
              />

              <Text style={styles.label}>{t('modalNuevaTarea.fechaLabel')}</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                <Text style={fechaInvalida && { color: Colors.delete }}>{fechaStr}</Text>
              </TouchableOpacity>
              {fechaInvalida && (
                <Text style={styles.errorTexto}>{t('modalNuevaTarea.errorFechaPasada')}</Text>
              )}

              <Text style={styles.label}>{t('modalNuevaTarea.horarioLabel')}</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  onPress={() => setEsTodoElDia(false)}
                  style={[styles.btnTipo, !esTodoElDia && styles.btnTipoActivo]}
                >
                  <Text style={!esTodoElDia ? styles.btnTipoTextoActivo : styles.btnTipoTexto}>
                    {t('modalNuevaTarea.puntual')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setEsTodoElDia(true)}
                  style={[styles.btnTipo, esTodoElDia && styles.btnTipoActivo]}
                >
                  <Text style={esTodoElDia ? styles.btnTipoTextoActivo : styles.btnTipoTexto}>
                    {t('modalNuevaTarea.todoElDia')}
                  </Text>
                </TouchableOpacity>
              </View>

              {!esTodoElDia && (
                <>
                  <Text style={styles.label}>
                    {t('modalNuevaTarea.horaLabel')}
                    <Text style={styles.asterisco}> *</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    style={[styles.input, !hora && styles.inputObligatorio]}
                  >
                    <Text style={[styles.inputBtnText, !hora && { color: Colors.textFaint }]}>
                      {hora || t('modalNuevaTarea.horaPlaceholder')}
                    </Text>
                  </TouchableOpacity>
                  {errorHora ? (
                    <Text style={styles.errorTexto}>{errorHora}</Text>
                  ) : !hora ? (
                    <Text style={styles.errorTexto}>{t('modalNuevaTarea.errorHoraObligatoria')}</Text>
                  ) : null}
                </>
              )}

              {esTareaDeTratamiento && (
                <>
                  <Text style={styles.label}>{t('modalEditarTarea.descripcionLabel')}</Text>
                  <TextInput
                    value={descripcion}
                    onChangeText={setDescripcion}
                    placeholder={t('modalEditarTarea.descripcionPlaceholder')}
                    multiline
                    style={styles.input}
                  />

                  <Text style={styles.label}>{t('modalEditarTarea.frecuenciaLabel')}</Text>
                  <View style={styles.frecuenciaContainer}>
                    {FRECUENCIAS.map((f) => (
                      <TouchableOpacity
                        key={f.value}
                        onPress={() => setFrecuenciaHoras(f.value)}
                        style={[
                          styles.btnFrecuencia,
                          frecuenciaHoras === f.value && styles.btnFrecuenciaActivo
                        ]}
                      >
                        <Text style={[
                          styles.btnFrecuenciaText,
                          frecuenciaHoras === f.value && styles.btnFrecuenciaTextActivo
                        ]}>
                          {f.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      onPress={() => setFrecuenciaHoras(null)}
                      style={[
                        styles.btnFrecuencia,
                        frecuenciaHoras === null && styles.btnFrecuenciaActivo
                      ]}
                    >
                      <Text style={[
                        styles.btnFrecuenciaText,
                        frecuenciaHoras === null && styles.btnFrecuenciaTextActivo
                      ]}>
                        {t('modalEditarTarea.frecuenciaFija')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <Text style={styles.label}>{t('modalNuevaTarea.voluntariosLabel')}</Text>
              <TouchableOpacity
                onPress={() => setShowVoluntarios(!showVoluntarios)}
                style={styles.inputBtn}
              >
                <Text style={[styles.inputBtnText, voluntariosSeleccionados.length === 0 && { color: Colors.textFaint }]}>
                  {loadingVoluntarios
                    ? t('modalNuevaTarea.cargandoVoluntarios')
                    : voluntariosSeleccionados.length > 0
                      ? t('modalNuevaTarea.voluntariosSeleccionados', { count: voluntariosSeleccionados.length })
                      : t('modalNuevaTarea.seleccionarVoluntarios')}
                </Text>
                <MaterialIcons name={showVoluntarios ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={18} color={Colors.primary} />
              </TouchableOpacity>
              {showVoluntarios && (
                <View style={styles.dropdown}>
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 160 }}>
                    {voluntarios.length === 0 ? (
                      <Text style={styles.dropdownVacio}>{t('modalNuevaTarea.sinVoluntarios')}</Text>
                    ) : (
                      voluntarios.map(p => {
                        const seleccionado = voluntariosSeleccionados.includes(p.id_persona);
                        return (
                          <TouchableOpacity
                            key={p.id_persona}
                            onPress={() => toggleVoluntario(p.id_persona)}
                            style={[styles.dropdownItem, seleccionado && styles.dropdownItemActivo]}
                          >
                            <Text style={styles.dropdownText}>{p.nombre} {p.apellido}</Text>
                            {seleccionado && <Text style={styles.dropdownCheck}>✓</Text>}
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              )}
              <TouchableOpacity
                onPress={handleGuardar}
                disabled={loading || !puedeGuardar()}
                style={[styles.btnCrear, (!puedeGuardar() || loading) && styles.btnCrearDisabled]}
              >
                {loading ? <ActivityIndicator color={Colors.surface} /> : <Text style={styles.btnCrearTexto}>{t('modalEditarTarea.btnGuardar')}</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={handleSelectFecha}
        initialDate={fecha}
      />

      <TimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onSelectTime={handleSelectTime}
        initialTime={hora || '08:00'}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    backgroundColor: Colors.primaryFaint,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  cerrar: {
    fontSize: 22,
    color: Colors.textMuted,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.text,
    marginTop: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  inputError: {
    borderColor: Colors.delete,
  },
  inputObligatorio: {
    borderColor: Colors.delete,
    borderWidth: 1.5,
  },
  errorTexto: {
    color: Colors.delete,
    fontSize: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  btnTipo: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
  },
  btnTipoActivo: {
    backgroundColor: Colors.primary,
  },
  btnTipoTexto: {
    color: Colors.primary,
    fontWeight: '600',
  },
  btnTipoTextoActivo: {
    color: Colors.surface,
    fontWeight: '600',
  },
  inputBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputBtnText: {
    color: Colors.text,
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  dropdown: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemActivo: {
    backgroundColor: Colors.primaryFaint,
  },
  dropdownText: { fontSize: 14, color: Colors.text },
  dropdownCheck: { color: Colors.primary, fontWeight: 'bold' },
  dropdownVacio: {
    textAlign: 'center',
    color: Colors.textFaint,
    padding: 16,
    fontSize: 14,
  },
  btnCrear: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  btnCrearDisabled: {
    backgroundColor: Colors.primaryLight,
    opacity: 0.5,
  },
  btnCrearTexto: {
    color: Colors.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  asterisco: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  frecuenciaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  btnFrecuencia: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
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
    fontSize: 13,
    fontWeight: '500',
  },
  btnFrecuenciaTextActivo: {
    color: Colors.surface,
    fontWeight: '600',
  },
});