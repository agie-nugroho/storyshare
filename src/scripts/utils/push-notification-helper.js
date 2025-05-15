class PushNotificationHelper {
  constructor() {
    this.publicVapidKey =
      "BCJx8JCwMtpqAgU9S9gVqMcR1F4vw9cJKdI8Qc5JCF3GhzKd5kGVnJn7KsP9fMg8Fd9G3YnU9RJLRxKoMyqVmJQ";
  }

  async requestPermission() {
    if (!("Notification" in window)) {
      throw new Error("Browser tidak mendukung notifikasi");
    }

    const permission = await Notification.requestPermission();

    if (permission === "denied") {
      throw new Error("Izin notifikasi ditolak");
    }

    return permission === "granted";
  }

  async subscribeUser() {
    try {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service Worker tidak didukung");
      }

      const registration = await navigator.serviceWorker.ready;

      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (existingSubscription) {
        return existingSubscription;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(this.publicVapidKey),
      });

      return subscription;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      throw error;
    }
  }

  async unsubscribeUser() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      throw error;
    }
  }

  urlB64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async showNotification(title, options = {}) {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, options);
      }
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, {
      body: options.body || "Ada konten baru!",
      icon: options.icon || "/images/icons/icon-192x192.png",
      badge: options.badge || "/images/icons/badge-72x72.png",
      vibrate: options.vibrate || [100, 50, 100],
      data: options.data || {},
      ...options,
    });
  }
}

export default PushNotificationHelper;
