// src/utils/notifications.jsx

import toast from 'react-hot-toast';

const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    const renderChime = () => {
      try {
        if (ctx.state === 'closed') return;

        // Premier bip (C5)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
        gain1.gain.setValueAtTime(0.15, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        // Deuxième bip (E5)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
        gain2.gain.setValueAtTime(0, ctx.currentTime);
        gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        // Troisième bip (G5)
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24);
        gain3.gain.setValueAtTime(0, ctx.currentTime);
        gain3.gain.setValueAtTime(0.15, ctx.currentTime + 0.24);
        gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.3);
        
        osc2.start(ctx.currentTime + 0.12);
        osc2.stop(ctx.currentTime + 0.4);

        osc3.start(ctx.currentTime + 0.24);
        osc3.stop(ctx.currentTime + 0.6);

        // Close context after playback completes to prevent hardware context leaks
        setTimeout(() => {
          try {
            if (ctx.state !== 'closed') {
              ctx.close().catch(() => {});
            }
          } catch (e) {}
        }, 1000);
      } catch (err) {
        console.warn('Audio chime rendering trapped safely:', err);
      }
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        renderChime();
      }).catch((err) => {
        // Autoplay policy prevented playback until user interaction - safely trapped
        console.warn('AudioContext resume blocked by browser autoplay policy:', err);
      });
    } else {
      renderChime();
    }
  } catch (error) {
    // Autoplay restriction or AudioContext initialization failure trapped safely
    console.warn('Audio notification autoplay exception caught safely:', error);
  }
};

export const notify = {
  // إشعار نجاح
  success: (message) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
    });
  },

  // إشعار خطأ
  error: (message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
    });
  },

  // إشعار معلومات
  info: (message) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
    });
  },

  // إشعار تحذير
  warning: (message) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
    });
  },

  // إشعار طلب جديد
  newOrder: (orderNumber) => {
    playNotificationSound();
    toast.success(`Nouvelle commande #${orderNumber}`, {
      duration: 5000,
      position: 'top-right',
      icon: '🆕',
    });
  },

  // إشعار تحديث طلب
  orderUpdated: (orderNumber, status) => {
    toast(`Commande #${orderNumber} mise à jour: ${status}`, {
      duration: 4000,
      position: 'top-right',
      icon: '📦',
    });
  },

  // إشعار livreur assigné
  delivererAssigned: (orderNumber, delivererName) => {
    toast.success(`Livreur ${delivererName} assigné à la commande #${orderNumber}`, {
      duration: 4000,
      position: 'top-right',
    });
  },

  // إشعار loading
  loading: (message) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  },

  // إغلاق إشعار
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },
};

export default notify;
