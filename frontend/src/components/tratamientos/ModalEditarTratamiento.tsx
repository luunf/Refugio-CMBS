import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import DatePickerModal from '../calendario/DatePickerModal';
import TimePickerModal from '../calendario/TimePickerModal';

interface Props {
  visible: boolean;
  onClose: () => void;
  tratamiento: any;
  onSave: (id: number, data: any) => Promise<void>;
}

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseFecha = (fechaStr: string): Date => {
  const [y, m, d] = fechaStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const formatFechaDisplay = (fecha: Date): string => {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${d}/${m}/${y}`;
};

export default function ModalEditarTratamiento({ visible, onClose, tratamiento, onSave }: Props) {
  const { t } = useTranslation('tratamientos');

  const [tipo, setTipo] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [frecuenciaHoras, setFrecuenciaHoras] = useState<number | null>(null);
  const [horaAdministracion, setHoraAdministracion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFin, setShowPickerFin] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (visible && tratamiento) {
      setTipo(tratamiento.tipo || '');
      setDescripcion(tratamiento.descripcion || '');
      setFrecuenciaHoras(tratamiento.frecuencia_horas || null);
      setHoraAdministracion(tratamiento.hora_administracion || '');

      if (tratamiento.fecha_inicio) {
        setFechaInicio(parseFecha(tratamiento.fecha_inicio.split('T')[0]));
      }
      if (tratamiento.fecha_fin) {
        setFechaFin(parseFecha(tratamiento.fecha_fin.split('T')[0]));
      } else {
        setFechaFin(null);
      }
    }
  }, [visible, tratamiento]);

  const fechaFinInvalida = fechaFin !== null && fechaFin < fechaInicio;

  const handleSave = async () => {
    if (!tipo || fechaFinInvalida) return;

    setLoading(true);
    try {
      await onSave(tratamiento.id, {
        tipo,
        fecha_inicio: formatDate(fechaInicio),
        fecha_fin: fechaFin ? formatDate(fechaFin) : null,
        descripcion,
        frecuencia_horas: frecuenciaHoras,
        hora_administracion: horaAdministracion || null,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const FRECUENCIAS = [
    { label: t('modalEditar.frecuencia8'), value: 8 },
    { label: t('modalEditar.frecuencia12'), value: 12 },
    { label: t('modalEditar.frecuencia24'), value: 24 },
  ];

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.titulo}>{t('modalEditar.titulo')}</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cerrar}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>{t('modalEditar.tipoLabel')}</Text>
            <TextInput value={tipo} onChangeText={setTipo} style={styles.input} />

            <Text style={styles.label}>{t('modalEditar.fechaInicioLabel')}</Text>
            <TouchableOpacity onPress={() => setShowPickerInicio(true)} style={styles.inputBtn}>
              <Text style={styles.inputBtnText}>{formatFechaDisplay(fechaInicio)}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>{t('modalEditar.fechaFinLabel')}</Text>
            <TouchableOpacity onPress={() => setShowPickerFin(true)} style={styles.inputBtn}>
              <Text style={[styles.inputBtnText, !fechaFin && { color: Colors.textFaint }]}>
                {fechaFin ? formatFechaDisplay(fechaFin) : t('modalEditar.fechaFinPlaceholder')}
              </Text>
            </TouchableOpacity>

            {fechaFinInvalida && (
              <Text style={styles.errorTexto}>{t('modalEditar.errorFechaFin')}</Text>
            )}

            <Text style={styles.label}>{t('modalEditar.descripcionLabel')}</Text>
            <TextInput 
              value={descripcion} 
              onChangeText={setDescripcion} 
              multiline 
              style={styles.input} 
            />

            <Text style={styles.label}>{t('modalEditar.frecuenciaLabel')}</Text>
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
                  {t('modalEditar.frecuenciaFija')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* ─── CAMPO HORA SOLO SI HAY FRECUENCIA SELECCIONADA ─── */}
            {frecuenciaHoras !== null && (
              <>
                <Text style={styles.label}>{t('modalEditar.horaLabel')}</Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  style={[styles.inputBtn, !horaAdministracion && { borderColor: Colors.border }]}
                >
                  <Text style={[styles.inputBtnText, !horaAdministracion && { color: Colors.textFaint }]}>
                    {horaAdministracion || t('modalEditar.horaPlaceholder')}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              onPress={handleSave}
              disabled={loading || !tipo || fechaFinInvalida}
              style={[styles.btnGuardar, (!tipo || fechaFinInvalida) && { opacity: 0.5 }]}
            >
              {loading ? <ActivityIndicator color={Colors.surface} /> : <Text style={styles.btnTexto}>{t('modalEditar.btnGuardar')}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DatePickerModal
        visible={showPickerInicio}
        onClose={() => setShowPickerInicio(false)}
        onSelectDate={setFechaInicio}
        initialDate={fechaInicio}
      />
      <DatePickerModal
        visible={showPickerFin}
        onClose={() => setShowPickerFin(false)}
        onSelectDate={setFechaFin}
        initialDate={fechaFin ?? fechaInicio}
      />
      <TimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onSelectTime={(hora) => setHoraAdministracion(hora)}
        initialTime={horaAdministracion || '08:00'}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  container: { backgroundColor: Colors.primaryFaint, borderRadius: 24, padding: 24, width: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  cerrar: { fontSize: 22, color: Colors.textMuted },
  label: { fontWeight: '600', marginBottom: 4, color: Colors.text, marginTop: 8 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
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
  inputBtnText: { color: Colors.text, fontSize: 14, flex: 1 },
  errorTexto: { color: Colors.delete, fontSize: 12, marginBottom: 8 },
  btnGuardar: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 20, alignItems: 'center', marginTop: 8 },
  btnTexto: { color: Colors.surface, fontWeight: 'bold', fontSize: 16 },
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