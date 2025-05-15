import CONFIG from "../config";

class StoryAPI {
  static async register({ name, email, password }) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const responseJson = await response.json();

      if (!response.ok) {
        throw new Error(
          responseJson.message || "Terjadi kesalahan saat registrasi"
        );
      }

      return responseJson;
    } catch (error) {
      throw new Error(error.message || "Terjadi kesalahan saat registrasi");
    }
  }

  static async login({ email, password }) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await response.json();

      if (!response.ok) {
        throw new Error(responseJson.message || "Gagal login");
      }

      return responseJson;
    } catch (error) {
      throw new Error(error.message || "Gagal login");
    }
  }

  static async getAllStories(token) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseJson = await response.json();

      if (!response.ok) {
        throw new Error(
          responseJson.message || "Gagal mendapatkan daftar cerita"
        );
      }

      return responseJson.listStory;
    } catch (error) {
      throw new Error(error.message || "Gagal mendapatkan daftar cerita");
    }
  }

  static async getStoriesWithLocation(token) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories?location=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseJson = await response.json();

      if (!response.ok) {
        throw new Error(
          responseJson.message ||
            "Gagal mendapatkan daftar cerita dengan lokasi"
        );
      }

      return responseJson.listStory;
    } catch (error) {
      throw new Error(
        error.message || "Gagal mendapatkan daftar cerita dengan lokasi"
      );
    }
  }
  static async compressImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

      
          if (width > 1200) {
            height = Math.round((height * 1200) / width);
            width = 1200;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

        
          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            "image/jpeg",
            0.8
          );
        };
      };
    });
  }

  static async addNewStory({ description, photo, lat, lon }, token) {
    try {
      const formData = new FormData();
      formData.append("description", description);

      // Kompresi gambar sebelum upload
      const compressedPhoto = await this.compressImage(photo);
      formData.append("photo", compressedPhoto, "photo.jpg");

      if (lat && lon) {
        formData.append("lat", lat);
        formData.append("lon", lon);
      }

      const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseJson = await response.json();

      if (!response.ok) {
        throw new Error(responseJson.message || "Gagal menambahkan cerita");
      }

      return responseJson;
    } catch (error) {
      throw new Error(error.message || "Gagal menambahkan cerita");
    }
  }
}

export default StoryAPI;
