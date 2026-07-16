import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet, Alert, Switch,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { api } from '@/config/api';
import MultiSelector from './MultiSelector';
import SingleSelector from './SingleSelector';
import AnimalDatePickerModal from './AnimalDatePickerModal';
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/config/firebase';
import { Image } from 'expo-image';
import { MaterialIcons } from "@expo/vector-icons";

interface Estado {
  id_estado: number;
  nombre: string;
}

interface Compatibilidad {
  id_compatibilidad: number;
  nombre: string;
}

interface Persona {
  id_persona: number;
  nombre: string;
  apellido: string;
}

interface Animal {
  id_animal: number;
  nombre: string;
  tipo: string;
  genero: string;
  tamanio: string;
  raza?: string;
  colores?: string;
  fecha_nacimiento?: string;
  fecha_ingreso: string;
  info_adicional?: string;
  comportamiento?: string;
  esterilizado: boolean;
  url_imagen?: string;
  estados: { id_estado: number; nombre: string }[];
  compatibilidades: { id_compatibilidad: number; nombre: string }[];
  voluntarios: { id_persona: number; nombre: string; apellido: string }[];
  hogar_transito?: { id_persona: number; nombre: string; apellido: string };
  adoptante?: { id_persona: number; nombre: string; apellido: string };
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onEditado: () => void;
  animal: Animal;
}

const TIPOS = ['perro', 'gato'];
const GENEROS = ['macho', 'hembra'];
const TAMANIOS = ['chico', 'mediano', 'grande'];

const formatFecha = (fecha?: string) => {
  if (!fecha) return "";
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
};

function getFechaLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const fechaNacimientoInvalida = (fechaNacimiento: string, fechaIngreso: string, hoy: string): boolean => {
  if (!fechaNacimiento) return false;
  if (fechaNacimiento > hoy) return true;
  if (fechaIngreso && fechaNacimiento > fechaIngreso) return true;
  return false;
};

const fechaIngresoInvalida = (fechaIngreso: string, fechaNacimiento: string): boolean => {
  if (!fechaIngreso) return false;
  if (fechaNacimiento && fechaIngreso < fechaNacimiento) return true;
  return false;
};

const nombreCompleto = (p: Persona) =>
  [p.nombre, p.apellido].filter(Boolean).join(' ') || 'Usuario sin nombre';

