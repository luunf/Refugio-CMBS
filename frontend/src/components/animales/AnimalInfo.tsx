import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Colors } from "@/constants/theme";
import { useTranslation } from 'react-i18next';

interface Animal {
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
  compatibilidades: { id_compatibilidad: number; nombre: string }[];
  voluntarios: { id_persona: number; nombre: string; apellido: string }[];
  hogar_transito?: { id_persona: number; nombre: string; apellido: string };
  adoptante?: { id_persona: number; nombre: string; apellido: string };
}

interface Props {
  animal: Animal;
}

function Fila({ label, valor }: { label: string; valor?: string | null }) {
  if (!valor) return null;
  return (
    <View style={styles.fila}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

export default function AnimalInfo({ animal }: Props) {
  const { t } = useTranslation('animales');

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return null;
    const [y, m, d] = fecha.split("-");
    return `${d}/${m}/${y}`;
  };

  const capitalizar = (s?: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : undefined;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Fila label={t('labelTipo')} valor={capitalizar(animal.tipo)} />
        <Fila label={t('labelGenero')} valor={capitalizar(animal.genero)} />
        <Fila label={t('labelTamanio')} valor={capitalizar(animal.tamanio)} />
        <Fila label={t('labelRaza')} valor={animal.raza} />
        <Fila label={t('labelColores')} valor={animal.colores} />
        <Fila label={t('labelFechaNacimiento')} valor={formatearFecha(animal.fecha_nacimiento)} />
        <Fila label={t('labelFechaIngreso')} valor={formatearFecha(animal.fecha_ingreso)} />
        <Fila label={t('labelEsterilizado')} valor={animal.esterilizado ? "Sí" : "No"} />
        <Fila label={t('labelComportamiento')} valor={animal.comportamiento} />
        <Fila label={t('labelInfoAdicional')} valor={animal.info_adicional} />

        {animal.compatibilidades.length > 0 && (
          <View style={styles.fila}>
            <Text style={styles.label}>{t('labelCompatibilidades')}</Text>
            <View style={styles.personasCol}>
            {animal.compatibilidades.map((c) => (
              <Text key={c.id_compatibilidad} style={styles.valor}>
              {c.nombre}
              </Text>
            ))}
            </View>
          </View>
        )}

        {animal.hogar_transito && (
          <Fila
            label={t('labelHogarTransito')}
            valor={`${animal.hogar_transito.nombre} ${animal.hogar_transito.apellido}`}
          />
        )}
        {animal.adoptante && (
          <Fila
            label={t('labelAdoptante')}
            valor={`${animal.adoptante.nombre} ${animal.adoptante.apellido}`}
          />
        )}
        {animal.voluntarios.length > 0 && (
          <View style={styles.fila}>
            <Text style={styles.label}>{t('labelVoluntarios')}</Text>
            <View style={styles.personasCol}>
              {animal.voluntarios.map((v) => (
                <Text key={v.id_persona} style={styles.valor}>
                  {v.nombre} {v.apellido}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  label: { fontSize: 14, color: Colors.textSoft, flex: 1 },
  valor: { fontSize: 14, color: Colors.text, fontWeight: "500", flex: 1, textAlign: "right" },
  badgesRow: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "flex-end" },
  badge: {
    backgroundColor: Colors.primaryFaint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeTexto: { color: Colors.primary, fontSize: 12, fontWeight: "500" },
  personasCol: { flex: 1, alignItems: "flex-end", gap: 4 },
});