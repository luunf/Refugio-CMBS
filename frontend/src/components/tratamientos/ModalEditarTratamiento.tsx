import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  tratamiento: any;
  onSave: (id: number, data: any) => Promise<void>;
}

export default function ModalEditarTratamiento({ visible, onClose, tratamiento, onSave }: Props) {
  const [tipo, setTipo] = useState(tratamiento?.tipo || '');
  const [fechaInicio, setFechaInicio] = useState(tratamiento?.fecha_inicio?.split('T')[0] || '');
  const [fechaFin, setFechaFin] = useState(tratamiento?.fecha_fin?.split('T')[0] || '');
  const [descripcion, setDescripcion] = useState(tratamiento?.descripcion || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!tipo || !fechaInicio) return;
    setLoading(true);
    try {
      await onSave(tratamiento.id, { tipo, fecha_inicio: fechaInicio, fecha_fin: fechaFin || null, descripcion });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Editar tratamiento</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Tipo *</Text>
          <TextInput value={tipo} onChangeText={setTipo} style={styles.input} />

          <Text style={styles.label}>Fecha inicio *</Text>
          <TextInput value={fechaInicio} onChangeText={setFechaInicio} placeholder="YYYY-MM-DD" style={styles.input} />

          <Text style={styles.label}>Fecha fin</Text>
          <TextInput value={fechaFin} onChangeText={setFechaFin} placeholder="YYYY-MM-DD" style={styles.input} />

          <Text style={styles.label}>Descripción</Text>
          <TextInput value={descripcion} onChangeText={setDescripcion} multiline style={styles.input} />

          <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.btnGuardar}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnTexto}>Guardar cambios</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  container: { backgroundColor: '#fff7ed', borderRadius: 24, padding: 24, width: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  cerrar: { fontSize: 22, color: '#6b7280' },
  label: { fontWeight: '600', marginBottom: 4, color: '#111827' },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16 },
  btnGuardar: { backgroundColor: '#f97316', paddingVertical: 14, borderRadius: 20, alignItems: 'center', marginTop: 8 },
  btnTexto: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});