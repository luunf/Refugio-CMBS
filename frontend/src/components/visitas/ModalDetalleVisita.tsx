import React, { useEffect, useState } from "react";
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert
} from "react-native";
import { api } from "@/config/api";
import { Colors } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import ModalEditarVisita from '@/components/visitas/ModalEditarVisita';
import { useTranslation } from 'react-i18next';

interface Tratamiento {
  id_tratamiento: number;
  tipo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  frecuencia_horas: number | null;
  hora_administracion: string | null;
}

interface DetalleVisita {
  id_visita: number;
  fecha: string;
  hora?: string | null;
  estado: string;
  procedimiento: string;
  info_adicional: string | null;
  costo: number | null;
  veterinario: {
    id_persona: number;
    nombre: string;
    apellido: string;
  };
  tratamientos: Tratamiento[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  visitaId: number | null;
  onActualizada: () => void;
  onEliminada: () => void;
}

function formatFecha(fechaStr: string): string {
  if (!fechaStr) return "—";
  const [year, month, day] = fechaStr.split("-");
  return `${parseInt(day)}/${parseInt(month)}/${year}`;
}

function getEstadoLabel(estado: string): string {
  if (estado === "proxima")   return "Próxima";
  if (estado === "realizada") return "Realizada";
  return estado;
}

function esVencido(fechaFin: string | null): boolean {
  if (!fechaFin) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fechaFin + 'T00:00:00');
  return fin < hoy;
}

export default function ModalDetalleVisita({ visible, onClose, visitaId, onActualizada, onEliminada }: Props) {
  const { t } = useTranslation('visitas');
  
  const [visita, setVisita]   = useState<DetalleVisita | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);

  useEffect(() => {
    if (visible && visitaId !== null) cargarDetalle();
    if (!visible) setVisita(null);
  }, [visible, visitaId]);

  const cargarDetalle = async () => {
    setLoading(true);
    try {
      const data = await api.getVisita(visitaId!);
      setVisita(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = () => {
    Alert.alert(
        t('confirmTitleEliminar'),
        t('confirmMessageEliminar'),
        [
        { text: t('btnCancelar'), style: "cancel" },
        { text: t('btnEliminar'), style: "destructive",
            onPress: async () => {
            try {
                await api.deleteVisita(visitaId!);
                onEliminada();
                onClose();
                Alert.alert(t("success"), t("successEliminar"));
            } catch (e: any) {
                Alert.alert(t('error'), e?.response?.data?.error ?? t('errorEliminar'));
            }
            },
        },
        ]
    );
    };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>

          <View style={styles.header}>
            <Text style={styles.titulo}>{t('titleVisita')}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <TouchableOpacity onPress={() => setModalEditar(true)}>
                <MaterialIcons name="edit" size={20} color={Colors.primary}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEliminar}>
                <MaterialIcons name="delete-outline" size={20} color={Colors.delete}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose}>
                <Text style={styles.cerrar}>✕</Text>
                </TouchableOpacity>
            </View>
          </View>

          {loading || !visita ? (
            <ActivityIndicator
              size="large"
              color={Colors.primary}
              style={{ marginVertical: 48 }}
            />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Visita */}
              <View style={styles.seccionCard}>

                <View style={styles.fila}>
                  <Text style={styles.filaLabel}>{t('labelProcedimiento')}</Text>
                  <Text style={styles.filaValor}>{visita.procedimiento}</Text>
                </View>

                <View style={styles.separador} />

                <View style={styles.fila}>
                  <Text style={styles.filaLabel}>{t('labelFecha')}</Text>
                  <Text style={styles.filaValor}>{formatFecha(visita.fecha)}</Text>
                </View>

                <View style={styles.separador} />

                {visita.hora && (
                  <>
                    <View style={styles.fila}>
                      <Text style={styles.filaLabel}>{t('labelHora')}</Text>
                      <Text style={styles.filaValor}>{visita.hora}</Text>
                    </View>
                  </>
                )}

                <View style={styles.separador} />

                <View style={styles.fila}>
                  <Text style={styles.filaLabel}>{t('labelEstado')}</Text>
                  <View style={[
                    styles.estadoBadge,
                    visita.estado === "proxima" ? styles.badgeProxima : styles.badgeRealizada,
                  ]}>
                    <Text style={[
                      styles.estadoTexto,
                      visita.estado === "proxima" ? styles.badgeProximaTexto : styles.badgeRealizadaTexto,
                    ]}>
                      {getEstadoLabel(visita.estado)}
                    </Text>
                  </View>
                </View>

                <View style={styles.separador} />

                <View style={styles.fila}>
                  <Text style={styles.filaLabel}>{t('labelVeterinario')}</Text>
                  <Text style={styles.filaValor}>
                    {visita.veterinario.nombre} {visita.veterinario.apellido}
                  </Text>
                </View>

                {visita.costo !== null && visita.costo !== undefined && (
                  <>
                    <View style={styles.separador} />
                    <View style={styles.fila}>
                      <Text style={styles.filaLabel}>{t('labelCosto')}</Text>
                      <Text style={styles.filaValor}>
                        ${visita.costo.toLocaleString("es-AR")}
                      </Text>
                    </View>
                  </>
                )}

                {visita.info_adicional ? (
                  <>
                    <View style={styles.separador} />
                    <View style={styles.fila}>
                      <Text style={styles.filaLabel}>{t('labelInfoAdicional')}</Text>
                      <Text style={styles.filaValor}>{visita.info_adicional}</Text>
                    </View>
                  </>
                ) : null}

              </View>

              {/* Tratamientos */}
              <Text style={styles.seccionTitulo}>{t('titleTratamientos')}</Text>

              {visita.tratamientos.length === 0 ? (
                <Text style={styles.sinTratamientos}>{t('sinTratamientos')}</Text>
              ) : (
                visita.tratamientos.map((t) => (
                  <TratamientoCard key={t.id_tratamiento} tratamiento={t} />
                ))
              )}

            </ScrollView>
          )} 

          {visita && (
            <ModalEditarVisita
              visible={modalEditar}
              onClose={() => setModalEditar(false)}
              onEditada={() => {
                setModalEditar(false);
                cargarDetalle();
                onActualizada();
              }}
              visita={visita}
            />
          )} 
        </View>
      </View>
    </Modal>
  );
}

