import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet,
} from 'react-native';
import DatePickerModal from '../calendario/DatePickerModal';
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
              <Text style={styles.titulo}>Tratamiento</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cerrar}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Selector especie */}
              <Text style={styles.label}>Especie*</Text>
              <View style={styles.especieRow}>
                {TIPOS_ANIMAL.map(t => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => {
                      setEspecieSeleccionada(t);
                      setShowAnimales(false);
                    }}
                    style={[
                      styles.especieBtn,
                      especieSeleccionada === t && styles.especieBtnActivo,
                    ]}
                  >
                    <Text style={styles.especieIcono}>
                      {t === 'perro' ? '🐶' : '🐱'}
                    </Text>
                    <Text style={[
                      styles.especieTexto,
                      especieSeleccionada === t && styles.especieTextoActivo,
                    ]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Selector animal */}
              {especieSeleccionada && (
                <>
                  <Text style={styles.label}>Animal*</Text>
                  <TouchableOpacity
                    onPress={() => setShowAnimales(!showAnimales)}
                    style={styles.inputBtn}
                  >
                    <Text style={[styles.inputBtnText, !animalNombre && { color: '#9ca3af' }]}>
                      {loadingAnimales
                        ? 'Cargando...'
                        : animalNombre || 'Seleccionar animal...'}
                    </Text>
                    <Text style={styles.chevron}>{showAnimales ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  {showAnimales && (
                    <View style={styles.dropdown}>
                      <ScrollView nestedScrollEnabled style={{ maxHeight: 160 }}>
                        {animales.length === 0 ? (
                          <Text style={styles.dropdownVacio}>
                            Sin {especieSeleccionada}s registrados
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
              <Text style={styles.label}>Tipo de tratamiento*</Text>
              <TextInput
                value={tipo}
                onChangeText={setTipo}
                placeholder="Ej: Medicación"
                style={styles.input}
              />

              {/* Fecha inicio */}
              <Text style={styles.label}>Fecha de inicio*</Text>
              <TouchableOpacity onPress={() => setShowPickerInicio(true)} style={styles.inputBtn}>
                <Text style={styles.inputBtnText}>{formatDate(fechaInicio)}</Text>
                <Text style={styles.calIcon}>📅</Text>
              </TouchableOpacity>

              {/* Fecha fin */}
              <Text style={styles.label}>Fecha de fin</Text>
              <TouchableOpacity onPress={() => setShowPickerFin(true)} style={styles.inputBtn}>
                <Text style={[styles.inputBtnText, !fechaFin && { color: '#9ca3af' }]}>
                  {fechaFin ? formatDate(fechaFin) : 'Seleccionar fecha...'}
                </Text>
                <Text style={styles.calIcon}>📅</Text>
              </TouchableOpacity>

              {/* Descripcion */}
              <Text style={styles.label}>Descripcion</Text>
              <TextInput
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Ej: Administrar antiinflamatorio..."
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
                  ? <ActivityIndicator color="white" />
                  : <Text style={styles.btnCrearTexto}>cargar</Text>
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
    backgroundColor: '#fff7ed',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: '#f97316',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  cerrar: { fontSize: 22, color: '#6b7280' },
  label: { fontWeight: '600', marginBottom: 4, color: '#111827', marginTop: 12 },
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
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  especieBtnActivo: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  especieIcono: { fontSize: 18 },
  especieTexto: { fontSize: 14, fontWeight: '600', color: '#374151' },
  especieTextoActivo: { color: 'white' },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    fontSize: 14,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  inputBtn: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputBtnText: {
    color: '#111827',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  chevron: { color: '#f97316', fontSize: 14 },
  calIcon: { fontSize: 18 },
  dropdown: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemActivo: {
    backgroundColor: '#fff7ed',
  },
  dropdownText: { fontSize: 14, color: '#111827' },
  dropdownCheck: { color: '#f97316', fontWeight: 'bold' },
  dropdownVacio: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: 16,
    fontSize: 14,
  },
  btnCrear: {
    backgroundColor: '#f97316',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  btnCrearTexto: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});