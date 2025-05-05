import StoryAPI from "../../data/api.js";
import AuthHelper from "../../utils/auth-helper.js";

class LoginPresenter {
  constructor({ loginView }) {
    this._view = loginView;
  }

  async login(email, password) {
    if (!email || !password) {
      this._view.showErrorMessage("Email dan password harus diisi");
      return;
    }

    this._view.setLoading(true);

    try {
      const { loginResult } = await StoryAPI.login({ email, password });

      AuthHelper.setAuth({
        userId: loginResult.userId,
        name: loginResult.name,
        token: loginResult.token,
      });

      AuthHelper.updateAuthMenu(document.querySelector("#authMenuItem"));

      this._view.redirectToHome();
    } catch (error) {
      console.error("Login error:", error);
      this._view.showErrorMessage(error.message);
    } finally {
      this._view.setLoading(false);
    }
  }

  checkLoginStatus() {
    return AuthHelper.isLoggedIn();
  }
}

export default LoginPresenter;
