// ✅ app.js — Alpine.js + jQuery kompatibel dengan SB Admin 2
document.addEventListener("alpine:init", () => {
  Alpine.data("spaApp", () => ({
    currentPage: "dashboard",

    init() {
      console.log("🚀 Alpine SPA initialized");
      this.loadLayout();
      window.addEventListener("popstate", () => this.loadPage());
    },

    // --- LOAD LAYOUT ---
    loadLayout() {
      $("#navbar").load("layout/navbar.html");
      $("#accordionSidebar").load("layout/sidebar.html", () => {
        this.bindRouting();
        this.loadPage();
      });
    },

    // --- ROUTING ---
  bindRouting() {
  // Hapus dulu binding lama biar tidak dobel
  $(document).off("click.spa");

  // Klik link navigasi (semua)
  $(document).on("click.spa", "a[data-page]", (e) => {
    e.preventDefault();

    const $link = $(e.currentTarget);
    const page = $link.data("page");
    this.navigateTo(page);

    // Tutup semua collapse ketika submenu diklik
    if ($link.hasClass("collapse-item")) {
      const $parentCollapse = $link.closest(".collapse");

      // Tutup collapse setelah klik submenu
      setTimeout(() => {
        $parentCollapse.collapse("hide");
      }, 150);

      // Hapus fokus dari link (biar animasi rapi)
      $link.blur();
    }
  });
}
,

    navigateTo(page) {
      history.pushState({}, "", page);
      this.currentPage = page;
      this.loadPage();
      this.setActiveMainMenu();
    },

    // --- LOAD PAGE ---
    loadPage() {
      const path = window.location.pathname.split("/").pop() || "dashboard";
      this.currentPage = path;
      const pagePath = `pages/${path}.html`;
      const controllerPath = `controllers/${path}Controller.js`;

      console.log(`📄 Memuat halaman: ${pagePath}`);

      $("#content").load(pagePath, (response, status) => {
        if (status === "error") {
          $("#content").html(
            `<div class="alert alert-danger">404 - Halaman tidak ditemukan</div>`
          );
        } else {
          this.reinitTemplate();
          this.loadController(controllerPath);
          this.setActiveMainMenu();
        }
      });
    },

    // --- REINIT TEMPLATE SB ADMIN ---
    reinitTemplate() {
      $("#sidebarToggle, #sidebarToggleTop")
        .off("click")
        .on("click", function () {
          $("body").toggleClass("sidebar-toggled");
          $(".sidebar").toggleClass("toggled");
          if ($(".sidebar").hasClass("toggled")) {
            $(".sidebar .collapse").collapse("hide");
          }
        });
    },

    // --- LOAD CONTROLLER JS ---
  // --- LOAD PAGE CONTROLLER (Versi Alpine Reactive + jQuery compatible)
loadController(path) {
  // Hapus controller sebelumnya
  $("script[data-controller]").remove();

  // Pastikan path relatif ke root (bukan "./")
  const finalPath = `./controllers/${path.split('/').pop()}`; // misal: /controllers/kasirController.js
  console.log("📦 [Alpine] Memuat controller:", finalPath);

  fetch(`${finalPath}?v=${Date.now()}`)
    .then(async (res) => {
      if (!res.ok) throw new Error(`Gagal load controller: ${res.status}`);
      const text = await res.text();

      // Cegah error kalau ternyata HTML 404
      if (text.trim().startsWith("<")) {
        console.warn(`⚠️ [Alpine] ${finalPath} bukan JS valid (kemungkinan 404 HTML)`);
        return;
      }

      // Tambah script baru
      const script = document.createElement("script");
      script.dataset.controller = finalPath;
      script.textContent = text;
      document.body.appendChild(script);

      console.log(`✅ [Alpine] Controller ${finalPath} dimuat`);
    })
    .catch((err) => {
      console.warn(`⚠️ [Alpine] Tidak dapat memuat ${finalPath}:`, err.message);
    });
},




    // --- SET ACTIVE MENU ---
  setActiveMainMenu() {
  const path = window.location.pathname.split("/").pop() || "dashboard";
  console.log("🧭 Menandai menu aktif:", path);

  // Hapus semua class active
  $(".nav-item").removeClass("active");

  // Cari submenu aktif
  const activeSubmenu = $(`.collapse-item[href='${path}'], .collapse-item[data-page='${path}']`);

  if (activeSubmenu.length) {
    const parentCollapse = activeSubmenu.closest(".collapse");
    const mainItemLi = parentCollapse.closest(".nav-item");

    // Tandai nav-item utama sebagai active
    mainItemLi.addClass("active");

    // Buka collapse yang berisi submenu aktif
    parentCollapse.collapse("show");

    // Tutup semua collapse lain yang tidak berisi submenu aktif
    $(".collapse").not(parentCollapse).collapse("hide");
  } else {
    // Halaman utama tanpa submenu
    $(`.nav-item > .nav-link[data-page='${path}']`).closest(".nav-item").addClass("active");

    // Tutup semua collapse
    $(".collapse").collapse("hide");
  }
}

,

    // --- OPTIONAL NOTIFY ---
    notify(message, type = "success") {
      const alert = `<div class="alert alert-${type} alert-dismissible fade show position-fixed" 
                      style="top: 1rem; right: 1rem; z-index: 2000;">
                      ${message}
                      <button type="button" class="close" data-dismiss="alert">&times;</button>
                    </div>`;
      $("body").append(alert);
      setTimeout(() => $(".alert").alert("close"), 3000);
    },
  }));
});
