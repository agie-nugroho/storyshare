import HomePage from "../pages/home/home-page.js";
import AboutPage from "../pages/about/about-page.js";
import AddStoryPage from "../pages/add/add-story-page.js";
import LoginPage from "../pages/auth/login-page.js";
import RegisterPage from "../pages/auth/register-page.js";
import NotesPage from "../pages/notes/notes-page.js";
import NotFoundPage from "../pages/not-found-page.js";

const routes = {
  "/": HomePage, // beranda
  "/about": AboutPage, // tentang aplikasi
  "/add": AddStoryPage, // tambah cerita
  "/login": LoginPage, // login
  "/register": RegisterPage, // register
  "/notes": NotesPage, // catatan offline
  "/404": NotFoundPage,
  "*": NotFoundPage,
};

export default routes;
