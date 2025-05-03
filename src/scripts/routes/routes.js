import HomePage from "../pages/home/home-page.js";
import AboutPage from "../pages/about/about-page.js";
import AddStoryPage from "../pages/add/add-story-page.js";
import LoginPage from "../pages/auth/login-page.js";
import RegisterPage from "../pages/auth/register-page.js";

const routes = {
  "/": HomePage, // beranda
  "/about": AboutPage, // tentang aplikasi
  "/add": AddStoryPage, // tambah cerita
  "/login": LoginPage, // login
  "/register": RegisterPage, // register
};

export default routes;
