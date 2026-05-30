import React, { useState } from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  initialDate?: Date;
}

export default function DatePickerModal({ visible, onClose, onSelectDate, initialDate }: Props) {
  const [selectedDate, setSelectedDate] = useState(
    initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );

  const handleConfirm = () => {
    const date = new Date(selectedDate);
    onSelectDate(date);
    onClose();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.titulo}>Selecciona una fecha</Text>

          <Calendar
            current={selectedDate}
            minDate={today}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            theme={{
              selectedDayBackgroundColor: '#f97316',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#f97316',
              arrowColor: '#f97316',
              monthTextColor: '#f97316',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
            }}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#f97316' },
            }}
            style={styles.calendar}
          />

          <View style={styles.botones}>
            <TouchableOpacity onPress={onClose} style={styles.btnCancelar}>
              <Text style={styles.btnCancelarText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.btnConfirmar}>
              <Text style={styles.btnConfirmarText}>Aceptar</Text>
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
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
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
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
  },
  btnCancelarText: { color: '#374151' },
  btnConfirmar: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#f97316',
    borderRadius: 20,
  },
  btnConfirmarText: { color: 'white', fontWeight: 'bold' },
});