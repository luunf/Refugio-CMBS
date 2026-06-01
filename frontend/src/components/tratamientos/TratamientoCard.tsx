import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  tratamiento: any;
  onDelete: (id: number) => Promise<void>;
  onAgendar?: (tratamiento: any) => void;
}

export default function TratamientoCard({ tratamiento, onDelete, onAgendar }: Props) {
  const [expandida, setExpandida] = useState(false);

  const animal = tratamiento.animal_nombre ?? '—';
  const fechaInicio = tratamiento.fecha_inicio ?? '—';
  const fechaFin = tratamiento.fecha_fin ?? '—';

  return (
    <TouchableOpacity
      onPress={() => setExpandida(!expandida)}
      style={styles.container}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <Text style={styles.animalNombre}>{animal}</Text>
        <Text style={styles.chevron}>{expandida ? '▲' : '▼'}</Text>
      </View>

      <View style={styles.fila}>
        <Text style={styles.label}>Tipo de tratamiento:</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{tratamiento.tipo}</Text></View>
      </View>
      <View style={styles.fila}>
        <Text style={styles.label}>Fecha de inicio:</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{fechaInicio}</Text></View>
      </View>
      <View style={styles.fila}>
        <Text style={styles.label}>Fecha de fin:</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{fechaFin}</Text></View>
      </View>
      {tratamiento.descripcion ? (
        <View style={styles.fila}>
          <Text style={styles.label}>Descripción:</Text>
          <View style={[styles.badge, styles.badgeWide]}>
            <Text style={styles.badgeText}>{tratamiento.descripcion}</Text>
          </View>
        </View>
      ) : null}

      {expandida && (
        <View style={styles.acciones}>
          {onAgendar && (
            <TouchableOpacity onPress={() => onAgendar(tratamiento)} style={styles.btnAgendar}>
              <Text style={styles.btnAgendarText}>+ Agendar en calendario</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => onDelete(tratamiento.id)} style={styles.btnEliminar}>
            <Text style={styles.btnEliminarText}>Eliminar tratamiento</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff7ed',
    borderWidth: 2,
    borderColor: '#f97316',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  animalNombre: { fontSize: 22, fontWeight: 'bold', color: '#1c1c1c' },
  chevron: { color: '#f97316', fontSize: 18 },
  fila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  label: { fontWeight: '700', color: '#1c1c1c', fontSize: 14, marginTop: 3 },
  badge: {
    backgroundColor: '#f97316',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 3,
    flexShrink: 1,
  },
  badgeWide: { borderRadius: 10, flex: 1 },
  badgeText: { color: 'white', fontSize: 13 },
  acciones: { marginTop: 12, gap: 8 },
  btnAgendar: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#f97316',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  btnAgendarText: { color: '#f97316', fontWeight: '600', fontSize: 13 },
  btnEliminar: {
    backgroundColor: '#ef4444',
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnEliminarText: { color: 'white', fontWeight: '600', fontSize: 13 },
});