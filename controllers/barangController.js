// controllers/barangController.js

$(document).ready(function () {

  console.log("📄 barangController loaded");

  // Global flag agar modal hanya load sekali
  if (!window._modalBarangLoaded) {
    window._modalBarangLoaded = true;
        window._progressModalLoaded = true;


   

    // IMPORTANT: gunakan path ABSOLUTE agar tidak salah folder
    $("#modalContainer").load("./modals/barangModal.html", function () {

      if ($("#modalBarang").length === 0) {
        console.error("❌ Modal gagal diload dari /modals/barangModal.html");
        return;
      }

       $("#modalProgressContainer").load("./modals/progressModal.html", function () {
    console.log("⏳ Progress modal loaded");
  });

      bindModalEvents();  // harus di-call setelah modal masuk DOM
    });

  } else {
    console.log("ℹ️ Modal sudah pernah diload. Bind ulang events.");
    bindModalEvents();
  }

  initDataTable();

        // CUSTOM SEARCH




  // =============================================
  //                 FUNCTIONS
  // =============================================

  function initDataTable() {
    if (!$.fn.DataTable.isDataTable("#dataTable")) {
      const table = $("#dataTable").DataTable({
        pageLength: 10,
        responsive: true,

        // MATIKAN bawaan DataTables
  searching: false,
  lengthChange: false
      });


      $("#customSearch").on("keyup", function () {
  table.search(this.value).draw();
});

// CUSTOM SHOW ENTRIES
$("#customLength").on("change", function () {
  // table.page.len(this.value).draw();
});


    }

    
  }


  function bindModalEvents() {

    console.log("🎯 Binding modal events");

    // Buang event lama dulu
    $(document).off("click", "#btnTambahBarang");
    $(document).off("click", ".btnEditBarang");
    $(document).off("click", "#btnSimpanBarang");


    // ===========================
    //   TAMBAH BARANG
    // ===========================
    $(document).on("click", "#btnTambahBarang", function () {

      console.log("🟦 Klik Tambah Barang");

      if ($("#modalBarang").length === 0) {
        console.error("❌ modalBarang belum masuk DOM!");
        return;
      }

      resetForm();
      // $("#modalBarang .modal-title").text("Tambah Barang");
      $("#modalBarang").modal("show");
    });


    // ===========================
    //   EDIT BARANG
    // ===========================
    $(document).on("click", ".btnEditBarang", function () {
      const id = $(this).data("id");
      const nama = $(this).data("nama");
      const stok = $(this).data("stok");

      isiForm(nama, stok);
      $("#modalBarang .modal-title").text("Edit Barang (ID: " + id + ")");
      $("#modalBarang").modal("show");
    });


    // ===========================
    //   SIMPAN (DEMO)
    // ===========================
    $(document).on("click", "#btnSimpanBarang", function () {

      const data = {
        nama: $("#namaBarang").val(),
        stok: $("#stokBarang").val(),
      };

      console.log("📤 Data tersimpan:", data);
      startProgress().then(() => {
$("#modalBarang").modal("hide");
});
      

    });

  }


  // UTILITIES
  function resetForm() {
    $("#namaBarang").val("");
    $("#stokBarang").val("");
  }

  function isiForm(nama, stok) {
    $("#namaBarang").val(nama);
    $("#stokBarang").val(stok);
  }

function startProgress() {
  return new Promise((resolve) => {

    let val = 0;
    updateProgress(0);

    $("#modalProgress").modal({ backdrop: "static", keyboard: false });
    $("#modalProgress").modal("show");

    let timer = setInterval(() => {
      val += 10;
      updateProgress(val);

      if (val >= 100) {
        clearInterval(timer);

        setTimeout(() => {
          $("#modalProgress").modal("hide");
          resolve();  // 👉 inilah RETURN nya
        }, 400);
      }
    }, 200);

  });
}


function updateProgress(value) {
  $("#progressBar").css("width", value + "%");
  $("#progressText").text(value + "%");
}


});


