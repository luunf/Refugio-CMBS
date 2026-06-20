import { useState, useCallback } from 'react';
import { api } from '@/config/api';

export const useTratamientos = () => {
  const [tratamientos, setTratamientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const cargarTratamientos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTratamientos();
      setTratamientos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando tratamientos:', error);
      setError('No se pudieron cargar los tratamientos');
    } finally {
      setLoading(false);
    }
  }, []);

  const crearTratamientoCompleto = useCallback(async (animalId: number, visitaData: any, tratamientoData: any) => {
    try {
      const visita = await api.createVisita(animalId, visitaData);
      await api.createTratamientoEnVisita(visita.id_visita, tratamientoData);
      await cargarTratamientos();
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

  const agendarEnCalendario = useCallback(async (tratamiento: any) => {
    try {
      const nombreTarea = `${tratamiento.tipo} - ${tratamiento.animal_nombre ?? 'animal'}`;
      await api.crearTareasDesdeTratamiento({
        nombre: nombreTarea,
        fecha_inicio: tratamiento.fecha_inicio,
        fecha_fin: tratamiento.fecha_fin,
        descripcion: tratamiento.descripcion,
      });
    } catch (error) {
      console.error('Error agendando tratamiento en calendario:', error);
      throw error;
    }
  }, []);

  return {
    tratamientos,
    loading,
    error,
    cargarTratamientos,
    crearTratamientoCompleto,
    actualizarTratamiento,
    eliminarTratamiento,
    agendarEnCalendario,
    crearTratamiento: crearTratamientoCompleto,
  };
};