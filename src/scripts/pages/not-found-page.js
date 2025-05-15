const NotFoundPage = {
  async render() {
    return `
      <section class="not-found-page text-center">
        <h2>😕 Halaman Tidak Ditemukan</h2>
        <p>Alamat yang Anda tuju tidak tersedia.</p>
        <a href="#/" class="btn">Kembali ke Beranda</a>
      </section>
    `;
  },
  async afterRender() {},
};

export default NotFoundPage;
