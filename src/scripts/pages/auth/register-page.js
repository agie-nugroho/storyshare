import StoryAPI from "../../data/api.js";
import AuthHelper from "../../utils/auth-helper.js";
import { createRegisterFormTemplate } from "../templates/template-creator.js";

const RegisterPage = {
  async render() {
    return `
      <section class="content auth-content">
        <h2 class="content__heading">Registrasi</h2>
        <div id="registerContainer">
          ${
            !AuthHelper.isLoggedIn()
              ? ""
              : `
            <div class="auth-message">
              <h3>Anda sudah login</h3>
              <a href="#/" class="btn">Ke Beranda</a>
            </div>
          `
          }
        </div>
      </section>
    `;
  },

  async afterRender() {
    const container = document.querySelector("#registerContainer");

    if (AuthHelper.isLoggedIn()) {
      return;
    }

    container.innerHTML = createRegisterFormTemplate();

    const registerForm = document.querySelector("#registerForm");
    const errorMessage = document.querySelector("#errorMessage");

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = registerForm.name.value;
      const email = registerForm.email.value;
      const password = registerForm.password.value;

      if (!name || !email || !password) {
        errorMessage.textContent = "Semua field harus diisi";
        return;
      }

      if (password.length < 6) {
        errorMessage.textContent = "Password minimal 6 karakter";
        return;
      }

      try {
        const submitButton = registerForm.querySelector(
          'button[type="submit"]'
        );
        submitButton.disabled = true;
        submitButton.textContent = "Proses...";
        errorMessage.textContent = "";

        await StoryAPI.register({ name, email, password });

        container.innerHTML = `
          <div class="auth-message auth-message--success">
            <h3>Registrasi berhasil!</h3>
            <p>Silakan login dengan akun yang telah dibuat.</p>
            <a href="#/login" class="btn">Login</a>
          </div>
        `;
      } catch (error) {
        console.error(error);
        errorMessage.textContent = error.message;

        const submitButton = registerForm.querySelector(
          'button[type="submit"]'
        );
        submitButton.disabled = false;
        submitButton.textContent = "Daftar";
      }
    });
  },
};

export default RegisterPage;
