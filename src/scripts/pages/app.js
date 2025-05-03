import routes from "../routes/routes.js";
import UrlParser from "../routes/url-parser.js";
import DrawerInitiator from "../utils/drawer-initiator.js";
import AuthHelper from "../utils/auth-helper.js";

class App {
  constructor({ content, hamburgerButton, drawer, authMenu }) {
    this._content = content;
    this._hamburgerButton = hamburgerButton;
    this._drawer = drawer;
    this._authMenu = authMenu;

    this._initShell();
  }

  _initShell() {
    DrawerInitiator.init({
      button: this._hamburgerButton,
      drawer: this._drawer,
      content: this._content,
    });
  }

  async renderPage() {
    const url = UrlParser.parseActiveUrlWithCombiner();
    let page = routes[url];

    if (
      (url === "/add" || url.startsWith("/detail")) &&
      !AuthHelper.isLoggedIn()
    ) {
      page = routes["/login"];
    }

    try {
      if ("startViewTransition" in document) {
        await document.startViewTransition(async () => {
          this._content.innerHTML = await page.render();
          await page.afterRender();
        }).finished;
      } else {
        this._content.innerHTML = await page.render();
        await page.afterRender();
      }

      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error rendering page:", error);
      this._content.innerHTML = `
        <div class="error-page">
          <h2>Oops! Terjadi kesalahan</h2>
          <p>${error.message}</p>
          <a href="#/">Kembali ke beranda</a>
        </div>`;
    }
  }
}

export default App;
