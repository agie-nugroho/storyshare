import AddStoryPresenter from "./add-story-presenter.js";
import { createAddStoryFormTemplate } from "../templates/template-creator.js";
import CONFIG from "../../config.js";

const AddStoryPage = {
  async render() {
    return `
      <section class="content">
        <h2 class="content__heading">Tambah Cerita</h2>
        <div id="addStoryContainer"></div>
      </section>
    `;
  },

  async afterRender() {
    this._presenter = new AddStoryPresenter({
      addStoryView: this,
    });

    const container = document.querySelector("#addStoryContainer");

    if (!this._presenter.checkLoginStatus()) {
      container.innerHTML = `
        <div class="story-item story-item__not-found">
          <h3>Anda perlu login untuk menambahkan cerita</h3>
          <a href="#/login" class="btn">Login</a>
        </div>
      `;
      return;
    }

    container.innerHTML = createAddStoryFormTemplate();
    this._initComponents();
  },

  _initComponents() {
    this._mediaStream = null;
    this._photoBlob = null;
    this._marker = null;
    this._selectedLocation = { lat: null, lon: null };
    this._facingMode = "environment"; // Default menggunakan kamera belakang

    this._initFormElements();
    this._initMap();
    this._initEventListeners();
  },

  _initFormElements() {
    this._form = document.querySelector("#addStoryForm");
    this._cameraPreview = document.querySelector("#cameraPreview");
    this._startCameraButton = document.querySelector("#startCamera");
    this._switchCameraButton = document.querySelector("#switchCamera");
    this._takePhotoButton = document.querySelector("#takePhoto");
    this._retakePhotoButton = document.querySelector("#retakePhoto");
    this._photoCanvas = document.querySelector("#photoCanvas");
    this._photoFile = document.querySelector("#photoFile");
    this._photoPreview = document.querySelector("#photoPreview");
    this._clearLocationButton = document.querySelector("#clearLocation");
    this._submitButton = document.querySelector("#submitStory");
  },

  _initMap() {
    this._map = L.map("locationMap").setView([-2.5489, 118.0149], 5);
    L.tileLayer(CONFIG.MAP_TILE_URL, {
      attribution: CONFIG.MAP_ATTRIBUTION,
    }).addTo(this._map);
  },

  _initEventListeners() {
    this._startCameraButton.addEventListener("click", async () => {
      await this._handleStartCamera();
    });

    if (this._switchCameraButton) {
      this._switchCameraButton.addEventListener("click", async () => {
        await this._handleSwitchCamera();
      });
    }

    this._takePhotoButton.addEventListener("click", () => {
      this._handleTakePhoto();
    });

    this._retakePhotoButton.addEventListener("click", () => {
      this._handleRetakePhoto();
    });

    // File upload
    this._photoFile.addEventListener("change", (event) => {
      this._handleFileSelected(event);
    });

    // Map interaction
    this._map.on("click", (e) => {
      this._handleMapClick(e);
    });

    this._clearLocationButton.addEventListener("click", () => {
      this._handleClearLocation();
    });

    // Form input validation
    this._form.description.addEventListener("input", () => {
      this._validateForm();
    });

    // Form submission
    this._form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await this._handleFormSubmit();
    });
  },

  // Deteksi apakah perangkat memiliki kamera depan dan belakang
  async _checkMultipleCameras() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return false;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoCameras = devices.filter(
        (device) => device.kind === "videoinput"
      );
      return videoCameras.length > 1;
    } catch (error) {
      console.error("Error checking cameras:", error);
      return false;
    }
  },

  async _handleStartCamera() {
    try {
      if (this._mediaStream) {
        this._presenter.stopMediaStream(this._mediaStream);
        this._mediaStream = null;
      }

      this._mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this._facingMode,
          aspectRatio: 16 / 9, // Mengatur rasio aspek agar tidak gepeng
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      this._cameraPreview.srcObject = this._mediaStream;
      this._cameraPreview.style.display = "block";
      this._takePhotoButton.disabled = false;
      this._startCameraButton.disabled = true;

      const hasMultipleCameras = await this._checkMultipleCameras();
      this._switchCameraButton.style.display = hasMultipleCameras
        ? "inline-block"
        : "none";
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert(
        "Tidak dapat mengakses kamera. Gunakan unggah file sebagai alternatif."
      );
    }
  },

  async _handleSwitchCamera() {
    // Toggle antara kamera depan dan belakang
    this._facingMode =
      this._facingMode === "environment" ? "user" : "environment";

    // Restart kamera dengan facing mode yang baru
    if (this._mediaStream) {
      this._presenter.stopMediaStream(this._mediaStream);
      this._mediaStream = null;
    }

    try {
      this._mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this._facingMode },
      });

      this._cameraPreview.srcObject = this._mediaStream;
    } catch (error) {
      console.error("Error switching camera:", error);
      alert("Gagal mengganti kamera. Silakan coba lagi.");
    }
  },

  _handleTakePhoto() {
    const context = this._photoCanvas.getContext("2d");
    const width = this._cameraPreview.videoWidth;
    const height = this._cameraPreview.videoHeight;
    const aspectRatio = width / height;

    this._photoCanvas.width = 1280;
    this._photoCanvas.height = 1280 / aspectRatio;

    // Flip gambar secara horizontal jika menggunakan kamera depan (selfie)
    if (this._facingMode === "user") {
      context.scale(-1, 1);
      context.drawImage(
        this._cameraPreview,
        -this._photoCanvas.width,
        0,
        this._photoCanvas.width,
        this._photoCanvas.height
      );
    } else {
      context.drawImage(
        this._cameraPreview,
        0,
        0,
        this._photoCanvas.width,
        this._photoCanvas.height
      );
    }

    this._photoCanvas.toBlob((blob) => {
      this._photoBlob = blob;
      const photoUrl = URL.createObjectURL(blob);
      this._photoPreview.innerHTML = `<img src="${photoUrl}" alt="Foto yang diambil" style="width: 100%; max-width: 800px;">`;

      this._cameraPreview.style.display = "none";
      this._photoCanvas.style.display = "none";
      this._takePhotoButton.style.display = "none";
      this._switchCameraButton.style.display = "none";
      this._retakePhotoButton.style.display = "inline-block";

      this._validateForm();
    }, "image/jpeg");
  },

  _handleRetakePhoto() {
    this._photoCanvas.style.display = "none";
    this._cameraPreview.style.display = "block";
    this._takePhotoButton.style.display = "inline-block";
    this._retakePhotoButton.style.display = "none";

    // Tampilkan kembali tombol switch kamera jika memiliki banyak kamera
    this._checkMultipleCameras().then((hasMultipleCameras) => {
      if (hasMultipleCameras) {
        this._switchCameraButton.style.display = "inline-block";
      }
    });

    this._photoPreview.innerHTML = "<p>Pratinjau foto akan muncul di sini</p>";
    this._photoBlob = null;
    this._submitButton.disabled = true;
  },

  _handleFileSelected(event) {
    if (event.target.files && event.target.files[0]) {
      if (this._mediaStream) {
        this._presenter.stopMediaStream(this._mediaStream);
        this._mediaStream = null;
        this._cameraPreview.style.display = "none";
        this._takePhotoButton.disabled = true;
        this._startCameraButton.disabled = false;
        this._switchCameraButton.style.display = "none";
      }

      this._photoBlob = event.target.files[0];
      const photoUrl = URL.createObjectURL(this._photoBlob);
      this._photoPreview.innerHTML = `<img src="${photoUrl}" alt="Foto yang dipilih">`;

      this._validateForm();
    }
  },

  _handleMapClick(e) {
    const { lat, lng } = e.latlng;
    this._selectedLocation = { lat, lon: lng };
    document.querySelector("#latitude").value = lat;
    document.querySelector("#longitude").value = lng;
    document.querySelector("#selectedLocation").textContent = `${lat.toFixed(
      6
    )}, ${lng.toFixed(6)}`;
    this._clearLocationButton.disabled = false;

    if (this._marker) {
      this._marker.setLatLng([lat, lng]);
    } else {
      this._marker = L.marker([lat, lng]).addTo(this._map);
    }
  },

  _handleClearLocation() {
    this._selectedLocation = { lat: null, lon: null };
    document.querySelector("#latitude").value = "";
    document.querySelector("#longitude").value = "";
    document.querySelector("#selectedLocation").textContent = "Belum dipilih";
    this._clearLocationButton.disabled = true;

    if (this._marker) {
      this._map.removeLayer(this._marker);
      this._marker = null;
    }
  },

  _validateForm() {
    this._submitButton.disabled = !(
      this._form.description.value.trim() && this._photoBlob
    );
  },

  async _handleFormSubmit() {
    const storyData = {
      description: this._form.description.value,
      photo: this._photoBlob,
      ...(this._selectedLocation.lat &&
        this._selectedLocation.lon && {
          lat: this._selectedLocation.lat,
          lon: this._selectedLocation.lon,
        }),
    };

    const success = await this._presenter.addNewStory(storyData);

    if (success) {
      if (this._mediaStream) {
        this._presenter.stopMediaStream(this._mediaStream);
      }
    }
  },

  setLoading(isLoading) {
    if (this._submitButton) {
      this._submitButton.disabled = isLoading;
      this._submitButton.textContent = isLoading
        ? "Mengirim..."
        : "Kirim Cerita";
    }
  },

  showErrorMessage(message) {
    const errorMessage = document.querySelector("#errorMessage");
    if (errorMessage) {
      errorMessage.textContent = message;
    }
  },

  showSuccessMessage() {
    alert("Cerita berhasil ditambahkan!");
    window.location.hash = "#/";
  },
  _cleanUp() {
    if (this._mediaStream) {
      this._presenter.stopMediaStream(this._mediaStream);
    }
  },
};

export default AddStoryPage;
