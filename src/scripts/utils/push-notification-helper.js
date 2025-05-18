import AuthHelper from "./auth-helper.js";

class PushNotificationHelper {
  constructor() {
    this.publicVapidKey =
      "BCJx8JCwMtpqAgU9S9gVqMcR1F4vw9cJKdI8Qc5JCF3GhzKd5kGVnJn7KsP9fMg8Fd9G3YnU9RJLRxKoMyqVmJQ";
    this.apiBaseUrl = "https://story-api.dicoding.dev/v1";
  }

  async requestPermission() {
    if (!("Notification" in window)) {
      console.error("Browser tidak mendukung notifikasi");
      return false;
    }

    const permission = await Notification.requestPermission();
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
        await this.sendSubscriptionToStoryApi(existingSubscription)
          .then(() =>
            console.log(
              "Subscription yang sudah ada berhasil dikirim ke server"
            )
          )
          .catch((error) =>
            console.error("Gagal mengirim subscription yang sudah ada:", error)
          );

        return existingSubscription;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(this.publicVapidKey),
      });

      await this.sendSubscriptionToStoryApi(subscription)
        .then(() => console.log("Subscription baru berhasil dikirim ke server"))
        .catch((error) =>
          console.error("Gagal mengirim subscription baru:", error)
        );

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

  async sendSubscriptionToStoryApi(subscription) {
    try {
      const token = AuthHelper.getToken();

      if (!token) {
        throw new Error("Token autentikasi tidak ditemukan");
      }

      const subscriptionJSON = subscription.toJSON();
      const keys = subscriptionJSON.keys;

      if (!keys || !keys.p256dh || !keys.auth) {
        throw new Error("Format subscription tidak valid");
      }
      const payload = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      };

      console.log("Mengirim subscription ke server:", payload);
      const response = await fetch(
        `${this.apiBaseUrl}/notifications/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        let errorMessage = response.statusText;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
        }
        throw new Error(`Gagal mengirim subscription: ${errorMessage}`);
      }

      const result = await response.json();
      console.log("Subscription berhasil dikirim ke server:", result);
      return result;
    } catch (error) {
      console.error("Error sending subscription to server:", error);
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
      icon: options.icon || "/images/icons/icon_144x144.png",
      badge:
        options.badge || "/images/icons/notification-alert-pngrepo-com.png",
      vibrate: options.vibrate || [100, 50, 100],
      data: options.data || {},
      ...options,
    });
  }
}

export default PushNotificationHelper;
