import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTratamientos } from '@/hooks/useTratamientos';
import TratamientoCard from '@/components/tratamientos/TratamientoCard';
import ModalNuevoTratamiento from '@/components/tratamientos/ModalNuevoTratamiento';

export default function TratamientosIndex() {
  const { tratamientos, loading, cargarTratamientos, crearTratamientoCompleto } = useTratamientos();
  const [modalVisible, setModalVisible] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'perros' | 'gatos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarTratamientos();
  }, []);

  const tratamientosFiltrados = tratamientos.filter((t) => {
    const animal = t.animal;
    if (!animal) return false;
    const tipoAnimal = animal.tipo?.toLowerCase();
    if (filtroTipo === 'perros' && tipoAnimal !== 'perro') return false;
    if (filtroTipo === 'gatos' && tipoAnimal !== 'gato') return false;
    if (busqueda && !animal.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Tratamientos</Text>
        <TouchableOpacity style={styles.btnAgregar} onPress={() => setModalVisible(true)}>
          <Text style={styles.btnAgregarText}>+</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Buscar animal en tratamiento..."
        value={busqueda}
        onChangeText={setBusqueda}
        style={styles.searchInput}
      />

      <View style={styles.filtros}>
        {['todos', 'perros', 'gatos'].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFiltroTipo(f as any)}
            style={[styles.filtroBtn, filtroTipo === f && styles.filtroBtnActivo]}
          >
            <Text style={[styles.filtroTexto, filtroTipo === f && styles.filtroTextoActivo]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
          {tratamientosFiltrados.length === 0 ? (
            <Text style={styles.sinDatos}>No hay tratamientos registrados</Text>
          ) : (
            tratamientosFiltrados.map((t) => <TratamientoCard key={t.id} tratamiento={t} />)
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      <ModalNuevoTratamiento
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={crearTratamientoCompleto}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { backgroundColor: '#f97316', paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  btnAgregar: { backgroundColor: 'white', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  btnAgregarText: { color: '#f97316', fontSize: 24, fontWeight: 'bold' },
  searchInput: { backgroundColor: 'white', borderRadius: 12, margin: 16, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  filtros: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, gap: 8 },
  filtroBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#e5e7eb' },
  filtroBtnActivo: { backgroundColor: '#f97316' },
  filtroTexto: { color: '#374151' },
  filtroTextoActivo: { color: 'white', fontWeight: 'bold' },
  sinDatos: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 16 },
});