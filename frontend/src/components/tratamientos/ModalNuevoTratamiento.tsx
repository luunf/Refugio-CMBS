// src/components/tratamientos/ModalNuevoTratamiento.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DatePickerModal from '@/components/calendario/DatePickerModal';
import { api } from '@/config/api';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (animalId: number, visitaData: any, tratamientoData: any) => Promise<void>;
}

export default function ModalNuevoTratamiento({ visible, onClose, onCreate }: Props) {
  const [animales, setAnimales] = useState<any[]>([]);
  const [animalId, setAnimalId] = useState<number | null>(null);
  const [loadingAnimales, setLoadingAnimales] = useState(false);
  const [loading, setLoading] = useState(false);

  // Campos del tratamiento (según mockup)
  const [tipo, setTipo] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [descripcion, setDescripcion] = useState('');

  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false);
  const [showDatePickerFin, setShowDatePickerFin] = useState(false);

  useEffect(() => {
    if (visible) {
      const cargar = async () => {
        setLoadingAnimales(true);
        try {
          const data = await api.getAnimales();
          setAnimales(Array.isArray(data) ? data : []);
          if (data.length > 0) setAnimalId(data[0].id);
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingAnimales(false);
        }
      };
      cargar();
    }
  }, [visible]);

  const handleCrear = async () => {
    if (!animalId || !tipo || !fechaInicio) return;
    setLoading(true);
    try {
      // Construir visitaData automática (usando veterinario por defecto, ej. ID 1)
      const visitaData = {
        fecha: fechaInicio.toISOString().split('T')[0],
        procedimiento: `Tratamiento: ${tipo}`,
        veterinario_id: 1,  // Asegúrate de tener un veterinario con ID=1, o cámbialo
        informacion_adicional: descripcion,
        costo: null,
        estado: 'realizada',
      };
      const tratamientoData = {
        tipo,
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaFin ? fechaFin.toISOString().split('T')[0] : null,
        descripcion,
      };
      await onCreate(animalId, visitaData, tratamientoData);
      // Limpiar
      setTipo('');
      setFechaInicio(new Date());
      setFechaFin(null);
      setDescripcion('');
      onClose();
    } catch (e) {
      console.error(e);
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
              <Text style={styles.titulo}>Registro de tratamiento</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cerrar}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Animal *</Text>
              {loadingAnimales ? (
                <ActivityIndicator />
              ) : (
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={animalId} onValueChange={setAnimalId}>
                    {animales.map((a) => (
                      <Picker.Item key={a.id} label={a.nombre} value={a.id} />
                    ))}
                  </Picker>
                </View>
              )}

              <Text style={styles.label}>Tipo de tratamiento *</Text>
              <TextInput
                value={tipo}
                onChangeText={setTipo}
                placeholder="Ej: Medicación, Cirugía"
                style={styles.input}
              />

              <Text style={styles.label}>Fecha de inicio *</Text>
              <TouchableOpacity onPress={() => setShowDatePickerInicio(true)} style={styles.input}>
                <Text>{fechaInicio.toISOString().split('T')[0]}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Fecha de fin</Text>
              <TouchableOpacity onPress={() => setShowDatePickerFin(true)} style={styles.input}>
                <Text>{fechaFin ? fechaFin.toISOString().split('T')[0] : 'Opcional'}</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Detalles del tratamiento"
                multiline
                style={[styles.input, { minHeight: 80 }]}
              />

              <TouchableOpacity onPress={handleCrear} disabled={loading} style={styles.btnCrear}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnCrearTexto}>Cargar tratamiento</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DatePickerModal
        visible={showDatePickerInicio}
        onClose={() => setShowDatePickerInicio(false)}
        onSelectDate={setFechaInicio}
        initialDate={fechaInicio}
      />
      <DatePickerModal
        visible={showDatePickerFin}
        onClose={() => setShowDatePickerFin(false)}
        onSelectDate={setFechaFin}
        initialDate={fechaFin || new Date()}
      />
    </>
  );
}

// Estilos (iguales a ModalNuevaTarea)
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  container: { backgroundColor: '#fff7ed', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  cerrar: { fontSize: 22, color: '#6b7280' },
  label: { fontWeight: '600', marginBottom: 4, color: '#111827' },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16 },
  pickerContainer: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, marginBottom: 16 },
  btnCrear: { backgroundColor: '#f97316', paddingVertical: 14, borderRadius: 20, alignItems: 'center', marginTop: 16, marginBottom: 8 },
  btnCrearTexto: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});