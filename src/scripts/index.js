import "../../src/styles/styles.css";
import App from "./pages/app.js";
import AuthHelper from "./utils/auth-helper.js";

document.addEventListener("DOMContentLoaded", async () => {
  AuthHelper.updateAuthMenu(document.querySelector("#authMenuItem"));

  const app = new App({
    content: document.querySelector("#mainContent"),
    hamburgerButton: document.querySelector("#hamburgerButton"),
    drawer: document.querySelector("#navigationDrawer"),
    authMenu: document.querySelector("#authMenuItem"),
  });

  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});
