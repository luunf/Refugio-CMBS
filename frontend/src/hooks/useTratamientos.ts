import { useState, useCallback } from 'react';
import { api } from '@/config/api';
import { getAuth } from 'firebase/auth';

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
      setError('Error al cargar tratamientos');
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
      throw error;
    }
  }, [cargarTratamientos]);

  const actualizarTratamiento = useCallback(async (id: number, data: any, recargarTareas?: () => Promise<void>) => {
    try {
      await api.updateTratamiento(id, data);
      await cargarTratamientos();
      if (recargarTareas) {
        await recargarTareas();
      }
    } catch (error) {
      throw error;
    }
  }, [cargarTratamientos]);

  const eliminarTratamiento = useCallback(async (id: number) => {
    try {
      await api.deleteTratamiento(id);
      await cargarTratamientos();
    } catch (error) {
      throw error;
    }
  }, [cargarTratamientos]);

  const agendarEnCalendario = useCallback(async (tratamiento: any, recargarTareas?: () => Promise<void>) => {
    try {
      const nombreTarea = `${tratamiento.tipo} - ${tratamiento.animal_nombre ?? 'animal'}`;
      await api.crearTareasDesdeTratamiento({
        nombre: nombreTarea,
        fecha_inicio: tratamiento.fecha_inicio,
        fecha_fin: tratamiento.fecha_fin,
        descripcion: tratamiento.descripcion,
        tratamiento_id: tratamiento.id,
      });

      const firebaseUser = getAuth().currentUser;
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.101:5000';
        
        await fetch(`${API_BASE_URL}/notificaciones/tratamiento-agendado/${tratamiento.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
        });
      }
      
      if (recargarTareas) {
        await recargarTareas();
      }
    } catch (error: any) {
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