
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';


const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.X:5000';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


export async function configurarCanalAndroid(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tareas', {
      name: 'Tareas del refugio',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
      sound: undefined, // Usar sonido por defecto del sistema
    });
  }
}

export async function registrarParaPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[Notif] Solo funciona en dispositivos físicos.');
    return null;
  }

  const { status: statusActual } = await Notifications.getPermissionsAsync();
  let statusFinal = statusActual;

  if (statusActual !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    statusFinal = status;
  }

  if (statusFinal !== 'granted') {
    console.warn('[Notif] El usuario no concedió permisos de notificaciones.');
    return null;
  }

  await configurarCanalAndroid();

  try {

    const tokenData =
      await Notifications.getExpoPushTokenAsync();

    console.log(
      "TOKEN PUSH:",
      tokenData.data
    );

    return tokenData.data;

  } catch (error) {

    console.error(
      '[Notif] Error obteniendo push token:',
      error
    );

    return null;
  }
}

export async function guardarTokenEnBackend(
  token: string,
  firebaseIdToken: string
): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/notificaciones/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${firebaseIdToken}`,
      },
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    console.error('[Notif] Error guardando token en backend:', error);
  }
}

// ─── Eliminar token al cerrar sesión ─────────────────────────────────────────
export async function eliminarTokenDelBackend(
  token: string,
  firebaseIdToken: string
): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/notificaciones/token`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${firebaseIdToken}`,
      },
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    console.error('[Notif] Error eliminando token:', error);
  }
}

// ─── Notificaciones locales (para el propio dispositivo, inmediatas) ──────────

/**
 * Notificación local inmediata cuando el usuario actual crea una tarea
 * y se la asigna a sí mismo.
 */
export async function notificarTareaAsignadaLocal(
  nombreTarea: string,
  idTarea: number
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📋 Nueva tarea asignada',
      body: `Te asignaron: "${nombreTarea}"`,
      data: { id_tarea: idTarea, tipo: 'TAREA_ASIGNADA' },
      sound: undefined, // Usar sonido por defecto del sistema
    },
    trigger: null, // null = inmediata
  });
}

/**
 * Programa un recordatorio local 24h antes del vencimiento de la tarea.
 * Retorna el identifier para poder cancelarla si la tarea se completa.
 */
export async function programarRecordatorioVencimiento(
  nombreTarea: string,
  idTarea: number,
  fechaVencimiento: Date
): Promise<string | null> {
  const notificarEn = new Date(fechaVencimiento.getTime() - 24 * 60 * 60 * 1000);

  // Si la fecha de notificación ya pasó, no programar
  if (notificarEn < new Date()) {
    return null;
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Tarea por vencer',
      body: `"${nombreTarea}" vence mañana. ¡No te olvides!`,
      data: { id_tarea: idTarea, tipo: 'TAREA_POR_VENCER' },
      sound: undefined, // Usar sonido por defecto del sistema
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notificarEn,
    },
  });

  return identifier;
}

/**
 * Cancela el recordatorio programado de una tarea (ej: cuando se completa).
 */
export async function cancelarRecordatorio(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}
