// src/components/calendario/TimePickerModal.tsx
import React, { useState } from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectTime: (hora: string) => void;
  initialTime?: string; // formato "HH:MM"
}

export default function TimePickerModal({ visible, onClose, onSelectTime, initialTime }: Props) {
  const { t } = useTranslation('calendario');

  const getInitialDate = (): Date => {
    if (initialTime) {
      const [hours, minutes] = initialTime.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
    const date = new Date();
    date.setHours(8, 0, 0, 0);
    return date;
  };

  const [selectedTime, setSelectedTime] = useState<Date>(getInitialDate());

  // ─── HORAS (1 en 1) ───
  const incrementarHora = () => {
    const newDate = new Date(selectedTime);
    let horas = newDate.getHours() + 1;
    if (horas > 23) horas = 0;
    newDate.setHours(horas);
    setSelectedTime(newDate);
  };

  const decrementarHora = () => {
    const newDate = new Date(selectedTime);
    let horas = newDate.getHours() - 1;
    if (horas < 0) horas = 23;
    newDate.setHours(horas);
    setSelectedTime(newDate);
  };

  // ─── MINUTOS (1 en 1) ───
  const incrementarMinuto = () => {
    const newDate = new Date(selectedTime);
    let minutos = newDate.getMinutes() + 1;
    if (minutos >= 60) {
      minutos = 0;
      let horas = newDate.getHours() + 1;
      if (horas > 23) horas = 0;
      newDate.setHours(horas);
    }
    newDate.setMinutes(minutos);
    setSelectedTime(newDate);
  };

  const decrementarMinuto = () => {
    const newDate = new Date(selectedTime);
    let minutos = newDate.getMinutes() - 1;
    if (minutos < 0) {
      minutos = 59;
      let horas = newDate.getHours() - 1;
      if (horas < 0) horas = 23;
      newDate.setHours(horas);
    }
    newDate.setMinutes(minutos);
    setSelectedTime(newDate);
  };

  const handleConfirm = () => {
    const horas = String(selectedTime.getHours()).padStart(2, '0');
    const minutos = String(selectedTime.getMinutes()).padStart(2, '0');
    onSelectTime(`${horas}:${minutos}`);
    onClose();
  };

  const horas = String(selectedTime.getHours()).padStart(2, '0');
  const minutos = String(selectedTime.getMinutes()).padStart(2, '0');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.titulo}>{t('timePicker.titulo')}</Text>

          <View style={styles.selectorContainer}>
            {/* Horas */}
            <View style={styles.columna}>
              <TouchableOpacity onPress={incrementarHora} style={styles.btnFlecha}>
                <Text style={styles.flecha}>▲</Text>
              </TouchableOpacity>
              <Text style={styles.valor}>{horas}</Text>
              <TouchableOpacity onPress={decrementarHora} style={styles.btnFlecha}>
                <Text style={styles.flecha}>▼</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.separador}>:</Text>

            {/* Minutos */}
            <View style={styles.columna}>
              <TouchableOpacity onPress={incrementarMinuto} style={styles.btnFlecha}>
                <Text style={styles.flecha}>▲</Text>
              </TouchableOpacity>
              <Text style={styles.valor}>{minutos}</Text>
              <TouchableOpacity onPress={decrementarMinuto} style={styles.btnFlecha}>
                <Text style={styles.flecha}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.botones}>
            <TouchableOpacity onPress={onClose} style={styles.btnCancelar}>
              <Text style={styles.btnCancelarText}>{t('timePicker.cancelar')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.btnConfirmar}>
              <Text style={styles.btnConfirmarText}>{t('timePicker.confirmar')}</Text>
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
    maxWidth: 350,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text,
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  columna: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  btnFlecha: {
    padding: 8,
  },
  flecha: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  valor: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.text,
    paddingVertical: 8,
    minWidth: 50,
    textAlign: 'center',
  },
  separador: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.text,
    paddingHorizontal: 4,
  },
  botones: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  btnCancelar: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: Colors.border,
    borderRadius: 20,
  },
  btnCancelarText: {
    color: Colors.textSoft,
  },
  btnConfirmar: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  btnConfirmarText: {
    color: Colors.surface,
    fontWeight: 'bold',
  },
});