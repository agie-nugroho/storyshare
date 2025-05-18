import "../../src/styles/styles.css";
import App from "./pages/app.js";
import AuthHelper from "./utils/auth-helper.js";
import PushNotificationHelper from "./utils/push-notification-helper.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Create container di luar mainContent agar tidak tertimpa
  let notifPromptContainer = document.getElementById(
    "notificationPromptContainer"
  );
  if (!notifPromptContainer) {
    notifPromptContainer = document.createElement("div");
    notifPromptContainer.id = "notificationPromptContainer";
    document.body.insertBefore(
      notifPromptContainer,
      document.getElementById("mainContent")
    );
  }

  // Register service worker
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered successfully");

      // Setup push notifications if user is logged in
      if (AuthHelper.isLoggedIn()) {
        const pushNotification = new PushNotificationHelper();

        try {
          const permission = Notification.permission;

          if (permission === "denied") {
            console.log("Notifikasi diblokir.");
            notifPromptContainer.innerHTML = `
              <div class="notification-info">
                <p>Notifikasi diblokir. Aktifkan di pengaturan browser untuk mendapatkan update terbaru.</p>
                <button id="notifSettingsBtn">Buka Pengaturan</button>
              </div>
            `;

            document
              .getElementById("notifSettingsBtn")
              .addEventListener("click", () => {
                alert(
                  "Buka pengaturan browser untuk mengizinkan notifikasi untuk situs ini."
                );
              });
          } else if (permission === "default") {
            console.warn("User belum memberikan izin notifikasi (default).");
            notifPromptContainer.innerHTML = `
              <div class="notification-info">
                <p>Anda belum mengaktifkan notifikasi. Klik tombol di bawah untuk mengaktifkan.</p>
                <button id="enableNotifBtn">Aktifkan Notifikasi</button>
              </div>
            `;

            document
              .getElementById("enableNotifBtn")
              .addEventListener("click", async () => {
                try {
                  const result = await Notification.requestPermission();
                  if (result === "granted") {
                    const subscription = await pushNotification.subscribeUser();
                    console.log("Berhasil subscribe:", subscription);
                    notifPromptContainer.innerHTML = ""; // Hapus prompt
                    alert("Notifikasi berhasil diaktifkan!");
                  } else {
                    alert("Izin tidak diberikan.");
                  }
                } catch (error) {
                  console.error("Error saat aktivasi notifikasi:", error);
                  alert("Gagal mengaktifkan notifikasi: " + error.message);
                }
              });
          } else if (permission === "granted") {
            try {
              // Jika sudah granted, coba langsung subscribe dan kirim ke server
              const subscription = await pushNotification.subscribeUser();
              console.log(
                "User sudah subscribe dengan subscription:",
                subscription
              );

              // Tunjukkan notifikasi sukses
              pushNotification.showNotification("StoryShare", {
                body: "Push notification berhasil diaktifkan!",
              });
            } catch (error) {
              console.error("Error pada setup notifikasi:", error);
              notifPromptContainer.innerHTML = `
                <div class="notification-info">
                  <p>Gagal mengaktifkan notifikasi: ${error.message}</p>
                  <button id="retryNotifBtn">Coba Lagi</button>
                </div>
              `;

              document
                .getElementById("retryNotifBtn")
                .addEventListener("click", async () => {
                  try {
                    await pushNotification.subscribeUser();
                    notifPromptContainer.innerHTML = ""; // Hapus prompt
                    alert("Notifikasi berhasil diaktifkan!");
                  } catch (retryError) {
                    alert(
                      "Gagal mengaktifkan notifikasi: " + retryError.message
                    );
                  }
                });
            }
          }
        } catch (error) {
          console.log("Push notification setup failed:", error);
          notifPromptContainer.innerHTML = `
            <div class="notification-info">
              <p>Gagal mengaktifkan notifikasi: ${error.message}</p>
              <button id="retryNotifBtn">Coba Lagi</button>
            </div>
          `;

          document
            .getElementById("retryNotifBtn")
            .addEventListener("click", async () => {
              window.location.reload();
            });
        }
      }
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }

  // Update UI menu & render konten
  AuthHelper.updateAuthMenu(document.querySelector("#authMenuItem"));

  const app = new App({
    content: document.querySelector("#mainContent"),
    hamburgerButton: document.querySelector("#hamburgerButton"),
    drawer: document.querySelector("#navigationDrawer"),
    authMenu: document.querySelector("#authMenuItem"),
  });

  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});
