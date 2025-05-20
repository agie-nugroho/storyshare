class IndexedDBHelper {
  constructor() {
    this.dbName = "StoryShareDB";
    this.dbVersion = 2; // Increased version to handle schema update
    this.storeName = "stories";
    this.notesStoreName = "notes";
    this.favoriteStoreName = "favorites"; // New store for favorite stories
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // tempat story
        if (!db.objectStoreNames.contains(this.storeName)) {
          const storiesStore = db.createObjectStore(this.storeName, {
            keyPath: "id",
          });
          storiesStore.createIndex("createdAt", "createdAt", { unique: false });
        }

        // tempat notes
        if (!db.objectStoreNames.contains(this.notesStoreName)) {
          const notesStore = db.createObjectStore(this.notesStoreName, {
            keyPath: "id",
            autoIncrement: true,
          });
          notesStore.createIndex("title", "title", { unique: false });
          notesStore.createIndex("createdAt", "createdAt", { unique: false });
        }

        // tempat favorites (baru) - untuk menyimpan cerita favorit
        if (!db.objectStoreNames.contains(this.favoriteStoreName)) {
          const favoritesStore = db.createObjectStore(this.favoriteStoreName, {
            keyPath: "id",
          });
          favoritesStore.createIndex("createdAt", "createdAt", {
            unique: false,
          });
          favoritesStore.createIndex("savedAt", "savedAt", { unique: false });
        }
      };
    });
  }

  // manajemen story
  async saveStory(story) {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.put({
        ...story,
        savedAt: new Date().toISOString(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveStories(stories) {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);

    const promises = stories.map(
      (story) =>
        new Promise((resolve, reject) => {
          const request = store.put({
            ...story,
            savedAt: new Date().toISOString(),
          });
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        })
    );

    return Promise.all(promises);
  }

  async getAllStories() {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], "readonly");
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getStoriesWithLocation() {
    const stories = await this.getAllStories();
    return stories.filter((story) => story.lat && story.lon);
  }

  async deleteStory(id) {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // ==== FAVORITE STORIES MANAGEMENT ====

  // Simpan cerita ke favorit
  async saveFavoriteStory(story) {
    const db = await this.openDB();
    const transaction = db.transaction([this.favoriteStoreName], "readwrite");
    const store = transaction.objectStore(this.favoriteStoreName);

    return new Promise((resolve, reject) => {
      const request = store.put({
        ...story,
        isFavorite: true,
        savedAt: new Date().toISOString(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Dapatkan semua cerita favorit
  async getFavoriteStories() {
    const db = await this.openDB();
    const transaction = db.transaction([this.favoriteStoreName], "readonly");
    const store = transaction.objectStore(this.favoriteStoreName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Dapatkan cerita favorit berdasarkan ID
  async getFavoriteStory(id) {
    const db = await this.openDB();
    const transaction = db.transaction([this.favoriteStoreName], "readonly");
    const store = transaction.objectStore(this.favoriteStoreName);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Hapus cerita dari favorit
  async removeFavoriteStory(id) {
    const db = await this.openDB();
    const transaction = db.transaction([this.favoriteStoreName], "readwrite");
    const store = transaction.objectStore(this.favoriteStoreName);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Cek apakah cerita ada di favorit
  async isStoryFavorite(id) {
    const story = await this.getFavoriteStory(id);
    return !!story;
  }

  // ==== NOTE MANAGEMENT ====

  async saveNote(note) {
    const db = await this.openDB();
    const transaction = db.transaction([this.notesStoreName], "readwrite");
    const store = transaction.objectStore(this.notesStoreName);

    return new Promise((resolve, reject) => {
      const request = store.add({
        ...note,
        createdAt: new Date().toISOString(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAllNotes() {
    const db = await this.openDB();
    const transaction = db.transaction([this.notesStoreName], "readonly");
    const store = transaction.objectStore(this.notesStoreName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteNote(id) {
    const db = await this.openDB();
    const transaction = db.transaction([this.notesStoreName], "readwrite");
    const store = transaction.objectStore(this.notesStoreName);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // ==== GENERAL DB MANAGEMENT ====

  async clearAllData() {
    const db = await this.openDB();
    const transaction = db.transaction(
      [this.storeName, this.notesStoreName, this.favoriteStoreName],
      "readwrite"
    );

    const promises = [
      new Promise((resolve, reject) => {
        const request = transaction.objectStore(this.storeName).clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      }),
      new Promise((resolve, reject) => {
        const request = transaction.objectStore(this.notesStoreName).clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      }),
      new Promise((resolve, reject) => {
        const request = transaction.objectStore(this.favoriteStoreName).clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      }),
    ];

    return Promise.all(promises);
  }
}

export default IndexedDBHelper;
