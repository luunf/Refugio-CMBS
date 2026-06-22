import React, { useEffect, useState } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet, Alert, Switch
} from "react-native";
import { api } from "@/config/api";
import MultiSelector from "./MultiSelector";
import SingleSelector from "./SingleSelector";
import EstadoSelector from "./EstadoSelector";
import AnimalDatePickerModal from "./AnimalDatePickerModal"
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';
import { Image } from 'expo-image';

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

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreado: () => void;
}

const TIPOS = ["perro", "gato"];
const GENEROS = ["macho", "hembra"];
const TAMANIOS = ["chico", "mediano", "grande"];

const formatFecha = (fecha?: string) => {
  if (!fecha) return "";
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
};

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

export default function ModalAgregarAnimal({ visible, onClose, onCreado }: Props) {
  const { t } = useTranslation('animales');
  
  const hoy = new Date().toISOString().split('T')[0];
  
  const [loading, setLoading] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [compatibilidades, setCompatibilidades] = useState<Compatibilidad[]>([]);
  const [voluntarios, setVoluntarios] = useState<Persona[]>([]);
  const [adoptantes, setAdoptantes] = useState<Persona[]>([]);
  const [hogares, setHogares] = useState<Persona[]>([]);

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<string | null>(null);
  const [genero, setGenero] = useState<string | null>(null);
  const [tamanio, setTamanio] = useState<string | null>(null);
  const [raza, setRaza] = useState("");
  const [colores, setColores] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState(hoy);
  const [infoAdicional, setInfoAdicional] = useState("");
  const [comportamiento, setComportamiento] = useState("");
  const [esterilizado, setEsterilizado] = useState(false);
  const [estadoIds, setEstadoIds] = useState<number[]>([]);
  const [compatibilidadIds, setCompatibilidadIds] = useState<number[]>([]);
  const [voluntarioIds, setVoluntarioIds] = useState<number[]>([]);
  const [adoptanteId, setAdoptanteId] = useState<number | null>(null);
  const [hogarId, setHogarId] = useState<number | null>(null);

  const [pickerNacimiento, setPickerNacimiento] = useState(false);
  const [pickerIngreso, setPickerIngreso] = useState(false);

  const [imagen, setImagen] = useState<string | null>(null);
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const tieneTransito = estadoIds.some(id =>
    estados.find(e => e.id_estado === id)?.nombre === "En tránsito"
  );
  const tieneAdoptado = estadoIds.some(id =>
    estados.find(e => e.id_estado === id)?.nombre === "Adoptado"
  );

  const errorFechaNacimiento = fechaNacimientoInvalida(fechaNacimiento, fechaIngreso, hoy);
  const errorFechaIngreso = fechaIngresoInvalida(fechaIngreso, fechaNacimiento);

  const maxDateNacimiento = fechaIngreso && fechaIngreso < hoy ? fechaIngreso : hoy;
  const minDateIngreso = fechaNacimiento || undefined;

  useEffect(() => {
    if (visible) cargarDatos();
  }, [visible]);

  const cargarDatos = async () => {
    try {
      const [est, comps, vols, ads, hogs] = await Promise.all([
        api.getEstados(),
        api.getCompatibilidades(),
        api.getPersonas("voluntario"),
        api.getPersonas("adoptante"),
        api.getPersonas("hogar_transito"),
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

  const resetForm = () => {
    setNombre("");
    setTipo(null);
    setGenero(null);
    setTamanio(null);
    setRaza("");
    setColores("");
    setFechaNacimiento("");
    setFechaIngreso(hoy);
    setInfoAdicional("");
    setComportamiento("");
    setEsterilizado(false);
    setEstadoIds([]);
    setCompatibilidadIds([]);
    setVoluntarioIds([]);
    setAdoptanteId(null);
    setHogarId(null);
    setImagen(null);
    setImagenUrl(null);
    setSubiendoImagen(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return Alert.alert(t('error'), t('errorNombre'));
    if (!tipo) return Alert.alert(t('error'), t('errorTipo'));
    if (!genero) return Alert.alert(t('error'), t('errorGenero'));
    if (!tamanio) return Alert.alert(t('error'), t('errorTamanio'));
    if (!fechaIngreso) return Alert.alert(t('error'), t('errorFechaIngreso'));
    if (errorFechaNacimiento) return Alert.alert(t('error'), t('errorFechaNacimientoInvalida'));
    if (errorFechaIngreso) return Alert.alert(t('error'), t('errorFechaIngresoInvalida'));
    if (estadoIds.length === 0) return Alert.alert(t('error'), t('errorEstados'));


    setLoading(true);
    try {
      let urlImagen = null;
      if (imagen) {
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
      }

      await api.createAnimal({
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
        estados: estadoIds,
        compatibilidades: compatibilidadIds,
        voluntarios: voluntarioIds,
        adoptante: tieneAdoptado ? adoptanteId : null,
        hogar_transito: tieneTransito ? hogarId : null,
        url_imagen: urlImagen ?? null,
      });
      onCreado();
      handleClose();
      Alert.alert(t('success'), t('successRegistrar'));
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.error ?? t('errorRegistrar'));
    } finally {
      setLoading(false);
    }
  };

  const compatibilidadesItems = compatibilidades.map(c => ({ id: c.id_compatibilidad, nombre: c.nombre }));
  const voluntariosItems = voluntarios.map(p => ({ id: p.id_persona, nombre: `${p.nombre} ${p.apellido}` }));
  const adoptantesItems = adoptantes.map(p => ({ id: p.id_persona, nombre: `${p.nombre} ${p.apellido}` }));
  const hogaresItems = hogares.map(p => ({ id: p.id_persona, nombre: `${p.nombre} ${p.apellido}` }));

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
    const manipulada = await img.saveAsync({
      compress: 0.8,
      format: SaveFormat.JPEG,
    });

    setImagen(manipulada.uri);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>

          <View style={styles.header}>
            <Text style={styles.titulo}>{t('titleNuevoAnimal')}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.cerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Nombre */}
            <Text style={styles.label}>{t('labelNombre')}{t('requiredSymbol')}</Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              style={styles.input}
              placeholder={t('placeholderNombre')}
              placeholderTextColor={Colors.textFaint}
            />

            {/* Tipo */}
            <Text style={styles.label}>{t('labelTipo')}{t('requiredSymbol')}</Text>
            <View style={styles.opcionesRow}>
              {TIPOS.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.badge, tipo === t && styles.badgeActivo]}
                  onPress={() => setTipo(t)}
                >
                  <Text style={tipo === t ? styles.badgeTextoActivo : styles.badgeTexto}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Género */}
            <Text style={styles.label}>{t('labelGenero')}{t('requiredSymbol')}</Text>
            <View style={styles.opcionesRow}>
              {GENEROS.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.badge, genero === g && styles.badgeActivo]}
                  onPress={() => setGenero(g)}
                >
                  <Text style={genero === g ? styles.badgeTextoActivo : styles.badgeTexto}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tamaño */}
            <Text style={styles.label}>{t('labelTamanio')}{t('requiredSymbol')}</Text>
            <View style={styles.opcionesRow}>
              {TAMANIOS.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.badge, tamanio === t && styles.badgeActivo]}
                  onPress={() => setTamanio(t)}
                >
                  <Text style={tamanio === t ? styles.badgeTextoActivo : styles.badgeTexto}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Raza */}
            <Text style={styles.label}>{t('labelRaza')}</Text>
            <TextInput
              value={raza}
              onChangeText={setRaza}
              style={styles.input}
              placeholder={t('placeholderRaza')}
              placeholderTextColor={Colors.textFaint}
            />

            {/* Colores */}
            <Text style={styles.label}>{t('labelColores')}</Text>
            <TextInput
              value={colores}
              onChangeText={setColores}
              style={styles.input}
              placeholder={t('placeholderColores')}
              placeholderTextColor={Colors.textFaint}
            />

            {/* Fecha de nacimiento */}
            <Text style={styles.label}>{t('labelFechaNacimiento')}</Text>
            <TouchableOpacity
              style={styles.inputFecha}
              onPress={() => setPickerNacimiento(true)}
            >
              <Text style={fechaNacimiento ? styles.fechaTexto : styles.fechaPlaceholder}>
                {fechaNacimiento ? formatFecha(fechaNacimiento) : t('placeholderSeleccionarFecha')}
              </Text>
            </TouchableOpacity>
            {errorFechaNacimiento && (
              <Text style={styles.fechaErrorTexto}>{t('errorFechaNacimientoInvalida')}</Text>
            )}

            {/* Fecha de ingreso */}
            <Text style={styles.label}>{t('labelFechaIngreso')}{t('requiredSymbol')}</Text>
            <TouchableOpacity
              style={styles.inputFecha}
              onPress={() => setPickerIngreso(true)}
            >
              <Text style={fechaIngreso ? styles.fechaTexto : styles.fechaPlaceholder}>
                {fechaIngreso ? formatFecha(fechaIngreso) : t('placeholderSeleccionarFecha')}
              </Text>
            </TouchableOpacity>
            {errorFechaIngreso && (
              <Text style={styles.fechaErrorTexto}>{t('errorFechaIngresoInvalida')}</Text>
            )}

            {/* Estados */}
            <Text style={styles.label}>{t('labelEstados')}{t('requiredSymbol')}</Text>
            <EstadoSelector
              value={estadoIds}
              onChange={setEstadoIds}
              estados={estados}
              placeholder={t('placeholderSeleccionarEstados')}
            />

            {/* Voluntarios */}
            <Text style={styles.label}>{t('labelVoluntarios')}</Text>
            <MultiSelector
              value={voluntarioIds}
              onChange={setVoluntarioIds}
              items={voluntariosItems}
              placeholder={t('placeholderSeleccionarVoluntarios')}
              searchable
            />

            {/* Hogar de tránsito */}
            {tieneTransito && (
              <>
                <Text style={styles.label}>{t('labelHogarTransito')}</Text>
                <SingleSelector
                  value={hogarId}
                  onChange={setHogarId}
                  items={hogaresItems}
                  placeholder={t('placeholderSeleccionarHogar')}
                  searchable
                />
              </>
            )}

            {/* Adoptante */}
            {tieneAdoptado && (
              <>
                <Text style={styles.label}>{t('labelAdoptante')}</Text>
                <SingleSelector
                  value={adoptanteId}
                  onChange={setAdoptanteId}
                  items={adoptantesItems}
                  placeholder={t('placeholderSeleccionarAdoptante')}
                  searchable
                />
              </>
            )}

            {/* Imagen */}
            <Text style={styles.label}>{t('labelImagen')}</Text>
            {imagen ? (
              <View style={styles.imagenPreviewContainer}>
                <TouchableOpacity
                  onPress={handleSeleccionarImagen}
                  disabled={subiendoImagen}
                  style={styles.imagenPreviewContainer}
                >
                  <Image source={{ uri: imagen }} style={styles.imagenPreview} contentFit='cover' />
                  <View style={styles.imagenOverlay}>
                    {subiendoImagen ? (
                      <>
                        <ActivityIndicator color={Colors.surface} />
                        <Text style={styles.imagenOverlayTexto}>{t('imagenSubiendo')}</Text>
                      </>
                    ) : (
                      <Text style={styles.imagenOverlayTexto}>{t('imagenCambiar')}</Text>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Botón quitar imagen */}
                {!subiendoImagen && (
                  <TouchableOpacity
                    style={styles.btnQuitarImagen}
                    onPress={() => setImagen(null)}
                  >
                    <Text style={styles.btnQuitarImagenTexto}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.btnImagen, subiendoImagen && { opacity: 0.6 }]}
                onPress={handleSeleccionarImagen}
                disabled={subiendoImagen}
              >
                {subiendoImagen
                  ? <ActivityIndicator color={Colors.surface} />
                  : <Text style={styles.btnImagenTexto}>{t('btnAnadirImagen')}</Text>
                }
              </TouchableOpacity>
            )}
            
            {/* Comportamiento */}
            <Text style={styles.label}>{t('labelComportamiento')}</Text>
            <TextInput
              value={comportamiento}
              onChangeText={setComportamiento}
              style={[styles.input, styles.inputMultiline]}
              placeholder={t('placeholderComportamiento')}
              placeholderTextColor={Colors.textFaint}
              multiline
              numberOfLines={3}
            />
            
            {/* Info adicional */}
            <Text style={styles.label}>{t('labelInfoAdicional')}</Text>
            <TextInput
              value={infoAdicional}
              onChangeText={setInfoAdicional}
              style={[styles.input, styles.inputMultiline]}
              placeholder={t('placeholderInfoAdicional')}
              placeholderTextColor={Colors.textFaint}
              multiline
              numberOfLines={3}
            />

            {/* Compatibilidades */}
            <Text style={styles.label}>{t('labelCompatibilidades')}</Text>
            <MultiSelector
              value={compatibilidadIds}
              onChange={setCompatibilidadIds}
              items={compatibilidadesItems}
              placeholder={t('placeholderSeleccionarCompatibilidades')}
            />

            {/* Esterilizado */}
            <View style={styles.switchRow}>
              <Text style={styles.label}>{t('labelEsterilizado')}</Text>
              <Switch
                value={esterilizado}
                onValueChange={setEsterilizado}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.surface}
              />
            </View>

            {/* Botón crear */}
            <TouchableOpacity onPress={handleCrear} disabled={loading} style={styles.btnCrear}>
              {loading
                ? <ActivityIndicator color={Colors.surface} />
                : <Text style={styles.btnCrearTexto}>{t('btnCrear')}</Text>
              }
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>

      {/* Date Pickers */}
      <AnimalDatePickerModal
        visible={pickerNacimiento}
        onClose={() => setPickerNacimiento(false)}
        onSelectDate={(date) => setFechaNacimiento(date)}
        titulo={t('titleSeleccionarFechaNacimiento')}
        fechaSeleccionada={fechaNacimiento}
        maxDate={maxDateNacimiento}
      />
      <AnimalDatePickerModal
        visible={pickerIngreso}
        onClose={() => setPickerIngreso(false)}
        onSelectDate={(date) => setFechaIngreso(date)}
        titulo={t('titleSeleccionarFechaIngreso')}
        fechaSeleccionada={fechaIngreso}
        minDate={minDateIngreso}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container: {
    backgroundColor: Colors.primaryFaint,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titulo: { fontSize: 20, fontWeight: "bold", color: Colors.text },
  cerrar: { fontSize: 22, color: Colors.textMuted },
  label: { fontWeight: "600", marginBottom: 4, color: Colors.text, fontSize: 14, marginTop: 4 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
    color: Colors.text,
  },
  inputMultiline: { textAlignVertical: "top" },
  inputFecha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  fechaTexto: { fontSize: 14, color: Colors.text },
  fechaPlaceholder: { fontSize: 14, color: Colors.textFaint },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  opcionesRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeActivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  badgeTexto: { color: Colors.textSoft, fontSize: 13, fontWeight: "500" },
  badgeTextoActivo: { color: Colors.surface, fontSize: 13, fontWeight: "600" },
  btnCrear: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  btnCrearTexto: { color: Colors.surface, fontWeight: "bold", fontSize: 16 },
  imagenPreviewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imagenPreview: {
    width: '100%',
    height: '100%',
  },
  imagenOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imagenOverlayTexto: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '500',
  },
  btnImagen: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  btnImagenTexto: { 
    fontSize: 14, 
    color: Colors.primary, 
    fontWeight: "600" 
  },
  btnQuitarImagen: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnQuitarImagenTexto: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  fechaErrorTexto: {
    color: Colors.delete,
    fontSize: 12,
    marginTop: -10,
    marginBottom: 14,
  },
});