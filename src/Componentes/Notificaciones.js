import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

const Notificaciones = () => {
  useEffect(() => {
    const initNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      // Notif inmediata de bienvenida
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '¡Bienvenido!',
          body: 'Compra mas, Ahorra menos!',
          sound: true,
        },
        trigger: null,
      });

      // Mensajes random molesto cada 5 mins
      const mensajesMolestos = [
        '¡No olvides esa oferta! Se acaba pronto...',
        '¡Compra ya o te arrepentirás! Productos volando...',
        '¡Hey, revisa las ofertas! Tu carrito te espera!',
        '¡Alerta! Descuentos limitados, no seas lento!',
        '¡Vamos, compra algo! La app se aburre sin ti...',
      ];
      const mensajeRandom = mensajesMolestos[Math.floor(Math.random() * mensajesMolestos.length)];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '¡Recordatorio!',
          body: mensajeRandom,
          sound: true,
          priority: 'high',  // Para que sea "molesto" (vibra/sonido)
        },
        trigger: { minutes: 1 },  // Cada 5 mins
        repeats: true,  // Repite indefinidamente
      });
    };
    initNotifications();
  }, []);

  return null;
};

export default Notificaciones;