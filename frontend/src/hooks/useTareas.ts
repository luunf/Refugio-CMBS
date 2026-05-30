import { useState, useCallback } from 'react';
import { api } from '@/config/api';

export const useTareas = (mes: number, year: number) => {
  const [tareas, setTareas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const cargarTareas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTareas(mes, year);
      setTareas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
    } finally {
      setLoading(false);
    }
  }, [mes, year]);

  const crearTarea = useCallback(async (nuevaTarea: any) => {
    try {
      await api.createTarea(nuevaTarea);
      await cargarTareas();
    } catch (error) {
      console.error('Error al crear tarea:', error);
      throw error;
    }
  }, [cargarTareas]);

  const actualizarTarea = useCallback(async (id: number, data: any) => {
    try {
      await api.updateTarea(id, data);
      await cargarTareas();
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      throw error;
    }
  }, [cargarTareas]);

  const eliminarTarea = useCallback(async (id: number) => {
    try {
      await api.deleteTarea(id);
      await cargarTareas();
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      throw error;
    }
  }, [cargarTareas]);

  return {
    tareas,
    loading,
    cargarTareas,
    crearTarea,
    actualizarTarea,
    eliminarTarea,
  };
};