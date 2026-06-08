import React, { useEffect, useState } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet, Alert, Switch
} from "react-native";
import { api } from "@/config/api";
import MultiSelector from "./MultiSelector";
import SingleSelector from "./SingleSelector";
import EstadoSelector from "./EstadoSelector";
import AnimalDatePickerModal from "./AnimalDatePickerModal";
import { Colors } from '@/constants/theme';

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

export default function ModalAgregarAnimal({ visible, onClose, onCreado }: Props) {
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
  const [fechaIngreso, setFechaIngreso] = useState("");
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

  const tieneTransito = estadoIds.some(id =>
    estados.find(e => e.id_estado === id)?.nombre === "En tránsito"
  );
  const tieneAdoptado = estadoIds.some(id =>
    estados.find(e => e.id_estado === id)?.nombre === "Adoptado"
  );

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
    setFechaIngreso("");
    setInfoAdicional("");
    setComportamiento("");
    setEsterilizado(false);
    setEstadoIds([]);
    setCompatibilidadIds([]);
    setVoluntarioIds([]);
    setAdoptanteId(null);
    setHogarId(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCrear = async () => {
    if (!nombre.trim()) return Alert.alert("Error", "El nombre es obligatorio");
    if (!tipo) return Alert.alert("Error", "El tipo es obligatorio");
    if (!genero) return Alert.alert("Error", "El género es obligatorio");
    if (!tamanio) return Alert.alert("Error", "El tamaño es obligatorio");
    if (!fechaIngreso) return Alert.alert("Error", "La fecha de ingreso es obligatoria");
    if (estadoIds.length === 0) return Alert.alert("Error", "Seleccioná al menos un estado");

    setLoading(true);
    try {
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
      });
      onCreado();
      handleClose();
      Alert.alert("Éxito", "Animal registrado correctamente");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error ?? "No se pudo registrar el animal");
    } finally {
      setLoading(false);
    }
  };

  const compatibilidadesItems = compatibilidades.map(c => ({ id: c.id_compatibilidad, nombre: c.nombre }));
  const voluntariosItems = voluntarios.map(p => ({ id: p.id_persona, nombre: `${p.nombre} ${p.apellido}` }));
  const adoptantesItems = adoptantes.map(p => ({ id: p.id_persona, nombre: `${p.nombre} ${p.apellido}` }));
  const hogaresItems = hogares.map(p => ({ id: p.id_persona, nombre: `${p.nombre} ${p.apellido}` }));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>

          <View style={styles.header}>
            <Text style={styles.titulo}>Nuevo animal</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.cerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Nombre */}
            <Text style={styles.label}>Nombre*</Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              style={styles.input}
              placeholder="Nombre del animal"
              placeholderTextColor={Colors.textFaint}
            />

            {/* Tipo */}
            <Text style={styles.label}>Tipo*</Text>
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
            <Text style={styles.label}>Género*</Text>
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
            <Text style={styles.label}>Tamaño*</Text>
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
            <Text style={styles.label}>Raza</Text>
            <TextInput
              value={raza}
              onChangeText={setRaza}
              style={styles.input}
              placeholder="Raza"
              placeholderTextColor={Colors.textFaint}
            />

            {/* Colores */}
            <Text style={styles.label}>Colores</Text>
            <TextInput
              value={colores}
              onChangeText={setColores}
              style={styles.input}
              placeholder="Colores"
              placeholderTextColor={Colors.textFaint}
            />

            {/* Fecha de nacimiento */}
            <Text style={styles.label}>Fecha de nacimiento</Text>
            <TouchableOpacity
              style={styles.inputFecha}
              onPress={() => setPickerNacimiento(true)}
            >
              <Text style={fechaNacimiento ? styles.fechaTexto : styles.fechaPlaceholder}>
                {fechaNacimiento || "Seleccionar fecha"}
              </Text>
            </TouchableOpacity>

            {/* Fecha de ingreso */}
            <Text style={styles.label}>Fecha de ingreso*</Text>
            <TouchableOpacity
              style={styles.inputFecha}
              onPress={() => setPickerIngreso(true)}
            >
              <Text style={fechaIngreso ? styles.fechaTexto : styles.fechaPlaceholder}>
                {fechaIngreso || "Seleccionar fecha"}
              </Text>
            </TouchableOpacity>

            {/* Estados */}
            <Text style={styles.label}>Estados*</Text>
            <EstadoSelector
              value={estadoIds}
              onChange={setEstadoIds}
              estados={estados}
              placeholder="Seleccionar estados"
            />

            {/* Voluntarios */}
            <Text style={styles.label}>Voluntarios a cargo</Text>
            <MultiSelector
              value={voluntarioIds}
              onChange={setVoluntarioIds}
              items={voluntariosItems}
              placeholder="Seleccionar voluntarios"
              searchable
            />

            {/* Hogar de tránsito */}
            {tieneTransito && (
              <>
                <Text style={styles.label}>Hogar de tránsito</Text>
                <SingleSelector
                  value={hogarId}
                  onChange={setHogarId}
                  items={hogaresItems}
                  placeholder="Seleccionar hogar de tránsito"
                  searchable
                />
              </>
            )}

            {/* Adoptante */}
            {tieneAdoptado && (
              <>
                <Text style={styles.label}>Adoptante</Text>
                <SingleSelector
                  value={adoptanteId}
                  onChange={setAdoptanteId}
                  items={adoptantesItems}
                  placeholder="Seleccionar adoptante"
                  searchable
                />
              </>
            )}

            {/* Foto */}
            <Text style={styles.label}>Foto</Text>
            <TouchableOpacity style={styles.btnFoto} onPress={() => {}}>
              <Text style={styles.btnFotoTexto}>Subir</Text>
            </TouchableOpacity>
            
            {/* Comportamiento */}
            <Text style={styles.label}>Comportamiento</Text>
            <TextInput
              value={comportamiento}
              onChangeText={setComportamiento}
              style={[styles.input, styles.inputMultiline]}
              placeholder="Comportamiento"
              placeholderTextColor={Colors.textFaint}
              multiline
              numberOfLines={3}
            />
            
            {/* Info adicional */}
            <Text style={styles.label}>Información adicional</Text>
            <TextInput
              value={infoAdicional}
              onChangeText={setInfoAdicional}
              style={[styles.input, styles.inputMultiline]}
              placeholder="Información adicional"
              placeholderTextColor={Colors.textFaint}
              multiline
              numberOfLines={3}
            />

            {/* Compatibilidades */}
            <Text style={styles.label}>Compatibilidades</Text>
            <MultiSelector
              value={compatibilidadIds}
              onChange={setCompatibilidadIds}
              items={compatibilidadesItems}
              placeholder="Seleccionar compatibilidades"
            />

            {/* Esterilizado */}
            <View style={styles.switchRow}>
              <Text style={styles.label}>Esterilizado</Text>
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
                : <Text style={styles.btnCrearTexto}>Crear</Text>
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
        titulo="Fecha de nacimiento"
        fechaSeleccionada={fechaNacimiento}
      />
      <AnimalDatePickerModal
        visible={pickerIngreso}
        onClose={() => setPickerIngreso(false)}
        onSelectDate={(date) => setFechaIngreso(date)}
        titulo="Fecha de ingreso"
        fechaSeleccionada={fechaIngreso}
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
  btnFoto: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 14,
    marginBottom: 16,
  },
  btnFotoTexto: { fontSize: 14, color: Colors.surface, fontWeight: "500" },
  btnCrear: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  btnCrearTexto: { color: Colors.surface, fontWeight: "bold", fontSize: 16 },
});