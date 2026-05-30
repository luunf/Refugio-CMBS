// src/components/tratamientos/TratamientoCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface Props {
  tratamiento: any;
}

export default function TratamientoCard({ tratamiento }: Props) {
  const router = useRouter();

  const tipo = tratamiento.tipo || 'Sin tipo';
  const fechaInicio = tratamiento.fecha_inicio?.split('T')[0] || '—';
  const fechaFin = tratamiento.fecha_fin?.split('T')[0] || '—';
  const descripcion = tratamiento.descripcion || 'Sin descripción';
  const animalNombre = tratamiento.animal?.nombre || 'Animal desconocido';

  const handleAgendar = () => {
    // Redirigir al calendario con una tarea pre-cargada? O crear tarea automática.
    router.push(`/calendario?nuevaTarea=Tratamiento: ${tipo} para ${animalNombre}&fecha=${fechaInicio}`);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.nombre}>{animalNombre}</Text>
      <Text style={styles.tipo}>Tipo de tratamiento: {tipo}</Text>
      <Text style={styles.fechas}>Fecha de inicio: {fechaInicio}</Text>
      {fechaFin !== '—' && <Text style={styles.fechas}>Fecha de fin: {fechaFin}</Text>}
      <Text style={styles.descripcion}>Descripción: {descripcion}</Text>
      <TouchableOpacity onPress={handleAgendar} style={styles.btnAgendar}>
        <Text style={styles.btnAgendarText}>+ Agendar en calendario</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  tipo: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  fechas: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  descripcion: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 8,
  },
  btnAgendar: {
    backgroundColor: '#f97316',
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  btnAgendarText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});