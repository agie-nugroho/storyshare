import StoryAPI from "../../data/api.js";
import AuthHelper from "../../utils/auth-helper.js";
import { createStoryItemTemplate } from "../templates/template-creator.js";

const HomePage = {
  async render() {
    return `
      <section class="content">
        <h2 class="content__heading">Cerita Terbaru</h2>
        
        <div id="mapContainer" class="map-container">
          <div id="storiesMap" class="stories-map"></div>
        </div>
        
        <div id="stories" class="stories">
          ${
            AuthHelper.isLoggedIn()
              ? ""
              : `
            <div class="story-item story-item__not-found">
              <h3>Anda perlu login untuk melihat cerita</h3>
              <a href="#/login" class="btn">Login</a>
            </div>
          `
          }
        </div>
      </section>
    `;
  },

  async afterRender() {
    const storiesContainer = document.querySelector("#stories");
    const mapContainer = document.querySelector("#mapContainer");
    const map = document.querySelector("#storiesMap");

    if (!AuthHelper.isLoggedIn()) {
      mapContainer.style.display = "none";
      return;
    }

    storiesContainer.innerHTML = `
      <div class="story-item story-item__loading">
        <p>Memuat cerita...</p>
      </div>
    `;

    try {
      const token = AuthHelper.getToken();
      const stories = await StoryAPI.getStoriesWithLocation(token);

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

      this._initMap(map, stories);
    } catch (error) {
      console.error(error);
      storiesContainer.innerHTML = `
        <div class="story-item story-item__not-found">
          <h3>Error: ${error.message}</h3>
        </div>
      `;
      mapContainer.style.display = "none";
    }
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
};

export default HomePage;
