import StoryAPI from "../../data/api.js";
import AuthHelper from "../../utils/auth-helper.js";

class RegisterPresenter {
  constructor({ registerView }) {
    this._view = registerView;
  }

  async register(name, email, password) {
    if (!name || !email || !password) {
      this._view.showErrorMessage("Semua field harus diisi");
      return;
    }

    if (password.length < 6) {
      this._view.showErrorMessage("Password minimal 6 karakter");
      return;
    }

    this._view.setLoading(true);

    try {
      await StoryAPI.register({ name, email, password });
      this._view.showSuccessMessage();
    } catch (error) {
      console.error(error);
      this._view.showErrorMessage(error.message);
    } finally {
      this._view.setLoading(false);
    }
  }

  checkLoginStatus() {
    return AuthHelper.isLoggedIn();
  }
}

export default RegisterPresenter;
