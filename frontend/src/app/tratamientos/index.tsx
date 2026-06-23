//index.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Feather from "@expo/vector-icons/build/Feather";
import { useTratamientos } from '../../hooks/useTratamientos';
import TratamientoCard from '../../components/tratamientos/TratamientoCard';
import ModalNuevoTratamiento from '../../components/tratamientos/ModalNuevoTratamiento';
import ModalEditarTratamiento from '../../components/tratamientos/ModalEditarTratamiento';
import { Colors } from '@/constants/theme';

export default function TratamientosScreen() {
  const { t } = useTranslation('tratamientos');

  const {
    tratamientos,
    loading,
    cargarTratamientos,
    crearTratamientoCompleto,
    actualizarTratamiento,
    eliminarTratamiento,
    agendarEnCalendario,
  } = useTratamientos();

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('Todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [tratamientoEditando, setTratamientoEditando] = useState<any | null>(null);
  const [agendando, setAgendando] = useState<number | null>(null);

  const FILTROS_ESPECIE = [
    { label: t('filtros.todos'), valor: 'Todos' },
    { label: t('filtros.perros'), valor: 'perro' },
    { label: t('filtros.gatos'), valor: 'gato' },
  ];

  useEffect(() => { cargarTratamientos(); }, []);

  const filtrados = tratamientos.filter(tr => {
    const animal = (tr.animal_nombre ?? '').toLowerCase();
    const especie = (tr.especie ?? '').toLowerCase();
    const matchBusqueda = animal.includes(busqueda.toLowerCase());
    const matchFiltro = filtro === 'Todos' || especie === filtro;
    return matchBusqueda && matchFiltro;
  });

  const handleAgendar = async (tratamiento: any) => {
    if (!tratamiento.fecha_fin) {
      console.warn('El tratamiento no tiene fecha de fin definida');
      return;
    }
    setAgendando(tratamiento.id);
    try {
      await agendarEnCalendario(tratamiento);
    } catch (e) {
      console.error(e);
    } finally {
      setAgendando(null);
    }
  };

  // ← Esta es la función que arregla el conflicto con ModalEditarTratamiento
  const handleEditarGuardar = async (id: number, data: any) => {
    try {
      await actualizarTratamiento(id, data);
      Alert.alert(
        t('card.exito') || 'Éxito',
        t('card.tratamientoActualizado') || 'Tratamiento actualizado correctamente'
      );
    } catch (e: any) {
      Alert.alert(
        t('error') || 'Error',
        e?.response?.data?.error || t('card.errorActualizar') || 'No se pudo actualizar el tratamiento'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{t('headerTitulo')}</Text>
      </View>

      <View style={styles.buscadorRow}>
        <View style={styles.buscadorContainer}>
          <Feather name="search" size={18} color={Colors.textFaint} style={{ marginRight: 6 }} />
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder={t('buscadorPlaceholder')}
            style={styles.buscadorInput}
            placeholderTextColor={Colors.textFaint}
          />
        </View>
      </View>

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

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.lista}>
          {filtrados.length === 0 ? (
            <Text style={styles.sinResultados}>{t('sinResultados')}</Text>
          ) : (
            filtrados.map(tr => (
              <TratamientoCard
                key={tr.id}
                tratamiento={tr}
                onDelete={eliminarTratamiento}
                onAgendar={handleAgendar}
                agendando={agendando === tr.id}
                onEdit={() => setTratamientoEditando(tr)}
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
            { fecha: data.fecha_inicio, procedimiento: data.tipo, estado: 'realizada', veterinario_id: 1 },
            { tipo: data.tipo, descripcion: data.descripcion, fecha_inicio: data.fecha_inicio, fecha_fin: data.fecha_fin }
          );
          setModalVisible(false);
        }}
      />

      <ModalEditarTratamiento
        visible={!!tratamientoEditando}
        onClose={() => setTratamientoEditando(null)}
        tratamiento={tratamientoEditando}
        onSave={handleEditarGuardar}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background },

  header: { 
    backgroundColor: Colors.primary, 
    paddingHorizontal: 16, 
    paddingVertical: 16 },

  headerText: { 
    color: Colors.surface, 
    fontSize: 24, 
    fontWeight: 'bold' },

  buscadorRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    backgroundColor: Colors.surface, 
    gap: 10 },

  buscadorContainer: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.background, 
    borderRadius: 20, 
    paddingHorizontal: 12, 
    paddingVertical: 8 },

  buscadorInput: { 
    flex: 1, 
    fontSize: 14, 
    color: Colors.text },

  filtrosGrilla: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    backgroundColor: Colors.surface, 
    gap: 8 },

  filtroBadge: { 
    paddingHorizontal: 14, 
    paddingVertical: 6, 
    borderRadius: 20, 
    backgroundColor: Colors.background },

  filtroBadgeActivo: { 
    backgroundColor: Colors.primary },
    
  filtroTexto: { 
    color: Colors.textSoft, 
    fontSize: 13, 
    fontWeight: '500' },

  filtroTextoActivo: { 
    color: Colors.surface, 
    fontSize: 13, 
    fontWeight: '600' },

  lista: { 
    flex: 1, 
    paddingHorizontal: 16, 
    paddingTop: 12 },

  sinResultados: { 
    textAlign: 'center', 
    color: Colors.textFaint, 
    marginTop: 40, fontSize: 16 },
});