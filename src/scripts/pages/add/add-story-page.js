import StoryAPI from "../../data/api.js";
import AuthHelper from "../../utils/auth-helper.js";
import { createAddStoryFormTemplate } from "../templates/template-creator.js";
import CONFIG from "../../config.js";

const AddStoryPage = {
  async render() {
    return `
      <section class="content">
        <h2 class="content__heading">Tambah Cerita</h2>
        <div id="addStoryContainer">
          ${
            AuthHelper.isLoggedIn()
              ? ""
              : `
            <div class="story-item story-item__not-found">
              <h3>Anda perlu login untuk menambahkan cerita</h3>
              <a href="#/login" class="btn">Login</a>
            </div>
          `
          }
        </div>
      </section>
    `;
  },

  async afterRender() {
    const container = document.querySelector("#addStoryContainer");
    if (!AuthHelper.isLoggedIn()) return;

    container.innerHTML = createAddStoryFormTemplate();

    let mediaStream = null;
    let photoBlob = null;

    const form = document.querySelector("#addStoryForm");
    const cameraPreview = document.querySelector("#cameraPreview");
    const startCameraButton = document.querySelector("#startCamera");
    const takePhotoButton = document.querySelector("#takePhoto");
    const retakePhotoButton = document.querySelector("#retakePhoto");
    const photoCanvas = document.querySelector("#photoCanvas");
    const photoFile = document.querySelector("#photoFile");
    const photoPreview = document.querySelector("#photoPreview");
    const clearLocationButton = document.querySelector("#clearLocation");
    const submitButton = document.querySelector("#submitStory");

    const map = this._initMap();
    let marker = null;
    let selectedLocation = { lat: null, lon: null };

    startCameraButton.addEventListener("click", async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        cameraPreview.srcObject = mediaStream;
        cameraPreview.style.display = "block";
        takePhotoButton.disabled = false;
        startCameraButton.disabled = true;
      } catch (error) {
        console.error("Error accessing camera:", error);
        alert(
          "Tidak dapat mengakses kamera. Silakan gunakan opsi unggah file."
        );
      }
    });

    takePhotoButton.addEventListener("click", () => {
      const context = photoCanvas.getContext("2d");
      photoCanvas.width = cameraPreview.videoWidth;
      photoCanvas.height = cameraPreview.videoHeight;
      context.drawImage(
        cameraPreview,
        0,
        0,
        photoCanvas.width,
        photoCanvas.height
      );

      photoCanvas.toBlob((blob) => {
        photoBlob = blob;
        const photoUrl = URL.createObjectURL(blob);
        photoPreview.innerHTML = `<img src="${photoUrl}" alt="Foto yang diambil">`;

        cameraPreview.style.display = "none";
        photoCanvas.style.display = "block";
        takePhotoButton.style.display = "none";
        retakePhotoButton.style.display = "inline-block";

        if (form.description.value.trim()) submitButton.disabled = false;
      }, "image/jpeg");
    });

    retakePhotoButton.addEventListener("click", () => {
      photoCanvas.style.display = "none";
      cameraPreview.style.display = "block";
      takePhotoButton.style.display = "inline-block";
      retakePhotoButton.style.display = "none";
      photoPreview.innerHTML = "<p>Pratinjau foto akan muncul di sini</p>";
      photoBlob = null;
      submitButton.disabled = true;
    });

    photoFile.addEventListener("change", (event) => {
      if (event.target.files && event.target.files[0]) {
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
          mediaStream = null;
          cameraPreview.style.display = "none";
          takePhotoButton.disabled = true;
          startCameraButton.disabled = false;
        }

        photoBlob = event.target.files[0];
        const photoUrl = URL.createObjectURL(photoBlob);
        photoPreview.innerHTML = `<img src="${photoUrl}" alt="Foto yang dipilih">`;

        if (form.description.value.trim()) submitButton.disabled = false;
      }
    });

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      selectedLocation = { lat, lon: lng };
      document.querySelector("#latitude").value = lat;
      document.querySelector("#longitude").value = lng;
      document.querySelector("#selectedLocation").textContent = `${lat.toFixed(
        6
      )}, ${lng.toFixed(6)}`;
      clearLocationButton.disabled = false;

      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }
    });

    clearLocationButton.addEventListener("click", () => {
      selectedLocation = { lat: null, lon: null };
      document.querySelector("#latitude").value = "";
      document.querySelector("#longitude").value = "";
      document.querySelector("#selectedLocation").textContent = "Belum dipilih";
      clearLocationButton.disabled = true;

      if (marker) {
        map.removeLayer(marker);
        marker = null;
      }
    });

    form.description.addEventListener("input", () => {
      submitButton.disabled = !(form.description.value.trim() && photoBlob);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.description.value.trim()) {
        alert("Silakan masukkan cerita Anda");
        return;
      }

      if (!photoBlob) {
        alert("Silakan ambil atau pilih foto");
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Mengirim...";

      try {
        const token = AuthHelper.getToken();
        const storyData = {
          description: form.description.value,
          photo: photoBlob,
          ...(selectedLocation.lat &&
            selectedLocation.lon && {
              lat: selectedLocation.lat,
              lon: selectedLocation.lon,
            }),
        };

        await StoryAPI.addNewStory(storyData, token);

        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
        }

        alert("Cerita berhasil ditambahkan!");
        window.location.hash = "#/";
      } catch (error) {
        console.error(error);
        document.querySelector("#errorMessage").textContent = error.message;
        submitButton.disabled = false;
        submitButton.textContent = "Kirim Cerita";
      }
    });
  },

  _cleanUp() {
    const cameraPreview = document.querySelector("#cameraPreview");
    if (cameraPreview && cameraPreview.srcObject) {
      const mediaStream = cameraPreview.srcObject;
      mediaStream.getTracks().forEach((track) => track.stop());
    }
  },

  _initMap() {
    const map = L.map("locationMap").setView([-2.5489, 118.0149], 5);
    L.tileLayer(CONFIG.MAP_TILE_URL, {
      attribution: CONFIG.MAP_ATTRIBUTION,
    }).addTo(map);
    return map;
  },
};

export default AddStoryPage;
