$(document).ready(function () {
  const host = `http://localhost:8081/palmirafit`;

  // ============================
  //  AUTH & ROLE GUARD
  // ============================
  function authGuard() {
    const userStr = localStorage.getItem("user");
    const path = window.location.pathname.split("/").pop() || "dashboard";

    if (!userStr) {
      if (path !== "login") window.location.replace(host + "/login");
      return null;
    }

    const user = JSON.parse(userStr);
    if (path === "login") {
      window.location.replace(host);
      return null;
    }

    return user;
  }

  let currentUser = authGuard();
  if (!currentUser) return;

  // ambil nama halaman terakhir dari path
  let currentPage = window.location.pathname.split("/").pop() || "dashboard";

  // ============================
  //  LOGOUT FUNCTION
  // ============================
 

  $(document).on("click", "#btnLogout", logout);

  // ============================
  //  LOAD LAYOUT & SPA
  // ============================
  function loadLayout() {
    $("#navbar").load("layout/navbar.html");
    $("#accordionSidebar").load("layout/sidebar.html", function () {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (currentUser.role === "kasir") {
        $('#master').hide();
        $('#persediaan').hide();
      }
      bindRouting();
      loadPage();
    });
  }

  function bindRouting() {
    $(document).off("click.spa");
    $(document).on("click.spa", "a[data-page]", function (e) {
      e.preventDefault();
      const page = $(this).data("page");
      navigateTo(page);

      if ($(this).hasClass("collapse-item")) {
        const parentCollapse = $(this).closest(".collapse");
        setTimeout(() => parentCollapse.collapse("hide"), 150);
        $(this).blur();
      }
    });
  }

  function navigateTo(page) {
    history.pushState({}, "", page);
    currentPage = page;
    loadPage();
    setActiveMenu();
  }

  function loadPage() {
    let pagePath = `pages/${currentPage}.html`;
    let controllerPath = `controllers/${currentPage}Controller.js`;
    const fallbackPath = "pages/404.html";

    // cek file ada atau tidak
    $.ajax({
      url: pagePath,
      type: "HEAD",
      success: function () {
        $("#content").load(pagePath, function () {
          reinitTemplate();
          loadController(controllerPath);
          setActiveMenu();
        });
      },
      error: function () {
        // file tidak ada → load 404.html
        currentPage = "404"; // set currentPage supaya menu tidak aktif
        pagePath = fallbackPath;
        $("#content").load(fallbackPath, function () {
          reinitTemplate();
          setActiveMenu();
        });
      }
    });
  }

  function reinitTemplate() {
    $("#sidebarToggle, #sidebarToggleTop").off("click").on("click", function () {
      $("body").toggleClass("sidebar-toggled");
      $(".sidebar").toggleClass("toggled");
      if ($(".sidebar").hasClass("toggled")) $(".sidebar .collapse").collapse("hide");
    });
  }

  function loadController(path) {
    $("script[data-controller]").remove();
    const fixedPath = `./controllers/${path.split("/").pop()}`;
    $.ajax({
      url: `${fixedPath}?v=${Date.now()}`,
      dataType: "text",
      success: function (code) {
        if (!code.trim().startsWith("<")) {
          const script = document.createElement("script");
          script.dataset.controller = fixedPath;
          script.textContent = code;
          document.body.appendChild(script);
        }
      },
    });
  }

  function setActiveMenu() {
    $(".nav-item").removeClass("active");
    const activeSubmenu = $(`.collapse-item[href='${currentPage}'], .collapse-item[data-page='${currentPage}']`);
    if (activeSubmenu.length) {
      const parentCollapse = activeSubmenu.closest(".collapse");
      const mainItem = parentCollapse.closest(".nav-item");
      mainItem.addClass("active");
      parentCollapse.collapse("show");
      $(".collapse").not(parentCollapse).collapse("hide");
    } else {
      $(".collapse").collapse("hide");
    }
  }

  // ============================
  //  POPSTATE BACK BUTTON
  // ============================
  window.addEventListener("popstate", function () {
    currentUser = authGuard();
    if (!currentUser) return;
    currentPage = window.location.pathname.split("/").pop() || "dashboard";
    loadPage();
  });

  // ============================
  //  INIT SPA
  // ============================
  loadLayout();
});
