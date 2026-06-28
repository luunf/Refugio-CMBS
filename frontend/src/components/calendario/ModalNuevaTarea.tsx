// src/components/calendario/ModalNuevaTarea.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet
} from 'react-native';
import { useTranslation } from 'react-i18next';
import DatePickerModal from './DatePickerModal';
import { Colors } from '@/constants/theme';
import { api } from '@/config/api';
import { MaterialIcons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (tarea: any) => Promise<void>;
  mesActual: number;
  yearActual: number;
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

export default function ModalNuevaTarea({ visible, onClose, onCreate, mesActual, yearActual }: Props) {
  const { t } = useTranslation('calendario');

  const hoy = new Date();
  const fechaInicial = () => {
    const esMesActual = mesActual === hoy.getMonth() + 1 && yearActual === hoy.getFullYear();
    return esMesActual ? hoy : new Date(yearActual, mesActual - 1, 1);
  };

  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState(fechaInicial());
  const [hora, setHora] = useState('');
  const [esTodoElDia, setEsTodoElDia] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errorHora, setErrorHora] = useState('');

  const [voluntarios, setVoluntarios] = useState<any[]>([]);
  const [voluntariosSeleccionados, setVoluntariosSeleccionados] = useState<number[]>([]);
  const [showVoluntarios, setShowVoluntarios] = useState(false);
  const [loadingVoluntarios, setLoadingVoluntarios] = useState(false);

  useEffect(() => {
    if (visible) {
      setLoadingVoluntarios(true);
      api.getPersonas('voluntario')
        .then(setVoluntarios)
        .catch(console.error)
        .finally(() => setLoadingVoluntarios(false));
    }
  }, [visible]);

  const toggleVoluntario = (id: number) => {
    setVoluntariosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const handleCambioHora = (texto: string) => {
    setHora(texto);
    if (texto.length === 5) {
      if (!esHoraValida(texto)) {
        setErrorHora(t('modalNuevaTarea.errorHoraInvalida'));
      } else if (esHoraPasada(fecha, texto)) {
        setErrorHora(t('modalNuevaTarea.errorHoraPasada'));
      } else {
        setErrorHora('');
      }
    } else {
      setErrorHora('');
    }
  };

  const handleSelectFecha = (nuevaFecha: Date) => {
    setFecha(nuevaFecha);
    if (hora.length === 5 && esHoraValida(hora)) {
      setErrorHora(esHoraPasada(nuevaFecha, hora) ? t('modalNuevaTarea.errorHoraPasada') : '');
    }
  };

  const puedeCrear = () => {
    if (!nombre) return false;
    if (esFechaPasada(fecha)) return false;
    if (!esTodoElDia) {
      if (!hora || !esHoraValida(hora)) return false;
      if (esHoraPasada(fecha, hora)) return false;
    }
    return true;
  };

  const resetForm = () => {
    setNombre('');
    setHora('');
    setErrorHora('');
    setEsTodoElDia(false);
    setFecha(fechaInicial());
    setVoluntariosSeleccionados([]);
  };

  const handleCrear = async () => {
    if (!puedeCrear()) return;
    setLoading(true);
    try {
      await onCreate({
        nombre,
        fecha: formatDate(fecha),
        hora: esTodoElDia ? null : hora || null,
        es_todo_el_dia: esTodoElDia,
        completada: false,
        personas_ids: voluntariosSeleccionados,
      });
      resetForm();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fechaStr = formatDate(fecha);
  const fechaInvalida = esFechaPasada(fecha);

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.titulo}>{t('modalNuevaTarea.titulo')}</Text>
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
                  <TextInput
                    value={hora}
                    onChangeText={handleCambioHora}
                    placeholder={t('modalNuevaTarea.horaPlaceholder')}
                    style={[styles.input, errorHora && styles.inputError, !hora && styles.inputObligatorio]}
                    maxLength={5}
                    keyboardType="numbers-and-punctuation"
                  />
                  {errorHora ? (
                    <Text style={styles.errorTexto}>{errorHora}</Text>
                  ) : !hora ? (
                    <Text style={styles.errorTexto}>{t('modalNuevaTarea.errorHoraObligatoria')}</Text>
                  ) : null}
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
                onPress={handleCrear}
                disabled={loading || !puedeCrear()}
                style={[styles.btnCrear, (!puedeCrear() || loading) && styles.btnCrearDisabled]}
              >
                {loading ? <ActivityIndicator color={Colors.surface} /> : <Text style={styles.btnCrearTexto}>{t('modalNuevaTarea.btnCrear')}</Text>}
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
});