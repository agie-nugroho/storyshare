import StoryAPI from "../../data/api.js";
import AuthHelper from "../../utils/auth-helper.js";

class HomePresenter {
  constructor({ homeView }) {
    this._view = homeView;
  }

  checkLoginStatus() {
    return AuthHelper.isLoggedIn();
  }

  async getStories() {
    if (!this.checkLoginStatus()) {
      return [];
    }

    try {
      const token = AuthHelper.getToken();
      const stories = await StoryAPI.getStoriesWithLocation(token);
      return stories;
    } catch (error) {
      console.error(error);
      this._view.showErrorMessage(error.message);
      return [];
    }
  }
}

export default HomePresenter;
