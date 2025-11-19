$(document).ready(function () {

  // Default page
  let currentPage = "dashboard";

  // ============================
  //  LOAD LAYOUT
  // ============================
  function loadLayout() {
    $("#navbar").load("layout/navbar.html");

    $("#accordionSidebar").load("layout/sidebar.html", function () {
      bindRouting();
      loadPage();
    });
  }

  // ============================
  //  ROUTING
  // ============================
  function bindRouting() {
    // Hapus event sebelumnya agar tidak dobel
    $(document).off("click.spa");

    // Klik semua link yang punya data-page
    $(document).on("click.spa", "a[data-page]", function (e) {
      e.preventDefault();

      const page = $(this).data("page");
      navigateTo(page);

      // Jika submenu diklik
      if ($(this).hasClass("collapse-item")) {
        const parentCollapse = $(this).closest(".collapse");

        setTimeout(() => parentCollapse.collapse("hide"), 150);
        $(this).blur(); // Hilangkan fokus
      }
    });
  }

  // ============================
  //  NAVIGATE
  // ============================
  function navigateTo(page) {
    history.pushState({}, "", page);
    currentPage = page;
    loadPage();
    setActiveMenu();
  }

  // ============================
  //  LOAD PAGE
  // ============================
  function loadPage() {
    const path = window.location.pathname.split("/").pop() || "dashboard";
    currentPage = path;

    const pagePath = `pages/${path}.html`;
    const controllerPath = `controllers/${path}Controller.js`;


    $("#content").load(pagePath, function (response, status) {
      if (status === "error") {
        
        $("#content").html(`<div class="alert alert-danger">404 - Halaman tidak ditemukan</div>`);
      } else {
        reinitTemplate();
        loadController(controllerPath);
        setActiveMenu();
      }
    });
  }

  // ============================
  //  REINIT TEMPLATE (SB ADMIN)
  // ============================
  function reinitTemplate() {
    $("#sidebarToggle, #sidebarToggleTop").off("click").on("click", function () {
      $("body").toggleClass("sidebar-toggled");
      $(".sidebar").toggleClass("toggled");

      if ($(".sidebar").hasClass("toggled")) {
        $(".sidebar .collapse").collapse("hide");
      }
    });
  }

  // ============================
  //  LOAD PAGE CONTROLLER JS
  // ============================
  function loadController(path) {
    // Hapus controller sebelumnya
    $("script[data-controller]").remove();

    const fixedPath = `./controllers/${path.split("/").pop()}`;


    // Load script via AJAX agar bisa dicek isi-nya
    $.ajax({
      url: `${fixedPath}?v=${Date.now()}`,
      dataType: "text",

      success: function (code) {
        if (code.trim().startsWith("<")) {
          return;
        }

        const script = document.createElement("script");
        script.dataset.controller = fixedPath;
        script.textContent = code;
        document.body.appendChild(script);

      },

      error: function (xhr) {
      },
    });
  }

  // ============================
  //  SET ACTIVE MENU
  // ============================
  function setActiveMenu() {
    const path = window.location.pathname.split("/").pop() || "dashboard";


    $(".nav-item").removeClass("active");

    const activeSubmenu = $(
      `.collapse-item[href='${path}'], .collapse-item[data-page='${path}']`
    );

    // Jika submenu
    if (activeSubmenu.length) {
      const parentCollapse = activeSubmenu.closest(".collapse");
      const mainItem = parentCollapse.closest(".nav-item");

      mainItem.addClass("active");
      parentCollapse.collapse("show");

      $(".collapse").not(parentCollapse).collapse("hide");
    } else {
      // Menu utama
      $(`.nav-item > .nav-link[data-page='${path}']`)
        .closest(".nav-item")
        .addClass("active");

      $(".collapse").collapse("hide");
    }
  }

  // ============================
  //  NOTIFY (opsional)
  // ============================
  function notify(message, type = "success") {
    const alert = `
      <div class="alert alert-${type} alert-dismissible fade show position-fixed"
           style="top: 1rem; right: 1rem; z-index: 2000;">
        ${message}
        <button class="close" data-dismiss="alert">&times;</button>
      </div>`;

    $("body").append(alert);
    setTimeout(() => $(".alert").alert("close"), 3000);
  }

  // Jalankan layout pertama kali
  loadLayout();

  // Back button browser
  window.addEventListener("popstate", loadPage);
});
