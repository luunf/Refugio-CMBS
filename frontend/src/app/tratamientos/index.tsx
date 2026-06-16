import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTratamientos } from '../../hooks/useTratamientos';
import TratamientoCard from '../../components/tratamientos/TratamientoCard';
import ModalNuevoTratamiento from '../../components/tratamientos/ModalNuevoTratamiento';

const FILTROS_ESPECIE = [
  { label: 'Todos', valor: 'Todos' },
  { label: 'Perros', valor: 'perro' },
  { label: 'Gatos', valor: 'gato' },
];

export default function TratamientosScreen() {
  const {
    tratamientos,
    loading,
    cargarTratamientos,
    crearTratamientoCompleto,
    eliminarTratamiento,
  } = useTratamientos();

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('Todos');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => { cargarTratamientos(); }, []);

  const filtrados = tratamientos.filter(t => {
    const animal = (t.animal_nombre ?? '').toLowerCase();
    const especie = (t.especie ?? '').toLowerCase();
    const matchBusqueda = animal.includes(busqueda.toLowerCase());
    const matchFiltro = filtro === 'Todos' || especie === filtro;
    return matchBusqueda && matchFiltro;
  });

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Tratamientos</Text>
      </View>

      {/* Buscador  */}
      <View style={styles.buscadorRow}>
        <View style={styles.buscadorContainer}>
          <Text style={styles.buscadorIcono}>🔍</Text>
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar animal en tratamiento..."
            style={styles.buscadorInput}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosGrilla}>
        {FILTROS_ESPECIE.map(f => (
          <TouchableOpacity
            key={f.valor}
            onPress={() => setFiltro(f.valor)}
            style={[styles.filtroBadge, filtro === f.valor && styles.filtroBadgeActivo]}
          >
            <Text style={filtro === f.valor ? styles.filtroTextoActivo : styles.filtroTexto}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      {loading ? (
        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.lista}>
          {filtrados.length === 0 ? (
            <Text style={styles.sinResultados}>No hay tratamientos registrados</Text>
          ) : (
            filtrados.map(t => (
              <TratamientoCard
                key={t.id}
                tratamiento={t}
                onDelete={eliminarTratamiento}
                onAgendar={(t) => console.log('Agendar:', t)}
              />
            ))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      <ModalNuevoTratamiento
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCrear={async (data) => {
          await crearTratamientoCompleto(
            data.animal_id,
            {
              fecha: data.fecha_inicio,
              procedimiento: data.tipo,
              estado: 'realizada',
              veterinario_id: 1,
            },
            {
              tipo: data.tipo,
              descripcion: data.descripcion,
              fecha_inicio: data.fecha_inicio,
              fecha_fin: data.fecha_fin,
            }
          );
          setModalVisible(false);
        }}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  buscadorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    gap: 10,
  },
  buscadorContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buscadorIcono: {
    fontSize: 16,
    marginRight: 6,
  },
  buscadorInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  btnAgregar: {
    backgroundColor: '#f97316',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAgregarTexto: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  filtrosGrilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
    gap: 8,
  },
  filtroBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filtroBadgeActivo: {
    backgroundColor: '#f97316',
  },
  filtroTexto: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '500',
  },
  filtroTextoActivo: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  lista: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sinResultados: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 40,
    fontSize: 16,
  },
});