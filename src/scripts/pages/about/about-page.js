const AboutPage = {
  async render() {
    return `
      <section class="content about-content">
        <h2 class="content__heading">Tentang StoryShare</h2>
        <div class="about-container">
          <div class="about-section">
            <h3>Aplikasi Berbagi Cerita</h3>
            <p>StoryShare adalah platform berbagi cerita yang memungkinkan pengguna untuk:</p>
            <ul>
              <li>Membagikan cerita dan pengalaman mereka dengan foto</li>
              <li>Menandai lokasi cerita di peta</li>
              <li>Menelusuri cerita-cerita dari pengguna lain</li>
            </ul>
          </div>
          
          <div class="about-section">
            <h3>Fitur Utama</h3>
            <ul>
              <li>Arsitektur Single-Page Application (SPA) untuk pengalaman pengguna yang lebih baik</li>
              <li>Integrasi dengan kamera perangkat untuk pengambilan foto langsung</li>
              <li>Peta interaktif untuk menampilkan dan memilih lokasi</li>
              <li>Transisi halaman yang halus dengan View Transition API</li>
              <li>Desain yang responsif dan aksesibel</li>
            </ul>
          </div>
          
          <div class="about-section">
            <h3>Teknologi</h3>
            <ul>
              <li>HTML5, CSS3, dan JavaScript</li>
              <li>Arsitektur SPA dengan model-view-presenter (MVP)</li>
              <li>Webpack sebagai module bundler</li>
              <li>Leaflet.js untuk implementasi peta</li>
              <li>Web API kamera untuk pengambilan gambar</li>
            </ul>
          </div>

          <div class="about-section">
            <h3>Accessibility Features</h3>
            <ul>
              <li>Skip to content link</li>
              <li>Semantic HTML elements</li>
              <li>ARIA attributes</li>
              <li>Alternative text untuk gambar</li>
              <li>Focus management</li>
            </ul>
          </div>
        </div>
      </section>
    `;
  },

  async afterRender() {},
};

export default AboutPage;
