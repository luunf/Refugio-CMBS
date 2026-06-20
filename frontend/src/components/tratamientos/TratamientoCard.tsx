//tratamientocard
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';

interface Props {
  tratamiento: any;
  onDelete: (id: number) => Promise<void>;
  onAgendar?: (tratamiento: any) => void;
  onEdit: () => void;
}

const esVencido = (fechaFin: string | null): boolean => {
  if (!fechaFin) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fechaFin + 'T00:00:00');
  return fin < hoy;
};

export default function TratamientoCard({ tratamiento, onDelete, onAgendar, onEdit }: Props) {
  const { t } = useTranslation('tratamientos');
  const [expandida, setExpandida] = useState(false);

  const vencido = esVencido(tratamiento.fecha_fin);

  const animal = tratamiento.animal_nombre ?? t('card.animalSinNombre');
  const fechaInicio = tratamiento.fecha_inicio ?? t('card.animalSinNombre');
  const fechaFin = tratamiento.fecha_fin ?? t('card.animalSinNombre');

  return (
    <TouchableOpacity
      onPress={() => setExpandida(!expandida)}
      style={[styles.container, vencido && styles.containerVencido]}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <Text style={[styles.animalNombre, vencido && styles.textoVencido]}>{animal}</Text>
        <TouchableOpacity onPress={(e) => { e.stopPropagation(); onEdit(); }} style={styles.btnLapiz}>
          <Text style={[styles.lapizIcono, vencido && styles.iconoVencido]}>✎</Text>
        </TouchableOpacity>
        <Text style={[styles.chevron, vencido && styles.iconoVencido]}>{expandida ? '▲' : '▼'}</Text>
      </View>

      {vencido && (
        <Text style={styles.etiquetaVencido}>{t('card.vencido')}</Text>
      )}

      <View style={styles.fila}>
        <Text style={[styles.label, vencido && styles.textoVencido]}>{t('card.tipoLabel')}</Text>
        <View style={[styles.badge, vencido && styles.badgeVencido]}>
          <Text style={[styles.badgeText, vencido && styles.badgeTextVencido]}>{tratamiento.tipo}</Text>
        </View>
      </View>
      <View style={styles.fila}>
        <Text style={[styles.label, vencido && styles.textoVencido]}>{t('card.fechaInicioLabel')}</Text>
        <View style={[styles.badge, vencido && styles.badgeVencido]}>
          <Text style={[styles.badgeText, vencido && styles.badgeTextVencido]}>{fechaInicio}</Text>
        </View>
      </View>
      <View style={styles.fila}>
        <Text style={[styles.label, vencido && styles.textoVencido]}>{t('card.fechaFinLabel')}</Text>
        <View style={[styles.badge, vencido && styles.badgeVencido]}>
          <Text style={[styles.badgeText, vencido && styles.badgeTextVencido]}>{fechaFin}</Text>
        </View>
      </View>
      {tratamiento.descripcion ? (
        <View style={styles.fila}>
          <Text style={[styles.label, vencido && styles.textoVencido]}>{t('card.descripcionLabel')}</Text>
          <View style={[styles.badge, styles.badgeWide, vencido && styles.badgeVencido]}>
            <Text style={[styles.badgeText, vencido && styles.badgeTextVencido]} numberOfLines={1}>
              {tratamiento.descripcion}
            </Text>
          </View>
        </View>
      ) : null}

      {expandida && (
        <View style={styles.acciones}>
          {onAgendar && (
            <TouchableOpacity onPress={() => onAgendar(tratamiento)} style={styles.btnAgendar}>
              <Text style={styles.btnAgendarText}>{t('card.btnAgendar')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => onDelete(tratamiento.id)} style={styles.btnEliminar}>
            <Text style={styles.btnEliminarText}>{t('card.btnEliminar')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryFaint,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  containerVencido: {
    backgroundColor: Colors.borderLight,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  animalNombre: { fontSize: 22, fontWeight: 'bold', color: Colors.text, flex: 1 },
  textoVencido: { color: Colors.textFaint },
  btnLapiz: { marginLeft: 8, padding: 4 },
  lapizIcono: { color: Colors.primary, fontSize: 16 },
  iconoVencido: { color: Colors.textFaint },
  chevron: { color: Colors.primary, fontSize: 18, marginLeft: 4 },
  etiquetaVencido: {
    color: Colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  label: { fontWeight: '700', color: Colors.text, fontSize: 14 },
  badge: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 1,
    maxWidth: '70%',
  },
  badgeVencido: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  badgeWide: { borderRadius: 10, flex: 1, maxWidth: undefined },
  badgeText: { color: Colors.primary, fontSize: 13 },
  badgeTextVencido: { color: Colors.textMuted },
  acciones: { marginTop: 12, gap: 8 },
  btnAgendar: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  btnAgendarText: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  btnEliminar: {
    backgroundColor: Colors.delete,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnEliminarText: { color: Colors.surface, fontWeight: '600', fontSize: 13 },
});