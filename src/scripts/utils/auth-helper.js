import CONFIG from "../config";

const AuthHelper = {
  setAuth({ userId, name, token }) {
    const authData = {
      userId,
      name,
      token,
      expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    localStorage.setItem(CONFIG.AUTH_KEY, JSON.stringify(authData));
  },

  getAuth() {
    const authData = localStorage.getItem(CONFIG.AUTH_KEY);
    if (!authData) return null;

    try {
      const parsedAuth = JSON.parse(authData);
      if (parsedAuth.expiry && Date.now() > parsedAuth.expiry) {
        this.clearAuth();
        return null;
      }
      return parsedAuth;
    } catch (error) {
      console.error("Error parsing auth data:", error);
      this.clearAuth();
      return null;
    }
  },

  getToken() {
    const auth = this.getAuth();
    return auth?.token || null;
  },

  getUserName() {
    const auth = this.getAuth();
    return auth?.name || null;
  },

  isLoggedIn() {
    return this.getToken() !== null;
  },

  clearAuth() {
    localStorage.removeItem(CONFIG.AUTH_KEY);
  },

  updateAuthMenu(authMenuItem) {
    if (!authMenuItem) return;

    if (this.isLoggedIn()) {
      const userName = this.getUserName();
      authMenuItem.innerHTML = `
        <li><span class="user-name">Halo, ${userName}</span></li>
        <li><button id="logoutButton" class="logout-button">Logout</button></li>
      `;
      document.getElementById("logoutButton")?.addEventListener("click", () => {
        this.clearAuth();
        window.location.hash = "#/";
        this.updateAuthMenu(authMenuItem);
        window.location.reload();
      });
    } else {
      authMenuItem.innerHTML = `
        <li><a href="#/login">Login</a></li>
        <li><a href="#/register">Register</a></li>
      `;
    }
  },
};

export default AuthHelper;
