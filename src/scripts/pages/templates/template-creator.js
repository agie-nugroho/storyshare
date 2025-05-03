import { showFormattedDate } from "../../utils/index.js";
import CONFIG from "../../config.js";

const createStoryItemTemplate = (story) => {
  return `
    <div class="story-item">
      <div class="story-item__header">
        <img class="story-item__header__photo" src="${story.photoUrl}" alt="${
    story.name
  }'s story">
      </div>
      <div class="story-item__content">
        <h3 class="story-item__title">${story.name}</h3>
        <p class="story-item__date">${showFormattedDate(story.createdAt)}</p>
        <p class="story-item__description">${story.description}</p>
        ${
          story.lat && story.lon
            ? `<div class="story-item__location">
                <i class="fas fa-map-marker-alt"></i>
                <span>Lokasi: ${story.lat.toFixed(6)}, ${story.lon.toFixed(
                6
              )}</span>
              </div>`
            : ""
        }
      </div>
    </div>
  `;
};

const createLoginFormTemplate = () => {
  return `
    <div class="auth-form">
      <form id="loginForm">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" required>
        </div>

        <div class="form-group">
          <button type="submit" class="btn btn-primary">Login</button>
        </div>

        <p id="errorMessage" class="error-message"></p>
      </form>

      <div class="auth-links">
        <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
      </div>
    </div>
  `;
};

const createRegisterFormTemplate = () => {
  return `
    <div class="auth-form">
      <form id="registerForm">
        <div class="form-group">
          <label for="name">Nama</label>
          <input type="text" id="name" name="name" required>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required>
        </div>

        <div class="form-group">
          <label for="password">Password (min. 6 karakter)</label>
          <input type="password" id="password" name="password" minlength="6" required>
        </div>

        <div class="form-group">
          <button type="submit" class="btn btn-primary">Daftar</button>
        </div>

        <p id="errorMessage" class="error-message"></p>
      </form>

      <div class="auth-links">
        <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </div>
    </div>
  `;
};

const createAddStoryFormTemplate = () => {
  return `
    <div class="add-story-form">
      <form id="addStoryForm">
        <div class="form-group">
          <label for="description">Cerita Anda</label>
          <textarea id="description" name="description" rows="5" required></textarea>
        </div>

        <div class="form-group">
          <h3>Foto</h3>
          <div class="camera-container">
            <video id="cameraPreview" style="display: none;" autoplay></video>
            <canvas id="photoCanvas" style="display: none;"></canvas>

            <div class="camera-actions">
              <button type="button" id="startCamera" class="btn btn-secondary">Buka Kamera</button>
              <button type="button" id="takePhoto" class="btn btn-primary" disabled>Ambil Foto</button>
              <button type="button" id="retakePhoto" class="btn btn-secondary" style="display: none;">Ambil Ulang</button>
            </div>

            <div class="upload-alternative">
              <p>atau</p>
              <input type="file" id="photoFile" name="photoFile" accept="image/*">
            </div>

            <div id="photoPreview" class="photo-preview">
              <p>Pratinjau foto akan muncul di sini</p>
            </div>
          </div>
        </div>

        <div class="form-group">
          <h3>Lokasi (opsional)</h3>
          <div id="locationMap" class="location-map"></div>

          <div class="location-info">
            <p>Lokasi terpilih: <span id="selectedLocation">Belum dipilih</span></p>
            <button type="button" id="clearLocation" class="btn btn-secondary" disabled>Hapus Lokasi</button>
          </div>

          <input type="hidden" id="latitude" name="latitude">
          <input type="hidden" id="longitude" name="longitude">
        </div>

        <div class="form-group">
          <button type="submit" id="submitStory" class="btn btn-primary" disabled>Kirim Cerita</button>
        </div>

        <p id="errorMessage" class="error-message"></p>
      </form>
    </div>
  `;
};

export {
  createStoryItemTemplate,
  createLoginFormTemplate,
  createRegisterFormTemplate,
  createAddStoryFormTemplate,
};
