// frontend/hooks/useNotifications.ts
//
// Copiá este archivo en:  frontend/hooks/useNotifications.ts

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import {
  registrarParaPushNotifications,
  guardarTokenEnBackend,
  eliminarTokenDelBackend,
} from '../services/notificationService';

/**
 * Hook que inicializa las notificaciones push.
 * Llamalo en _layout.tsx dentro de <AuthProvider>.
 *
 * Requiere que el usuario esté autenticado con Firebase
 * para obtener el ID token y enviarlo al backend.
 *
 * @param autenticado  true cuando el usuario ya inició sesión
 */
export function useNotifications(autenticado: boolean) {
  const tokenGuardado = useRef<string | null>(null);
  const notifListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!autenticado) return;

    let activo = true;

    const init = async () => {
      // 1. Obtener push token del dispositivo
      const pushToken = await registrarParaPushNotifications();
      if (!pushToken || !activo) return;

      tokenGuardado.current = pushToken;

      // 2. Obtener Firebase ID token para autenticar con el backend
      const firebaseUser = getAuth().currentUser;
      if (!firebaseUser) return;

      const idToken = await firebaseUser.getIdToken();

      // 3. Guardar en el backend
      await guardarTokenEnBackend(pushToken, idToken);
    };

    init();

    // Listener: notificación recibida con la app en primer plano
    notifListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(
          '[Notif] Recibida:',
          notification.request.content.title
        );
      }
    );

    // Listener: usuario toca la notificación → navegar a la tarea
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as {
          id_tarea?: number;
          tipo?: string;
        };

        if (data?.id_tarea) {
          // Ajustá la ruta según tu estructura de Expo Router
          // Si tu pantalla de tareas está en (tabs)/calendario:
          router.push('/(tabs)/calendario' as any);
        }
      }
    );

    return () => {
      activo = false;
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [autenticado]);

  /**
   * Llamá esto en tu función de logout para desactivar el token.
   */
  const desregistrarToken = async () => {
    const token = tokenGuardado.current;
    if (!token) return;

    const firebaseUser = getAuth().currentUser;
    if (!firebaseUser) return;

    const idToken = await firebaseUser.getIdToken();
    await eliminarTokenDelBackend(token, idToken);
    tokenGuardado.current = null;
  };

  return { desregistrarToken };
}
