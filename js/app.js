$(document).ready(function() {

  $('#navbar').load('layout/navbar.html');
  $('#accordionSidebar').load('layout/sidebar.html', function() {
    bindRouting();
    loadPage();
  });

  function bindRouting() {
    // Tangani navigasi klik di sidebar/menu
    $(document).on('click', 'a[data-page]', function(e) {
      e.preventDefault();
      const page = $(this).data('page');
      navigateTo(page);
    });

    // Tangani tombol back/forward browser
    window.addEventListener('popstate', function() {
      loadPage();
    });
  }

  function navigateTo(page) {
    // Ubah URL tanpa reload
    history.pushState({}, '', page);
    loadPage();
  }

  function loadPage() {
    // Ambil bagian terakhir dari URL
    let path = window.location.pathname;
    let page = path.split('/').pop();
      if (page === '') page = 'dashboard';
       if (page === 'kasir') page = 'kasir';

      
    const pagePath = `pages/${page}.html`;

    $('#content').load(pagePath, function(response, status) {
      if (status === "error") {
        $('#content').html(`<div class="alert alert-danger">404 - Halaman tidak ditemukan</div>`);
      } else {
        reinitTemplate();
      }
    });
  }

  function reinitTemplate() {
    // event dan plugin SB Admin 2
    $("#sidebarToggle, #sidebarToggleTop").off('click').on('click', function() {
      $("body").toggleClass("sidebar-toggled");
      $(".sidebar").toggleClass("toggled");
      if ($(".sidebar").hasClass("toggled")) {
        $('.sidebar .collapse').collapse('hide');
      }
    });
  }

});
