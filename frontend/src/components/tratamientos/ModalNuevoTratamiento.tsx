//ModalNuevoTratamiento
import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import DatePickerModal from '../calendario/DatePickerModal';
import { Colors } from '@/constants/theme';
import { api } from '@/config/api';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCrear: (data: any) => Promise<void>;
}

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const TIPOS_ANIMAL = ['perro', 'gato'];

export default function ModalNuevoTratamiento({ visible, onClose, onCrear }: Props) {
  const { t } = useTranslation('tratamientos');

  const hoy = new Date();
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState(hoy);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFin, setShowPickerFin] = useState(false);
  const [loading, setLoading] = useState(false);

  const [especieSeleccionada, setEspecieSeleccionada] = useState<string | null>(null);
  const [animales, setAnimales] = useState<any[]>([]);
  const [animalId, setAnimalId] = useState<number | null>(null);
  const [animalNombre, setAnimalNombre] = useState('');
  const [showAnimales, setShowAnimales] = useState(false);
  const [loadingAnimales, setLoadingAnimales] = useState(false);

  useEffect(() => {
    if (especieSeleccionada) {
      setLoadingAnimales(true);
      setAnimalId(null);
      setAnimalNombre('');
      api.getAnimales(especieSeleccionada)
        .then(setAnimales)
        .catch(console.error)
        .finally(() => setLoadingAnimales(false));
    }
  }, [especieSeleccionada]);

  const resetForm = () => {
    setTipo('');
    setDescripcion('');
    setFechaInicio(hoy);
    setFechaFin(null);
    setAnimalId(null);
    setAnimalNombre('');
    setEspecieSeleccionada(null);
    setAnimales([]);
  };

  const handleCrear = async () => {
    if (!tipo || !animalId) return;
    setLoading(true);
    try {
      await onCrear({
        animal_id: animalId,
        tipo,
        descripcion: descripcion || null,
        fecha_inicio: formatDate(fechaInicio),
        fecha_fin: fechaFin ? formatDate(fechaFin) : null,
      });
      resetForm();
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
              <Text style={styles.titulo}>{t('modalNuevo.titulo')}</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cerrar}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Selector especie */}
              <Text style={styles.label}>{t('modalNuevo.especieLabel')}</Text>
              <View style={styles.especieRow}>
                {TIPOS_ANIMAL.map(especie => (
                  <TouchableOpacity
                    key={especie}
                    onPress={() => {
                      setEspecieSeleccionada(especie);
                      setShowAnimales(false);
                    }}
                    style={[
                      styles.especieBtn,
                      especieSeleccionada === especie && styles.especieBtnActivo,
                    ]}
                  >
                    <Text style={styles.especieIcono}>
                      {especie === 'perro' ? '🐶' : '🐱'}
                    </Text>
                    <Text style={[
                      styles.especieTexto,
                      especieSeleccionada === especie && styles.especieTextoActivo,
                    ]}>
                      {especie === 'perro' ? t('modalNuevo.perro') : t('modalNuevo.gato')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Selector animal */}
              {especieSeleccionada && (
                <>
                  <Text style={styles.label}>{t('modalNuevo.animalLabel')}</Text>
                  <TouchableOpacity
                    onPress={() => setShowAnimales(!showAnimales)}
                    style={styles.inputBtn}
                  >
                    <Text style={[styles.inputBtnText, !animalNombre && { color: Colors.textFaint }]}>
                      {loadingAnimales
                        ? t('modalNuevo.cargandoAnimales')
                        : animalNombre || t('modalNuevo.seleccionarAnimal')}
                    </Text>
                    <Text style={styles.chevron}>{showAnimales ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  {showAnimales && (
                    <View style={styles.dropdown}>
                      <ScrollView nestedScrollEnabled style={{ maxHeight: 160 }}>
                        {animales.length === 0 ? (
                          <Text style={styles.dropdownVacio}>
                            {t('modalNuevo.sinAnimales', { especie: especieSeleccionada })}
                          </Text>
                        ) : (
                          animales.map(a => (
                            <TouchableOpacity
                              key={a.id_animal}
                              onPress={() => {
                                setAnimalId(a.id_animal);
                                setAnimalNombre(a.nombre);
                                setShowAnimales(false);
                              }}
                              style={[
                                styles.dropdownItem,
                                animalId === a.id_animal && styles.dropdownItemActivo,
                              ]}
                            >
                              <Text style={styles.dropdownText}>{a.nombre}</Text>
                              {animalId === a.id_animal && (
                                <Text style={styles.dropdownCheck}>✓</Text>
                              )}
                            </TouchableOpacity>
                          ))
                        )}
                      </ScrollView>
                    </View>
                  )}
                </>
              )}

              {/* Tipo de tratamiento */}
              <Text style={styles.label}>{t('modalNuevo.tipoLabel')}</Text>
              <TextInput
                value={tipo}
                onChangeText={setTipo}
                placeholder={t('modalNuevo.tipoPlaceholder')}
                style={styles.input}
              />

              {/* Fecha inicio */}
              <Text style={styles.label}>{t('modalNuevo.fechaInicioLabel')}</Text>
              <TouchableOpacity onPress={() => setShowPickerInicio(true)} style={styles.inputBtn}>
                <Text style={styles.inputBtnText}>{formatDate(fechaInicio)}</Text>
                <Text style={styles.calIcon}>📅</Text>
              </TouchableOpacity>

              {/* Fecha fin */}
              <Text style={styles.label}>{t('modalNuevo.fechaFinLabel')}</Text>
              <TouchableOpacity onPress={() => setShowPickerFin(true)} style={styles.inputBtn}>
                <Text style={[styles.inputBtnText, !fechaFin && { color: Colors.textFaint }]}>
                  {fechaFin ? formatDate(fechaFin) : t('modalNuevo.seleccionarFecha')}
                </Text>
                <Text style={styles.calIcon}>📅</Text>
              </TouchableOpacity>

              {/* Descripcion */}
              <Text style={styles.label}>{t('modalNuevo.descripcionLabel')}</Text>
              <TextInput
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder={t('modalNuevo.descripcionPlaceholder')}
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                onPress={handleCrear}
                disabled={loading || !tipo || !animalId}
                style={[styles.btnCrear, (!tipo || !animalId) && { opacity: 0.5 }]}
              >
                {loading
                  ? <ActivityIndicator color={Colors.surface} />
                  : <Text style={styles.btnCrearTexto}>{t('modalNuevo.btnCargar')}</Text>
                }
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </Modal>

      <DatePickerModal
        visible={showPickerInicio}
        onClose={() => setShowPickerInicio(false)}
        onSelectDate={(date) => setFechaInicio(date)}
        initialDate={fechaInicio}
      />
      <DatePickerModal
        visible={showPickerFin}
        onClose={() => setShowPickerFin(false)}
        onSelectDate={(date) => setFechaFin(date)}
        initialDate={fechaFin ?? hoy}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  container: {
    backgroundColor: Colors.primaryFaint,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titulo: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  cerrar: { fontSize: 22, color: Colors.textMuted },
  label: { fontWeight: '600', marginBottom: 4, color: Colors.text, marginTop: 12 },
  especieRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  especieBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  especieBtnActivo: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  especieIcono: { fontSize: 18 },
  especieTexto: { fontSize: 14, fontWeight: '600', color: Colors.textSoft },
  especieTextoActivo: { color: Colors.surface },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    fontSize: 14,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  inputBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputBtnText: {
    color: Colors.text,
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  chevron: { color: Colors.primary, fontSize: 14 },
  calIcon: { fontSize: 18 },
  dropdown: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemActivo: {
    backgroundColor: Colors.primaryFaint,
  },
  dropdownText: { fontSize: 14, color: Colors.text },
  dropdownCheck: { color: Colors.primary, fontWeight: 'bold' },
  dropdownVacio: {
    textAlign: 'center',
    color: Colors.textFaint,
    padding: 16,
    fontSize: 14,
  },
  btnCrear: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  btnCrearTexto: { color: Colors.surface, fontWeight: 'bold', fontSize: 16 },
});