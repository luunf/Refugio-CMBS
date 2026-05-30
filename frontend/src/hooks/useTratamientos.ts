import { useState, useCallback } from 'react';
import { api } from '@/config/api';

export const useTratamientos = () => {
  const [tratamientos, setTratamientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const cargarTratamientos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTratamientos();
      setTratamientos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando tratamientos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const crearTratamientoCompleto = useCallback(async (animalId: number, visitaData: any, tratamientoData: any) => {
    try {
      // 1. Crear la visita
      const visita = await api.createVisita(animalId, visitaData);
      // 2. Crear el tratamiento asociado a esa visita
      await api.createTratamientoEnVisita(visita.id, tratamientoData);
      await cargarTratamientos(); // recargar lista
    } catch (error) {
      console.error('Error creando tratamiento con visita:', error);
      throw error;
    }
  }, [cargarTratamientos]);

  const actualizarTratamiento = useCallback(async (id: number, data: any) => {
    try {
      await api.updateTratamiento(id, data);
      await cargarTratamientos();
    } catch (error) {
      console.error('Error actualizando tratamiento:', error);
      throw error;
    }
  }, [cargarTratamientos]);

  const eliminarTratamiento = useCallback(async (id: number) => {
    try {
      await api.deleteTratamiento(id);
      await cargarTratamientos();
    } catch (error) {
      console.error('Error eliminando tratamiento:', error);
      throw error;
    }
  }, [cargarTratamientos]);

  return {
    tratamientos,
    loading,
    cargarTratamientos,
    crearTratamientoCompleto,
    actualizarTratamiento,
    eliminarTratamiento,
  };
};