export default function ModalEditarAnimal({ visible, onClose, onEditado, animal }: Props) {
  const { t } = useTranslation('animales');

  const hoy = getFechaLocal(new Date());

  const [loading, setLoading] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [compatibilidades, setCompatibilidades] = useState<Compatibilidad[]>([]);
  const [voluntarios, setVoluntarios] = useState<Persona[]>([]);
  const [adoptantes, setAdoptantes] = useState<Persona[]>([]);
  const [hogares, setHogares] = useState<Persona[]>([]);

  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<string | null>(null);
  const [genero, setGenero] = useState<string | null>(null);
  const [tamanio, setTamanio] = useState<string | null>(null);
  const [raza, setRaza] = useState('');
  const [colores, setColores] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [infoAdicional, setInfoAdicional] = useState('');
  const [comportamiento, setComportamiento] = useState('');
  const [esterilizado, setEsterilizado] = useState(false);
  const [ubicacionId, setUbicacionId] = useState<number | null>(null);
  const [estadoAdopcionId, setEstadoAdopcionId] = useState<number | null>(null);
  const [compatibilidadIds, setCompatibilidadIds] = useState<number[]>([]);
  const [voluntarioIds, setVoluntarioIds] = useState<number[]>([]);
  const [adoptanteId, setAdoptanteId] = useState<number | null>(null);
  const [hogarId, setHogarId] = useState<number | null>(null);
  const [imagen, setImagen] = useState<string | null>(null);
  const [imagenEliminada, setImagenEliminada] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [pickerNacimiento, setPickerNacimiento] = useState(false);
  const [pickerIngreso, setPickerIngreso] = useState(false);

  const estadosUbicacion = estados.filter(e =>
    e.nombre === 'En tránsito' || e.nombre === 'En refugio'
  );
  const estadosAdopcion = estados.filter(e =>
    e.nombre === 'En adopción' || e.nombre === 'Adoptado'
  );

  const tieneTransito = estadosUbicacion.find(e => e.id_estado === ubicacionId)?.nombre === 'En tránsito';
  const tieneAdoptado = estadosAdopcion.find(e => e.id_estado === estadoAdopcionId)?.nombre === 'Adoptado';

  const errorFechaNacimiento = fechaNacimientoInvalida(fechaNacimiento, fechaIngreso, hoy);
  const errorFechaIngreso = fechaIngresoInvalida(fechaIngreso, fechaNacimiento);

  const maxDateNacimiento = fechaIngreso && fechaIngreso < hoy ? fechaIngreso : hoy;
  const minDateIngreso = fechaNacimiento || undefined;

  const imagenMostrar = imagen ?? (!imagenEliminada ? animal.url_imagen ?? null : null);

  useEffect(() => {
    if (visible) {
      cargarDatos();
      precargarDatos();
    }
  }, [visible]);

  const precargarDatos = () => {
    setNombre(animal.nombre);
    setTipo(animal.tipo);
    setGenero(animal.genero);
    setTamanio(animal.tamanio);
    setRaza(animal.raza ?? '');
    setColores(animal.colores ?? '');
    setFechaNacimiento(animal.fecha_nacimiento ?? '');
    setFechaIngreso(animal.fecha_ingreso);
    setInfoAdicional(animal.info_adicional ?? '');
    setComportamiento(animal.comportamiento ?? '');
    setEsterilizado(animal.esterilizado);
    const ubicacion = animal.estados.find(e => e.nombre === 'En tránsito' || e.nombre === 'En refugio');
    const estadoAdopcion = animal.estados.find(e => e.nombre === 'En adopción' || e.nombre === 'Adoptado');
    setUbicacionId(ubicacion?.id_estado ?? null);
    setEstadoAdopcionId(estadoAdopcion?.id_estado ?? null);
    setCompatibilidadIds(animal.compatibilidades.map(c => c.id_compatibilidad));
    setVoluntarioIds(animal.voluntarios.map(v => v.id_persona));
    setAdoptanteId(animal.adoptante?.id_persona ?? null);
    setHogarId(animal.hogar_transito?.id_persona ?? null);
    setImagen(null);
    setImagenEliminada(false);
  };

  const cargarDatos = async () => {
    try {
      const [est, comps, vols, ads, hogs] = await Promise.all([
        api.getEstados(),
        api.getCompatibilidades(),
        api.getPersonas('voluntario'),
        api.getPersonas('adoptante'),
        api.getPersonas('hogar_transito'),
      ]);
      setEstados(Array.isArray(est) ? est : []);
      setCompatibilidades(Array.isArray(comps) ? comps : []);
      setVoluntarios(Array.isArray(vols) ? vols : []);
      setAdoptantes(Array.isArray(ads) ? ads : []);
      setHogares(Array.isArray(hogs) ? hogs : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSeleccionarImagen = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    const img = await ImageManipulator.manipulate(uri).resize({ width: 400, height: 400 }).renderAsync();
    const manipulada = await img.saveAsync({ compress: 0.8, format: SaveFormat.JPEG });
    setImagen(manipulada.uri);
    setImagenEliminada(false);
  };

  const handleAbrirCamara = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert(t('error'), t('errorPermisoCamara'));
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    const img = await ImageManipulator.manipulate(uri).resize({ width: 400, height: 400 }).renderAsync();
    const manipulada = await img.saveAsync({ compress: 0.8, format: SaveFormat.JPEG });
    setImagen(manipulada.uri);
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) return Alert.alert(t('error'), t('errorNombre'));
    if (!tipo) return Alert.alert(t('error'), t('errorTipo'));
    if (!genero) return Alert.alert(t('error'), t('errorGenero'));
    if (!tamanio) return Alert.alert(t('error'), t('errorTamanio'));
    if (!fechaIngreso) return Alert.alert(t('error'), t('errorFechaIngreso'));
    if (errorFechaNacimiento) return Alert.alert(t('error'), t('errorFechaNacimientoInvalida'));
    if (errorFechaIngreso) return Alert.alert(t('error'), t('errorFechaIngresoInvalida'));
    if (!ubicacionId && !estadoAdopcionId) return Alert.alert(t('error'), t('errorEstados'));
    if (tieneTransito && !hogarId) return Alert.alert(t('error'), t('errorHogarRequerido'));
    if (tieneAdoptado && !adoptanteId) return Alert.alert(t('error'), t('errorAdoptanteRequerido'));

    setLoading(true);
    try {
      let urlImagen = animal.url_imagen ?? null;

      if (imagen) {
        if (animal.url_imagen) {
          const imageRef = ref(storage, animal.url_imagen);
          await deleteObject(imageRef).catch(() => {});
        }
        const blob = await new Promise<Blob>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => resolve(xhr.response);
          xhr.onerror = () => reject(new TypeError('Network request failed'));
          xhr.responseType = 'blob';
          xhr.open('GET', imagen, true);
          xhr.send(null);
        });
        const storageRef = ref(storage, `animales/${Date.now()}.jpg`);
        await uploadBytes(storageRef, blob);
        urlImagen = await getDownloadURL(storageRef);
      } else if (imagenEliminada && animal.url_imagen) {
        const imageRef = ref(storage, animal.url_imagen);
        await deleteObject(imageRef).catch(() => {});
        urlImagen = null;
      }

      await api.updateAnimal(animal.id_animal, {
        nombre: nombre.trim(),
        tipo,
        genero,
        tamanio,
        raza: raza.trim() || null,
        colores: colores.trim() || null,
        fecha_nacimiento: fechaNacimiento || null,
        fecha_ingreso: fechaIngreso,
        info_adicional: infoAdicional.trim() || null,
        comportamiento: comportamiento.trim() || null,
        esterilizado,
        estados: [ubicacionId, estadoAdopcionId].filter((id): id is number => id !== null),
        compatibilidades: compatibilidadIds,
        voluntarios: voluntarioIds,
        adoptante: tieneAdoptado ? adoptanteId : null,
        hogar_transito: tieneTransito ? hogarId : null,
        url_imagen: urlImagen,
      });

      onEditado();
      onClose();
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.error ?? t('errorEditar'));
    } finally {
      setLoading(false);
    }
  };

  const compatibilidadesItems = compatibilidades.map(c => ({ id: c.id_compatibilidad, nombre: c.nombre }));
  const voluntariosItems = voluntarios.map(p => ({ id: p.id_persona, nombre: nombreCompleto(p) }));
  const adoptantesItems = adoptantes.map(p => ({ id: p.id_persona, nombre: nombreCompleto(p) }));
  const hogaresItems = hogares.map(p => ({ id: p.id_persona, nombre: nombreCompleto(p) }));

  return (
    <Modal visible={visible} animationType='slide' transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.titulo}>{t('titleEditarAnimal')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            <Text style={styles.label}>{t('labelNombre')}{t('requiredSymbol')}</Text>
            <TextInput value={nombre} onChangeText={setNombre} style={styles.input} placeholder={t('placeholderNombre')} placeholderTextColor={Colors.textFaint} />

            <Text style={styles.label}>{t('labelTipo')}{t('requiredSymbol')}</Text>
            <View style={styles.opcionesRow}>
              {TIPOS.map(tp => (
                <TouchableOpacity key={tp} style={[styles.badge, tipo === tp && styles.badgeActivo]} onPress={() => setTipo(tp)}>
                  <Text style={tipo === tp ? styles.badgeTextoActivo : styles.badgeTexto}>{tp.charAt(0).toUpperCase() + tp.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('labelGenero')}{t('requiredSymbol')}</Text>
            <View style={styles.opcionesRow}>
              {GENEROS.map(g => (
                <TouchableOpacity key={g} style={[styles.badge, genero === g && styles.badgeActivo]} onPress={() => setGenero(g)}>
                  <Text style={genero === g ? styles.badgeTextoActivo : styles.badgeTexto}>{g.charAt(0).toUpperCase() + g.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('labelTamanio')}{t('requiredSymbol')}</Text>
            <View style={styles.opcionesRow}>
              {TAMANIOS.map(tm => (
                <TouchableOpacity key={tm} style={[styles.badge, tamanio === tm && styles.badgeActivo]} onPress={() => setTamanio(tm)}>
                  <Text style={tamanio === tm ? styles.badgeTextoActivo : styles.badgeTexto}>{tm.charAt(0).toUpperCase() + tm.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t('labelRaza')}</Text>
            <TextInput value={raza} onChangeText={setRaza} style={styles.input} placeholder={t('placeholderRaza')} placeholderTextColor={Colors.textFaint} />

            <Text style={styles.label}>{t('labelColores')}</Text>
            <TextInput value={colores} onChangeText={setColores} style={styles.input} placeholder={t('placeholderColores')} placeholderTextColor={Colors.textFaint} />

            <Text style={styles.label}>{t('labelFechaNacimiento')}</Text>
            <TouchableOpacity style={styles.inputFecha} onPress={() => setPickerNacimiento(true)}>
              <Text style={fechaNacimiento ? styles.fechaTexto : styles.fechaPlaceholder}>
                {fechaNacimiento? formatFecha(fechaNacimiento) : t('placeholderSeleccionarFecha')}
              </Text>
            </TouchableOpacity>
            {errorFechaNacimiento && (
              <Text style={styles.fechaErrorTexto}>{t('errorFechaNacimientoInvalida')}</Text>
            )}

            <Text style={styles.label}>{t('labelFechaIngreso')}{t('requiredSymbol')}</Text>
            <TouchableOpacity style={styles.inputFecha} onPress={() => setPickerIngreso(true)}>
              <Text style={fechaIngreso ? styles.fechaTexto : styles.fechaPlaceholder}>
                {fechaIngreso ? formatFecha(fechaIngreso) : t('placeholderSeleccionarFecha')}
              </Text>
            </TouchableOpacity>
            {errorFechaIngreso && (
              <Text style={styles.fechaErrorTexto}>{t('errorFechaIngresoInvalida')}</Text>
            )}

            <Text style={styles.label}>{t('labelEstados')}{t('requiredSymbol')}</Text>
            {/* Ubicación */}
            <SingleSelector
              value={ubicacionId}
              onChange={setUbicacionId}
              items={estadosUbicacion.map(e => ({ id: e.id_estado, nombre: e.nombre }))}
              placeholder={t('placeholderSeleccionarUbicacion')}
            />
            {/* Estado de adopción */}
            <SingleSelector
              value={estadoAdopcionId}
              onChange={setEstadoAdopcionId}
              items={estadosAdopcion.map(e => ({ id: e.id_estado, nombre: e.nombre }))}
              placeholder={t('placeholderSeleccionarEstadoAdopcion')}
            />

            {tieneTransito && (
              <>
                <Text style={styles.label}>{t('labelHogarTransito')}{t('requiredSymbol')}</Text>
                <SingleSelector value={hogarId} onChange={setHogarId} items={hogaresItems} placeholder={t('placeholderSeleccionarHogar')} searchable />
              </>
            )}

            {tieneAdoptado && (
              <>
                <Text style={styles.label}>{t('labelAdoptante')}{t('requiredSymbol')}</Text>
                <SingleSelector value={adoptanteId} onChange={setAdoptanteId} items={adoptantesItems} placeholder={t('placeholderSeleccionarAdoptante')} searchable />
              </>
            )}

            <Text style={styles.label}>{t('labelVoluntarios')}</Text>
            <MultiSelector value={voluntarioIds} onChange={setVoluntarioIds} items={voluntariosItems} placeholder={t('placeholderSeleccionarVoluntarios')} searchable />

            <Text style={styles.label}>{t('labelImagen')}</Text>
            {imagenMostrar && (
              <View style={styles.imagenPreviewContainer}>
                <Image source={{ uri: imagenMostrar }} style={styles.imagenPreview} contentFit='cover' cachePolicy='memory-disk' />
                <TouchableOpacity
                  style={styles.btnQuitarImagen}
                  onPress={() => { setImagen(null); setImagenEliminada(true); }}
                >
                  <Text style={styles.btnQuitarImagenTexto}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {!imagenMostrar && (
              <View style={styles.botonesImagenRow}>
                <TouchableOpacity style={styles.btnImagenOpcion} onPress={handleSeleccionarImagen}>
                  <MaterialIcons name="photo-library" size={24} color={Colors.primary} />
                  <Text style={styles.btnImagenOpcionTexto}>{t('imagenGaleria')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnImagenOpcion} onPress={handleAbrirCamara}>
                  <MaterialIcons name="camera-alt" size={24} color={Colors.primary} />
                  <Text style={styles.btnImagenOpcionTexto}>{t('imagenCamara')}</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.label}>{t('labelComportamiento')}</Text>
            <TextInput value={comportamiento} onChangeText={setComportamiento} style={[styles.input, styles.inputMultiline]} placeholder={t('placeholderComportamiento')} placeholderTextColor={Colors.textFaint} multiline numberOfLines={3} />

            <Text style={styles.label}>{t('labelInfoAdicional')}</Text>
            <TextInput value={infoAdicional} onChangeText={setInfoAdicional} style={[styles.input, styles.inputMultiline]} placeholder={t('placeholderInfoAdicional')} placeholderTextColor={Colors.textFaint} multiline numberOfLines={3} />

            <Text style={styles.label}>{t('labelCompatibilidades')}</Text>
            <MultiSelector value={compatibilidadIds} onChange={setCompatibilidadIds} items={compatibilidadesItems} placeholder={t('placeholderSeleccionarCompatibilidades')} />

            <View style={styles.switchRow}>
              <Text style={styles.label}>{t('labelEsterilizado')}</Text>
              <Switch value={esterilizado} onValueChange={setEsterilizado} trackColor={{ false: Colors.border, true: Colors.primary }} thumbColor={Colors.surface} />
            </View>

            <TouchableOpacity onPress={handleGuardar} disabled={loading} style={styles.btnGuardar}>
              {loading
                ? <ActivityIndicator color={Colors.surface} />
                : <Text style={styles.btnGuardarTexto}>{t('btnGuardar')}</Text>
              }
            </TouchableOpacity>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <AnimalDatePickerModal visible={pickerNacimiento} onClose={() => setPickerNacimiento(false)} onSelectDate={setFechaNacimiento} titulo={t('titleSeleccionarFechaNacimiento')} fechaSeleccionada={fechaNacimiento} maxDate={maxDateNacimiento}/>
      <AnimalDatePickerModal visible={pickerIngreso} onClose={() => setPickerIngreso(false)} onSelectDate={setFechaIngreso} titulo={t('titleSeleccionarFechaIngreso')} fechaSeleccionada={fechaIngreso} minDate={minDateIngreso}/>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  container: { backgroundColor: Colors.primaryFaint, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  cerrar: { fontSize: 22, color: Colors.textMuted },
  label: { fontWeight: '600', marginBottom: 4, color: Colors.text, fontSize: 14, marginTop: 4 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, fontSize: 14, color: Colors.text },
  inputMultiline: { textAlignVertical: 'top' },
  inputFecha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16 },
  fechaTexto: { fontSize: 14, color: Colors.text },
  fechaPlaceholder: { fontSize: 14, color: Colors.textFaint },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  opcionesRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  badge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  badgeActivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  badgeTexto: { color: Colors.textSoft, fontSize: 13, fontWeight: '500' },
  badgeTextoActivo: { color: Colors.surface, fontSize: 13, fontWeight: '600' },
  btnGuardar: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 20, alignItems: 'center', marginTop: 8, marginBottom: 8 },
  btnGuardarTexto: { color: Colors.surface, fontWeight: 'bold', fontSize: 16 },
  imagenPreviewContainer: { width: '100%', height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  imagenPreview: { width: '100%', height: '100%' },
  imagenOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', gap: 8 },
  imagenOverlayTexto: { color: Colors.surface, fontSize: 14, fontWeight: '500' },
  btnQuitarImagen: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
  btnQuitarImagenTexto: { color: Colors.surface, fontSize: 14, fontWeight: 'bold' },
  botonesImagenRow: { flexDirection: 'row', gap: 12, marginBottom: 20,},
  btnImagenOpcion: { flex: 1, borderWidth: 1.5, borderColor: Colors.primary, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 16, alignItems: 'center', gap: 6,},
  btnImagenOpcionTexto: { fontSize: 13, color: Colors.primary, fontWeight: '600',},
  fechaErrorTexto: { color: Colors.delete, fontSize: 12, marginTop: -10, marginBottom: 14, },
});