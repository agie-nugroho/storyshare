import routes from "../routes/routes.js";
import UrlParser from "../routes/url-parser.js";
import DrawerInitiator from "../utils/drawer-initiator.js";
import AuthHelper from "../utils/auth-helper.js";
import PushNotificationHelper from "../utils/push-notification-helper.js";

class App {
  constructor({ content, hamburgerButton, drawer, authMenu }) {
    this._content = content;
    this._hamburgerButton = hamburgerButton;
    this._drawer = drawer;
    this._authMenu = authMenu;
    this._pushNotificationHelper = new PushNotificationHelper();

    this._initShell();

    if (AuthHelper.isLoggedIn()) {
      this._initPushNotification();
    }
  }

  _initShell() {
    DrawerInitiator.init({
      button: this._hamburgerButton,
      drawer: this._drawer,
      content: this._content,
    });
  }

  async _initPushNotification() {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.log("Browser tidak mendukung push notification");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      console.log("Service worker ready:", registration);

      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        console.log("User sudah subscribe ke push notification");

        try {
          await this._pushNotificationHelper.sendSubscriptionToStoryApi(
            subscription
          );
          console.log("Subscription berhasil dikirim ulang ke server");
        } catch (error) {
          console.warn("Gagal mengirim subscription ke server:", error);

          // Coba subscribe ulang jika gagal
          if (
            error.message.includes("Token") ||
            error.message.includes("Format")
          ) {
            console.log("Mencoba subscribe ulang...");
            await this._autoSubscribeNotification();
          }
        }
      } else {
        console.log("User belum subscribe ke push notification");
        if (Notification.permission === "granted") {
          await this._autoSubscribeNotification();
        }
      }
    } catch (error) {
      console.error("Error inisialisasi push notification:", error);
    }
  }

  // Method untuk auto-subscribe
  async _autoSubscribeNotification() {
    try {
      const permissionGranted =
        await this._pushNotificationHelper.requestPermission();

      if (permissionGranted) {
        const subscription = await this._pushNotificationHelper.subscribeUser();
        console.log("Auto-subscribe berhasil:", subscription);
        return subscription;
      } else {
        console.log("Izin notifikasi tidak diberikan");
      }
    } catch (error) {
      console.error("Error auto-subscribe:", error);
      throw error;
    }
  }

  async renderPage() {
    const url = UrlParser.parseActiveUrlWithCombiner();
    let page = routes[url];

    if (
      (url === "/add" || url.startsWith("/detail")) &&
      !AuthHelper.isLoggedIn()
    ) {
      page = routes["/login"];
    }

    try {
      if ("startViewTransition" in document) {
        await document.startViewTransition(async () => {
          this._content.innerHTML = await page.render();
          await page.afterRender();
        }).finished;
      } else {
        this._content.innerHTML = await page.render();
        await page.afterRender();
      }

      // Jika user baru saja login, inisiasi push notification
      if (url === "/home" && AuthHelper.isLoggedIn()) {
        this._initPushNotification();
      }

      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error rendering page:", error);
      this._content.innerHTML = `
        <div class="error-page">
          <h2>Oops! Terjadi kesalahan</h2>
          <p>${error.message}</p>
          <a href="#/">Kembali ke beranda</a>
        </div>`;
    }
  }
}

export default App;
