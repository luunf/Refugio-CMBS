import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import DatePickerModal from '../calendario/DatePickerModal';

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

  const [tipo, setTipo] = useState(tratamiento?.tipo || '');
  const [fechaInicio, setFechaInicio] = useState<Date>(
    tratamiento?.fecha_inicio ? parseFecha(tratamiento.fecha_inicio.split('T')[0]) : new Date()
  );
  const [fechaFin, setFechaFin] = useState<Date | null>(
    tratamiento?.fecha_fin ? parseFecha(tratamiento.fecha_fin.split('T')[0]) : null
  );
  const [descripcion, setDescripcion] = useState(tratamiento?.descripcion || '');
  const [loading, setLoading] = useState(false);
  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFin, setShowPickerFin] = useState(false);

  const fechaFinInvalida = fechaFin !== null && fechaFin < fechaInicio;

  const handleSave = async () => {
    if (!tipo || !fechaInicio || fechaFinInvalida) return;
    setLoading(true);
    try {
      await onSave(tratamiento.id, {
        tipo,
        fecha_inicio: formatDate(fechaInicio),
        fecha_fin: fechaFin ? formatDate(fechaFin) : null,
        descripcion,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
              <Text style={styles.calIcon}></Text>
            </TouchableOpacity>

            <Text style={styles.label}>{t('modalEditar.fechaFinLabel')}</Text>
            <TouchableOpacity onPress={() => setShowPickerFin(true)} style={styles.inputBtn}>
              <Text style={[styles.inputBtnText, !fechaFin && { color: Colors.textFaint }]}>
                {fechaFin ? formatFechaDisplay(fechaFin) : t('modalEditar.fechaFinPlaceholder')}
              </Text>
              <Text style={styles.calIcon}></Text>
            </TouchableOpacity>
            {fechaFinInvalida && (
              <Text style={styles.errorTexto}>{t('modalEditar.errorFechaFin')}</Text>
            )}

            <Text style={styles.label}>{t('modalEditar.descripcionLabel')}</Text>
            <TextInput value={descripcion} onChangeText={setDescripcion} multiline style={styles.input} />

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
        onSelectDate={(date) => setFechaInicio(date)}
        initialDate={fechaInicio}
      />
      <DatePickerModal
        visible={showPickerFin}
        onClose={() => setShowPickerFin(false)}
        onSelectDate={(date) => setFechaFin(date)}
        initialDate={fechaFin ?? fechaInicio}
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
  inputBtnText: { color: Colors.text, fontSize: 14, flex: 1, }, 
  calIcon: { fontSize: 18 },
  errorTexto: { color: Colors.delete, fontSize: 12, marginBottom: 8 },
  btnGuardar: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 20, alignItems: 'center', marginTop: 8 },
  btnTexto: { color: Colors.surface, fontWeight: 'bold', fontSize: 16 },
});