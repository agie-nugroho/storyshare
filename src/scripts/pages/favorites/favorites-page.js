import IndexedDBHelper from "../../utils/indexeddb-helper.js";
import { showFormattedDate } from "../../utils/index.js";

const FavoritesPage = {
  async render() {
    return `
      <div class="container">
        <section class="text-center">
          <h2>Story Favorit Anda</h2>
          <p>Cerita yang Anda simpan untuk dibaca kembali nanti</p>
        </section>

        <section class="main-content">
          <div id="favoritesList" class="stories">
            <div class="story-item__loading">
              <span>Memuat cerita favorit...</span>
            </div>
          </div>
        </section>
      </div>
    `;
  },

  async afterRender() {
    const db = new IndexedDBHelper();
    const favorites = await db.getFavoriteStories();
    const favoritesList = document.getElementById("favoritesList");

    if (!favorites || favorites.length === 0) {
      favoritesList.innerHTML = `
        <div class="story-item__not-found text-center">
          <h3>Belum ada cerita favorit</h3>
          <p>Klik ❤️ di cerita untuk menyimpannya ke favorit.</p>
        </div>`;
      return;
    }

    const favoritesHTML = favorites
      .map(
        (story) => `
      <article class="story-item">
        <div class="story-item__header">
          <img class="story-item__header__photo" src="${story.photoUrl}" alt="${
          story.description
        }" />
        </div>
        <div class="story-item__content">
          <h4 class="story-item__title">${story.name || "Anonim"}</h4>
          <div class="story-item__date">
            <i class="fas fa-calendar-alt"></i>
            ${showFormattedDate(story.createdAt, "id-ID")}
          </div>
          <p class="story-item__description">${story.description}</p>
          <button class="btn-remove" data-id="${
            story.id
          }">🗑 Hapus Favorit</button>
        </div>
      </article>
    `
      )
      .join("");

    favoritesList.innerHTML = favoritesHTML;

    const removeButtons = document.querySelectorAll(".btn-remove");
    removeButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        await db.removeFavoriteStory(id);
        alert("Cerita dihapus dari favorit");
        this.afterRender(); // refresh ulang
      });
    });
  },
};

export default FavoritesPage;
