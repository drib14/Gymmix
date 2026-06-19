import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';
import useToastStore from '../store/toastStore';

let socket = null;

const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const toast = useToastStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      if (socket) {
        socket.disconnect();
        socket = null;
        initialized.current = false;
      }
      return;
    }

    if (initialized.current) return;

    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      socket.emit('join', user._id);
      initialized.current = true;
    });

    socket.on('notification', (notification) => {
      addNotification(notification);
      toast.info(notification.message, notification.title);
    });

    socket.on('disconnect', () => {
      initialized.current = false;
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
        initialized.current = false;
      }
    };
  }, [isAuthenticated, user?._id]);

  return socket;
};

export default useSocket;