function TratamientoCard({ tratamiento }: { tratamiento: Tratamiento }) {
  const { t } = useTranslation('visitas');
  const vencido = esVencido(tratamiento.fecha_fin);
  return (
    <View style={[tratStyles.container, vencido && tratStyles.containerVencido]}>

      {vencido && (
        <Text style={tratStyles.etiquetaVencido}>{t('labelVencido')}</Text>
      )}

      <View style={tratStyles.fila}>
        <Text style={[tratStyles.label, vencido && tratStyles.textoVencido]}>{t('labelTipo2')}</Text>
        <View style={[tratStyles.badge, vencido && tratStyles.badgeVencido]}>
          <Text style={[tratStyles.badgeText, vencido && tratStyles.badgeTextVencido]}>{tratamiento.tipo}</Text>
        </View>
      </View>

      <View style={tratStyles.fila}>
        <Text style={[tratStyles.label, vencido && tratStyles.textoVencido]}>{t('labelFechaInicio2')}</Text>
        <View style={[tratStyles.badge, vencido && tratStyles.badgeVencido]}>
          <Text style={[tratStyles.badgeText, vencido && tratStyles.badgeTextVencido]}>{formatFecha(tratamiento.fecha_inicio)}</Text>
        </View>
      </View>

      <View style={tratStyles.fila}>
        <Text style={[tratStyles.label, vencido && tratStyles.textoVencido]}>{t('labelFechaFin2')}</Text>
        <View style={[tratStyles.badge, vencido && tratStyles.badgeVencido]}>
          <Text style={[tratStyles.badgeText, vencido && tratStyles.badgeTextVencido]}>
            {tratamiento.fecha_fin ? formatFecha(tratamiento.fecha_fin) : "—"}
          </Text>
        </View>
      </View>

      {tratamiento.frecuencia_horas && (
        <View style={tratStyles.fila}>
          <Text style={[tratStyles.label, vencido && tratStyles.textoVencido]}>{t('labelFrecuencia2')}</Text>
          <View style={[tratStyles.badge, vencido && tratStyles.badgeVencido]}>
            <Text style={[tratStyles.badgeText, vencido && tratStyles.badgeTextVencido]}>
              Cada {tratamiento.frecuencia_horas} hs
            </Text>
          </View>
        </View>
      )}

      {tratamiento.hora_administracion && (
        <View style={tratStyles.fila}>
          <Text style={[tratStyles.label, vencido && tratStyles.textoVencido]}>{t('labelPrimeraDosis2')}</Text>
          <View style={[tratStyles.badge, vencido && tratStyles.badgeVencido]}>
            <Text style={[tratStyles.badgeText, vencido && tratStyles.badgeTextVencido]}>
              {tratamiento.hora_administracion}
            </Text>
          </View>
        </View>
      )}

      {tratamiento.descripcion ? (
        <View style={tratStyles.fila}>
          <Text style={[tratStyles.label, vencido && tratStyles.textoVencido]}>{t('labelDescripcion2')}</Text>
          <View style={[tratStyles.badge, tratStyles.badgeWide, vencido && tratStyles.badgeVencido]}>
            <Text style={[tratStyles.badgeText, vencido && tratStyles.badgeTextVencido]}>{tratamiento.descripcion}</Text>
          </View>
        </View>
      ) : null}

    </View>  
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container: {
    backgroundColor: Colors.background,
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
  seccionTitulo: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  seccionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
  },
  filaLabel: {
    fontSize: 14,
    color: Colors.textSoft,
  },
  filaValor: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  separador: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeProxima: { backgroundColor: Colors.primaryLight },
  badgeRealizada: { backgroundColor: Colors.border },
  estadoTexto: { fontSize: 13, fontWeight: "600" },
  badgeProximaTexto: { color: Colors.primary },
  badgeRealizadaTexto: { color: Colors.textMuted },
  sinTratamientos: {
    color: Colors.textFaint,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 16,
  },
});

const tratStyles = StyleSheet.create({
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
  etiquetaVencido: {
    color: Colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  textoVencido: { color: Colors.textFaint },
  fila: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    flexWrap: "wrap",
    gap: 6,
  },
  label: {
    fontWeight: "700",
    color: Colors.textSoft,
    fontSize: 14,
    marginTop: 3,
  },
  badge: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flex:1,
  },
  badgeVencido: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  badgeWide:  { borderRadius: 10, flex: 1 },
  badgeText: { color: Colors.primary, fontSize: 13 },
  badgeTextVencido: { color: Colors.textMuted },
});
