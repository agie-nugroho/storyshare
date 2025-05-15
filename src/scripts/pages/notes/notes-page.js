import IndexedDBHelper from "../../utils/indexeddb-helper";

class NotesPage {
  constructor() {
    this.dbHelper = new IndexedDBHelper();
    this.currentNote = null;
    this.isEditing = false;
  }

  async init() {
    // Initialize the page
    this.setupEventListeners();
    await this.loadNotes();
    this.showOfflineStoriesCount();
  }

  setupEventListeners() {
    // Setup form submission
    const noteForm = document.getElementById("noteForm");
    if (noteForm) {
      noteForm.addEventListener("submit", (e) => this.handleFormSubmit(e));
    }

    // Setup new note button
    const newNoteBtn = document.getElementById("newNoteBtn");
    if (newNoteBtn) {
      newNoteBtn.addEventListener("click", (e) => this.clearForm(e));
    }

    // Setup save stories button
    const saveStoriesBtn = document.getElementById("saveStoriesButton");
    if (saveStoriesBtn) {
      saveStoriesBtn.addEventListener("click", () => this.saveStoriesOffline());
    }

    // Setup cancel button
    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.clearForm());
    }
  }

  async handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const noteData = {
      title: formData.get("title"),
      body: formData.get("body"),
      timestamp: new Date(),
    };

    try {
      if (this.isEditing && this.currentNote) {
        noteData.id = this.currentNote.id;
        await this.dbHelper.updateNote(noteData);
        this.showNotification("Catatan berhasil diperbarui!", "success");
      } else {
        await this.dbHelper.addNote(noteData);
        this.showNotification("Catatan berhasil ditambahkan!", "success");
      }

      this.clearForm();
      await this.loadNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      this.showNotification("Gagal menyimpan catatan", "error");
    }
  }

  clearForm() {
    const form = document.getElementById("noteForm");
    if (form) {
      form.reset();
      this.currentNote = null;
      this.isEditing = false;

      // Update button text
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Simpan';
      }
    }
  }

  async editNote(id) {
    try {
      const note = await this.dbHelper.getNote(id);
      if (note) {
        this.currentNote = note;
        this.isEditing = true;

        // Fill form with note data
        document.getElementById("title").value = note.title;
        document.getElementById("body").value = note.body;

        // Update button text
        const submitBtn = document.querySelector(
          '#noteForm button[type="submit"]'
        );
        if (submitBtn) {
          submitBtn.innerHTML = '<i class="fas fa-save"></i> Perbarui';
        }

        // Scroll to form
        document
          .getElementById("noteForm")
          .scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error editing note:", error);
      this.showNotification("Gagal memuat catatan", "error");
    }
  }

  async loadNotes() {
    const notesList = document.getElementById("notesList");
    const loading = document.getElementById("notesLoading");

    try {
      loading.style.display = "block";
      notesList.innerHTML = "";

      const notes = await this.dbHelper.getAllNotes();
      loading.style.display = "none";

      if (notes.length === 0) {
        notesList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-sticky-note"></i>
                        <p>Belum ada catatan. Tambahkan catatan pertama Anda!</p>
                    </div>
                `;
        return;
      }

      // Sort notes by timestamp (newest first)
      notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Create note cards
      notes.forEach((note) => {
        const noteCard = document.createElement("div");
        noteCard.className = "note-card";
        noteCard.innerHTML = `
                    <div class="note-header">
                        <h3>${this.escapeHtml(note.title)}</h3>
                        <div class="note-actions">
                            <button class="btn-edit" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-delete" title="Hapus">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="note-body">
                        <p>${this.escapeHtml(note.body)}</p>
                    </div>
                    <div class="note-footer">
                        <span class="note-date">
                            <i class="fas fa-clock"></i>
                            ${this.formatDate(note.timestamp)}
                        </span>
                    </div>
                `;

        // Add event listeners
        noteCard.querySelector(".btn-edit").addEventListener("click", () => {
          this.editNote(note.id);
        });

        noteCard.querySelector(".btn-delete").addEventListener("click", () => {
          this.deleteNote(note.id);
        });

        notesList.appendChild(noteCard);
      });
    } catch (error) {
      console.error("Error loading notes:", error);
      loading.style.display = "none";
      notesList.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Gagal memuat catatan. Silakan coba lagi.</p>
                </div>
            `;
    }
  }

  async deleteNote(id) {
    const confirmation = confirm(
      "Apakah Anda yakin ingin menghapus catatan ini?"
    );
    if (!confirmation) return;

    try {
      await this.dbHelper.deleteNote(id);
      await this.loadNotes();
      this.showNotification("Catatan berhasil dihapus!", "success");
    } catch (error) {
      console.error("Error deleting note:", error);
      this.showNotification("Gagal menghapus catatan", "error");
    }
  }

  async saveStoriesOffline() {
    const dbHelper = new IndexedDBHelper();
    const saveStoriesButton = document.getElementById("saveStoriesButton");
    const storiesLoading = document.getElementById("storiesLoading");

    try {
      saveStoriesButton.disabled = true;
      saveStoriesButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
      storiesLoading.style.display = "block";

      // Get stories from API
      const token = localStorage.getItem("storyAppAuth")
        ? JSON.parse(localStorage.getItem("storyAppAuth")).token
        : null;

      if (!token) {
        this.showNotification("Anda harus login terlebih dahulu", "error");
        return;
      }

      const response = await fetch(
        "https://story-api.dicoding.dev/v1/stories",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data cerita");
      }

      const data = await response.json();
      await dbHelper.saveStories(data.listStory);

      storiesLoading.style.display = "none";
      this.showNotification(
        `${data.listStory.length} cerita berhasil disimpan untuk offline!`,
        "success"
      );

      // Show offline stories count
      this.showOfflineStoriesCount();
    } catch (error) {
      console.error("Error saving stories:", error);
      storiesLoading.style.display = "none";
      this.showNotification("Gagal menyimpan cerita", "error");
    } finally {
      saveStoriesButton.disabled = false;
      saveStoriesButton.innerHTML =
        '<i class="fas fa-download"></i> Simpan Cerita';
    }
  }

  async showOfflineStoriesCount() {
    const dbHelper = new IndexedDBHelper();
    const offlineStories = document.getElementById("offlineStories");

    try {
      const stories = await dbHelper.getAllStories();
      offlineStories.innerHTML = `
                <div class="offline-count">
                    <i class="fas fa-check-circle"></i>
                    <span>${stories.length} cerita tersimpan offline</span>
                </div>
            `;
    } catch (error) {
      console.error("Error getting offline stories count:", error);
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${
                  type === "success"
                    ? "check-circle"
                    : type === "error"
                    ? "exclamation-circle"
                    : "info-circle"
                }"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);

    // Manual close
    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => {
        notification.remove();
      });
  }

  // Helper methods
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

export default NotesPage;
