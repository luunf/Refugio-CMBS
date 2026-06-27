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
import ModalEditarTratamiento from '../../components/tratamientos/ModalEditarTratamiento';
import { Colors } from '@/constants/theme';
import { notificarTratamientoCreado } from '@/hooks/useNotifications';

export default function TratamientosScreen() {
  const { t } = useTranslation('tratamientos');

  const {
    tratamientos,
    loading,
    cargarTratamientos,
    actualizarTratamiento,
    eliminarTratamiento,
    agendarEnCalendario,
  } = useTratamientos();

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('Todos');
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
      Alert.alert(t('alertas.sinFechaFinTitulo'), t('alertas.sinFechaFinMensaje'));
      return;
    }
    setAgendando(tratamiento.id);
    try {
      await agendarEnCalendario(tratamiento);
      Alert.alert(t('alertas.tareaCreadaTitulo'), t('alertas.tareaCreadaMensaje'));
    } catch (e) {
      console.error(e);
      Alert.alert(t('alertas.errorTitulo'), t('alertas.errorAgendarMensaje'));
    } finally {
      setAgendando(null);
    }
  };

  const handleEditarGuardar = async (id: number, data: any) => {
    try {
      await actualizarTratamiento(id, data);
      Alert.alert(
        "Éxito",
        "Tratamiento actualizado correctamente"
      );
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.error ?? "No se pudo actualizar el tratamiento"
      );
    }
  };


  const handleDelete = async (id: number) => {
    try {
      await eliminarTratamiento(id);
    } catch (e: any) {
      Alert.alert(t('alertas.errorTitulo'), e?.response?.data?.error ?? t('alertas.errorEliminarMensaje'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{t('headerTitulo')}</Text>
      </View>

      {/* Buscador */}
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
                onDelete={handleDelete}
                onAgendar={handleAgendar}
                agendando={agendando === tr.id}
                onEdit={() => setTratamientoEditando(tr)}
              />
            ))
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

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
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerText: {
    color: Colors.surface,
    fontSize: 24,
    fontWeight: 'bold',
  },
  buscadorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    gap: 10,
  },
  buscadorContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buscadorInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  filtrosGrilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    gap: 8,
  },
  filtroBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  filtroBadgeActivo: {
    backgroundColor: Colors.primary,
  },
  filtroTexto: {
    color: Colors.textSoft,
    fontSize: 13,
    fontWeight: '500',
  },
  filtroTextoActivo: {
    color: Colors.surface,
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
    color: Colors.textFaint,
    marginTop: 40,
    fontSize: 16,
  },
});