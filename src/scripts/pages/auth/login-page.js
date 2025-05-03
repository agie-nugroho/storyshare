import StoryAPI from "../../data/api.js";
import AuthHelper from "../../utils/auth-helper.js";
import { createLoginFormTemplate } from "../templates/template-creator.js";

const LoginPage = {
  async render() {
    return `
      <section class="content auth-content">
        <h2 class="content__heading">Login</h2>
        <div id="loginContainer">
          ${
            AuthHelper.isLoggedIn()
              ? `
            <div class="auth-message">
              <h3>Anda sudah login</h3>
              <a href="#/" class="btn">Ke Beranda</a>
            </div>
          `
              : ""
          }
        </div>
      </section>
    `;
  },

  async afterRender() {
    const container = document.querySelector("#loginContainer");

    if (AuthHelper.isLoggedIn()) return;

    container.innerHTML = createLoginFormTemplate();

    const loginForm = document.querySelector("#loginForm");
    const errorMessage = document.querySelector("#errorMessage");

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;

      if (!email || !password) {
        errorMessage.textContent = "Email dan password harus diisi";
        return;
      }

      const submitButton = loginForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = "Proses...";
      errorMessage.textContent = "";

      try {
        const { loginResult } = await StoryAPI.login({ email, password });

        AuthHelper.setAuth({
          userId: loginResult.userId,
          name: loginResult.name,
          token: loginResult.token,
        });

        AuthHelper.updateAuthMenu(document.querySelector("#authMenuItem"));
        window.location.hash = "#/";
      } catch (error) {
        console.error("Login error:", error);
        errorMessage.textContent = error.message;
        submitButton.disabled = false;
        submitButton.textContent = "Login";
      }
    });
  },
};

export default LoginPage;
