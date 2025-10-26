import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notifications', () => {
  // State
  const notifications = ref([]);
  const unreadCount = ref(0);

  // Actions
  async function fetchNotifications() {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      notifications.value = data.notifications || [];
      unreadCount.value = notifications.value.filter(n => !n.read).length;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      notifications.value = [];
      unreadCount.value = 0;
    }
  }

  async function markAsRead() {
    if (unreadCount.value === 0) return;
    
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST'
      });
      notifications.value = notifications.value.map(n => ({ ...n, read: true }));
      unreadCount.value = 0;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead
  };
});