import StoryAPI from "../../data/api.js";
import AuthHelper from "../../utils/auth-helper.js";
import IndexedDBHelper from "../../utils/indexeddb-helper.js";
import { showFormattedDate } from "../../utils/index.js";

const HomePage = {
  async render() {
    return `
      <div class="container">
        <section class="hero-section text-center">
          <h2>Welcome to StoryShare</h2>
          <p>Berbagi cerita, berbagi momen berharga</p>
        </section>

        <section class="subscribe-section text-center">
          <button id="subscribePushBtn" class="btn">🔔 Subscribe Notifikasi</button>
        </section>

        <section class="main-content">
          <div class="content__heading">
            <h3>Cerita Terbaru</h3>
          </div>

          <div id="connectionStatus" class="status-indicator"></div>

          <div id="storiesList" class="stories">
            <div class="story-item__loading">
              <span>Memuat cerita...</span>
            </div>
          </div>
        </section>
      </div>
    `;
  },

  async afterRender() {
    await this.renderStories();
    this.setupConnectionCheck();
    this.setupPushButton();
  },

  async renderStories() {
    const storiesList = document.getElementById("storiesList");
    const connectionStatus = document.getElementById("connectionStatus");
    const token = AuthHelper.getToken();
    const dbHelper = new IndexedDBHelper();

    try {
      let stories = [];

      if (navigator.onLine && token) {
        try {
          stories = await StoryAPI.getAllStories(token);
          await dbHelper.saveStories(stories);
          connectionStatus.innerHTML = '<i class="fas fa-wifi"></i> Online';
          connectionStatus.classList.add("online");
        } catch (error) {
          console.warn("Gagal ambil API, ambil dari cache");
          stories = await dbHelper.getAllStories();
          connectionStatus.innerHTML =
            '<i class="fas fa-wifi-slash"></i> Offline (cache)';
          connectionStatus.classList.add("offline");
        }
      } else {
        stories = await dbHelper.getAllStories();
        connectionStatus.innerHTML =
          '<i class="fas fa-wifi-slash"></i> Offline';
        connectionStatus.classList.add("offline");
      }

      if (stories.length === 0) {
        storiesList.innerHTML = `
          <div class="story-item__not-found">
            <h3>Belum Ada Cerita</h3>
            <p>Jadilah yang pertama untuk berbagi cerita!</p>
            <a href="#/add" class="btn">Tambah Cerita</a>
          </div>
        `;
        return;
      }

      const storiesHTML = stories
        .map(
          (story) => `
          <article class="story-item">
            <div class="story-item__header">
              <img class="story-item__header__photo" src="${
                story.photoUrl
              }" alt="${story.description}" />
            </div>
            <div class="story-item__content">
              <h4 class="story-item__title"><a href="#">${
                story.name || "Anonim"
              }</a></h4>
              <div class="story-item__date">
                <i class="fas fa-calendar-alt"></i>
                ${showFormattedDate(story.createdAt, "id-ID")}
              </div>
              <p class="story-item__description">${story.description}</p>
              <button class="btn-fav" data-id="${story.id}" data-name="${
            story.name
          }" data-desc="${story.description}" data-photo="${
            story.photoUrl
          }" data-date="${story.createdAt}">
                ❤️ Simpan Favorit
              </button>
              ${
                story.savedAt
                  ? `<div class="story-badge"><i class="fas fa-download"></i> Offline</div>`
                  : ""
              }
            </div>
          </article>
        `
        )
        .join("");

      storiesList.innerHTML = storiesHTML;

      const favButtons = document.querySelectorAll(".btn-fav");
      favButtons.forEach((btn) => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          const name = btn.dataset.name;
          const description = btn.dataset.desc;
          const photoUrl = btn.dataset.photo;
          const createdAt = btn.dataset.date;

          const db = new IndexedDBHelper();
          const isFav = await db.isStoryFavorite(id);

          if (isFav) {
            await db.removeFavoriteStory(id);
            alert("Dihapus dari Favorit");
          } else {
            await db.saveFavoriteStory({
              id,
              name,
              description,
              photoUrl,
              createdAt,
            });
            alert("Ditambahkan ke Favorit");
          }
        });
      });
    } catch (error) {
      console.error("Error rendering stories:", error);
      storiesList.innerHTML = `
        <div class="story-item__not-found">
          <h3>Gagal Memuat Cerita</h3>
          <p>Silakan coba lagi nanti</p>
          <button onclick="location.reload()" class="btn">Coba Lagi</button>
        </div>
      `;
    }
  },

  setupConnectionCheck() {
    window.addEventListener("online", () => this.renderStories());
    window.addEventListener("offline", () => this.renderStories());
  },

  setupPushButton() {
    const pushBtn = document.getElementById("subscribePushBtn");
    if (!pushBtn || !("Notification" in window)) return;

    navigator.serviceWorker.ready.then(async (registration) => {
      const existingSub = await registration.pushManager.getSubscription();

      // Atur tampilan tombol sesuai status awal
      pushBtn.textContent = existingSub
        ? "🔕 Unsubscribe Notifikasi"
        : "🔔 Subscribe Notifikasi";

      pushBtn.addEventListener("click", async () => {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          alert("Izin notifikasi dibutuhkan.");
          return;
        }

        const currentSub = await registration.pushManager.getSubscription();

        if (currentSub) {
          // Unsubscribe
          await currentSub.unsubscribe();
          alert("Berhasil unsubscribe notifikasi.");
          pushBtn.textContent = "🔔 Subscribe Notifikasi";
          console.log("Unsubscribed:", currentSub.endpoint);
        } else {
          // Subscribe
          const subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r21CnsHmtrx8biyPi_E-1fSGABK_Qs_G1vPoJJqxbk"
            ),
          };

          try {
            const pushSubscription = await registration.pushManager.subscribe(
              subscribeOptions
            );
            alert("Berhasil subscribe notifikasi!");
            pushBtn.textContent = "🔕 Unsubscribe Notifikasi";
            console.log("Push subscription:", JSON.stringify(pushSubscription));
          } catch (err) {
            console.error("Gagal subscribe:", err);
            alert("Gagal melakukan subscribe notifikasi.");
          }
        }
      });
    });

    function urlBase64ToUint8Array(base64String) {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const rawData = atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }
  },
};

export default HomePage;
