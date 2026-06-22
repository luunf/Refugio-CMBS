import React, { useState, useEffect } from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (dateString: string) => void;
  titulo?: string;
  fechaSeleccionada?: string;
  minDate?: string; 
  maxDate?: string; 
}

export default function VisitaDatePickerModal({
  visible, onClose, onSelectDate, titulo, fechaSeleccionada, minDate, maxDate,
}: Props) {
  const { t } = useTranslation('visitas');
  const tituloFinal = titulo ?? t('placeholderSeleccionarFecha');
  const hoy = new Date().toISOString().split('T')[0];

  const [selected, setSelected] = useState(fechaSeleccionada ?? hoy);

  useEffect(() => {
    if (visible) setSelected(fechaSeleccionada ?? hoy);
  }, [visible, fechaSeleccionada]);

  const handleConfirm = () => {
    onSelectDate(selected);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.titulo}>{tituloFinal}</Text>
          <Calendar
            current={selected}
            minDate={minDate}
            maxDate={maxDate}
            onDayPress={(day) => setSelected(day.dateString)}
            theme={{
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: Colors.surface,
              todayTextColor: Colors.primary,
              arrowColor: Colors.primary,
              monthTextColor: Colors.primary,
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDisabledColor: Colors.textFaint,
            }}
            markedDates={{
              [selected]: { selected: true, selectedColor: Colors.primary },
            }}
            style={styles.calendar}
          />
          <View style={styles.botones}>
            <TouchableOpacity onPress={onClose} style={styles.btnCancelar}>
              <Text style={styles.btnCancelarText}>{t('btnCancelar')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.btnConfirmar}>
              <Text style={styles.btnConfirmarText}>{t('btnAceptar')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { backgroundColor: Colors.surface, borderRadius: 20, padding: 20, width: '90%', alignItems: 'center' },
  titulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: Colors.text },
  calendar: { width: '100%', borderRadius: 12 },
  botones: { flexDirection: 'row', marginTop: 20, gap: 12 },
  btnCancelar: { paddingVertical: 8, paddingHorizontal: 20, backgroundColor: Colors.border, borderRadius: 20 },
  btnCancelarText: { color: Colors.textSoft },
  btnConfirmar: { paddingVertical: 8, paddingHorizontal: 20, backgroundColor: Colors.primary, borderRadius: 20 },
  btnConfirmarText: { color: 'white', fontWeight: 'bold' },
});