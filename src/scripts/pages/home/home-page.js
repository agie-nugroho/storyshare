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
};

export default HomePage;
