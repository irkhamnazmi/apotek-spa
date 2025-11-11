// ✅ app.js — Versi Alpine Modular, kompatibel dengan jQuery + SB Admin 2

document.addEventListener('alpine:init', () => {
  Alpine.data('spaApp', () => ({
    // --- STATE ---
    currentPage: 'dashboard',
    content: '',

    // --- INIT ---
    init() {
      console.log('🚀 Alpine SPA initialized');

      // Muat layout utama
      this.loadLayout();

      // Inisialisasi event popstate (Back/Forward browser)
      window.addEventListener('popstate', () => this.loadPage());
    },

    // --- LOAD LAYOUT ---
    loadLayout() {
      // Sidebar & navbar pakai jQuery
      $('#navbar').load('layout/navbar.html');
      $('#accordionSidebar').load('layout/sidebar.html', () => {
        this.bindRouting();
        this.loadPage();
      });
    },

    // --- ROUTING HANDLER ---
    bindRouting() {
      // Navigasi klik
      $(document).on('click', 'a[data-page]', (e) => {
        e.preventDefault();
        const page = $(e.currentTarget).data('page');
        this.navigateTo(page);
      });
    },

    navigateTo(page) {
      // Update URL tanpa reload
      history.pushState({}, '', page);
      this.currentPage = page;
      this.loadPage();
      this.setActiveMainMenu();
    },

    // --- LOAD PAGE ---
    loadPage() {
      let path = window.location.pathname;
      let page = path.split('/').pop() || 'dashboard';
      this.currentPage = page;

      const pagePath = `pages/${page}.html`;
      const controllerPath = `controllers/${page}Controller.js`;

      console.log(`📄 Memuat halaman: ${pagePath}`);

      // Muat konten halaman
      $('#content').load(pagePath, (response, status) => {
        if (status === 'error') {
          $('#content').html(
            `<div class="alert alert-danger">404 - Halaman tidak ditemukan</div>`
          );
        } else {
          // Reinit template & load controller
          this.reinitTemplate();
          this.loadController(controllerPath);
          this.setActiveMainMenu();
        }
      });
    },

    // --- REINIT SB ADMIN TEMPLATE ---
    reinitTemplate() {
      // Toggle Sidebar
      $('#sidebarToggle, #sidebarToggleTop')
        .off('click')
        .on('click', function () {
          $('body').toggleClass('sidebar-toggled');
          $('.sidebar').toggleClass('toggled');
          if ($('.sidebar').hasClass('toggled')) {
            $('.sidebar .collapse').collapse('hide');
          }
        });
    },

    // --- LOAD PAGE CONTROLLER ---
    loadController(path) {
      $('script[data-controller]').remove();

      const finalPath = `./${path.replace(/^\.?\//, '')}`;
      console.log('📦 Memuat controller:', finalPath);

      $.getScript(finalPath)
        .done(() => {
          console.log(`✅ Controller ${finalPath} dimuat`);
        })
        .fail(() => {
          console.warn(`⚠️ Tidak ada controller untuk ${finalPath}`);
        });
    },

    // --- AKTIFKAN MENU SESUAI HALAMAN ---
  setActiveMainMenu() {
  const path = window.location.pathname.split('/').pop() || 'dashboard';

  // 🔹 Reset semua nav-link & collapse
  $('.nav-link').removeClass('active');
  $('.collapse').collapse('hide');

  // 🔹 Cari link utama (non-submenu) yang sesuai dengan halaman
  const activeMain = $(`.nav-link[data-page='${path}'], .nav-link[href='${path}']`);
  if (activeMain.length) {
    activeMain.addClass('active');
  }

  // 🔹 Cari link submenu (collapse-item)
  const activeSubmenu = $(`.collapse-item[data-page='${path}'], .collapse-item[href='${path}']`);
  if (activeSubmenu.length) {
    const parentCollapse = activeSubmenu.closest('.collapse');
    const mainMenu = parentCollapse.prev('.nav-link');
    parentCollapse.addClass('show');
    mainMenu.addClass('active');
    activeSubmenu.addClass('active');
  }
},

    // --- OPSIONAL: STATE REAKTIF TAMBAHAN ---
    // Misalnya untuk notifikasi global
    notify(message, type = 'success') {
      const alert = `<div class="alert alert-${type} alert-dismissible fade show position-fixed" 
                      style="top: 1rem; right: 1rem; z-index: 2000;">
                      ${message}
                      <button type="button" class="close" data-dismiss="alert">&times;</button>
                    </div>`;
      $('body').append(alert);
      setTimeout(() => $('.alert').alert('close'), 3000);
    },
  }));
});
