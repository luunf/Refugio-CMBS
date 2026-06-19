//datepickermodal
import React, { useState } from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';

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
  onSelectDate: (date: Date) => void;
  initialDate?: Date;
}

export default function DatePickerModal({ visible, onClose, onSelectDate, initialDate }: Props) {
  const { t } = useTranslation('calendario');

  const [selectedDate, setSelectedDate] = useState(
    initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );

  const handleConfirm = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    onSelectDate(date);
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.titulo}>{t('datePicker.titulo')}</Text>

          <Calendar
            current={selectedDate}
            minDate={today}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            theme={{
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: Colors.surface,
              todayTextColor: Colors.primary,
              arrowColor: Colors.primary,
              monthTextColor: Colors.primary,
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
            }}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: Colors.primary },
            }}
            style={styles.calendar}
          />

          <View style={styles.botones}>
            <TouchableOpacity onPress={onClose} style={styles.btnCancelar}>
              <Text style={styles.btnCancelarText}>{t('datePicker.cancelar')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.btnConfirmar}>
              <Text style={styles.btnConfirmarText}>{t('datePicker.aceptar')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text,
  },
  calendar: {
    width: '100%',
    borderRadius: 12,
  },
  botones: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  btnCancelar: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: Colors.border,
    borderRadius: 20,
  },
  btnCancelarText: { color: Colors.textSoft },
  btnConfirmar: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  btnConfirmarText: { color: Colors.surface, fontWeight: 'bold' },
});