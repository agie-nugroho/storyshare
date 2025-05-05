import HomePresenter from "./home-presenter.js";
import { createStoryItemTemplate } from "../templates/template-creator.js";

const HomePage = {
  async render() {
    return `
      <section class="content">
        <h2 class="content__heading">Cerita Terbaru</h2>
        
        <div id="mapContainer" class="map-container">
          <div id="storiesMap" class="stories-map"></div>
        </div>
        
        <div id="stories" class="stories"></div>
      </section>
    `;
  },

  async afterRender() {
    this._presenter = new HomePresenter({
      homeView: this,
    });

    const storiesContainer = document.querySelector("#stories");
    const mapContainer = document.querySelector("#mapContainer");

    if (!this._presenter.checkLoginStatus()) {
      mapContainer.style.display = "none";
      storiesContainer.innerHTML = `
        <div class="story-item story-item__not-found">
          <h3>Anda perlu login untuk melihat cerita</h3>
          <a href="#/login" class="btn">Login</a>
        </div>
      `;
      return;
    }

    await this._loadStories(storiesContainer, mapContainer);
  },

  async _loadStories(storiesContainer, mapContainer) {
    storiesContainer.innerHTML = `
      <div class="story-item story-item__loading">
        <p>Memuat cerita...</p>
      </div>
    `;

    const stories = await this._presenter.getStories();

    if (stories.length === 0) {
      storiesContainer.innerHTML = `
        <div class="story-item story-item__not-found">
          <h3>Tidak ada cerita</h3>
        </div>
      `;
      mapContainer.style.display = "none";
      return;
    }

    storiesContainer.innerHTML = "";
    stories.forEach((story) => {
      storiesContainer.innerHTML += createStoryItemTemplate(story);
    });

    this._initMap(document.querySelector("#storiesMap"), stories);
  },

  _initMap(mapElement, stories) {
    const storyMap = L.map(mapElement).setView([-2.5489, 118.0149], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(storyMap);

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(storyMap);

        marker.bindPopup(`
          <div class="map-popup">
            <img src="${story.photoUrl}" alt="${
          story.name
        }" class="map-popup__img">
            <h4>${story.name}</h4>
            <p>${story.description.substring(0, 100)}${
          story.description.length > 100 ? "..." : ""
        }</p>
            <a href="#/detail/${
              story.id
            }" class="map-popup__link">Baca selengkapnya</a>
          </div>
        `);
      }
    });
  },

  showErrorMessage(message) {
    const storiesContainer = document.querySelector("#stories");
    const mapContainer = document.querySelector("#mapContainer");

    if (storiesContainer) {
      storiesContainer.innerHTML = `
        <div class="story-item story-item__not-found">
          <h3>Error: ${message}</h3>
        </div>
      `;
    }

    if (mapContainer) {
      mapContainer.style.display = "none";
    }
  },
};

export default HomePage;
