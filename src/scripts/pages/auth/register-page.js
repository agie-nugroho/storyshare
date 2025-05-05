import RegisterPresenter from "./register-presenter.js";
import { createRegisterFormTemplate } from "../templates/template-creator.js";

const RegisterPage = {
  async render() {
    return `
      <section class="content auth-content">
        <h2 class="content__heading">Registrasi</h2>
        <div id="registerContainer"></div>
      </section>
    `;
  },

  async afterRender() {
    this._presenter = new RegisterPresenter({
      registerView: this,
    });

    const container = document.querySelector("#registerContainer");

    if (this._presenter.checkLoginStatus()) {
      container.innerHTML = `
        <div class="auth-message">
          <h3>Anda sudah login</h3>
          <a href="#/" class="btn">Ke Beranda</a>
        </div>
      `;
      return;
    }

    container.innerHTML = createRegisterFormTemplate();
    this._initFormListeners();
  },

  _initFormListeners() {
    const registerForm = document.querySelector("#registerForm");
    if (!registerForm) return;

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = registerForm.name.value;
      const email = registerForm.email.value;
      const password = registerForm.password.value;

      await this._presenter.register(name, email, password);
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
      '#registerForm button[type="submit"]'
    );
    if (!submitButton) return;

    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? "Proses..." : "Daftar";
  },

  showSuccessMessage() {
    const container = document.querySelector("#registerContainer");
    if (!container) return;

    container.innerHTML = `
      <div class="auth-message auth-message--success">
        <h3>Registrasi berhasil!</h3>
        <p>Silakan login dengan akun yang telah dibuat.</p>
        <a href="#/login" class="btn">Login</a>
      </div>
    `;
  },
};

export default RegisterPage;
