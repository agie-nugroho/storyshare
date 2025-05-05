import LoginPresenter from "./login-presenter.js";
import { createLoginFormTemplate } from "../templates/template-creator.js";

const LoginPage = {
  async render() {
    return `
      <section class="content auth-content">
        <h2 class="content__heading">Login</h2>
        <div id="loginContainer"></div>
      </section>
    `;
  },

  async afterRender() {
    this._presenter = new LoginPresenter({
      loginView: this,
    });

    const container = document.querySelector("#loginContainer");

    if (this._presenter.checkLoginStatus()) {
      container.innerHTML = `
        <div class="auth-message">
          <h3>Anda sudah login</h3>
          <a href="#/" class="btn">Ke Beranda</a>
        </div>
      `;
      return;
    }

    container.innerHTML = createLoginFormTemplate();
    this._initFormListeners();
  },

  _initFormListeners() {
    const loginForm = document.querySelector("#loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;

      await this._presenter.login(email, password);
    });
  },

  showErrorMessage(message) {
    const errorMessage = document.querySelector("#errorMessage");
    if (errorMessage) {
      errorMessage.textContent = message;
    }
  },

  setLoading(isLoading) {
    const submitButton = document.querySelector(
      '#loginForm button[type="submit"]'
    );
    if (!submitButton) return;

    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? "Proses..." : "Login";
  },

  redirectToHome() {
    window.location.hash = "#/";
  },
};

export default LoginPage;
