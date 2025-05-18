import StoryAPI from "../../data/api.js";
import AuthHelper from "../../utils/auth-helper.js";
import PushNotificationHelper from "../../utils/push-notification-helper.js";

class AddStoryPresenter {
  constructor({ addStoryView }) {
    this._view = addStoryView;
  }

  checkLoginStatus() {
    return AuthHelper.isLoggedIn();
  }

  async addNewStory(storyData) {
    if (!storyData.description.trim()) {
      this._view.showErrorMessage("Silakan masukkan cerita Anda");
      return false;
    }

    if (!storyData.photo) {
      this._view.showErrorMessage("Silakan ambil atau pilih foto");
      return false;
    }

    this._view.setLoading(true);

    try {
      const token = AuthHelper.getToken();
      await StoryAPI.addNewStory(storyData, token);

      // ✅ Tampilkan push notification lokal setelah berhasil
      const pushHelper = new PushNotificationHelper();
      pushHelper.showNotification("Story berhasil dibuat", {
        body: `Anda telah membuat story baru dengan deskripsi: ${storyData.description}`,
      });

      this._view.showSuccessMessage();
      return true;
    } catch (error) {
      console.error(error);
      this._view.showErrorMessage(error.message);
      return false;
    } finally {
      this._view.setLoading(false);
    }
  }

  stopMediaStream(mediaStream) {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
  }
}

export default AddStoryPresenter;
