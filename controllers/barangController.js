$(document).ready(function () {

  const host = `http://localhost:8081/apotek-spa`; // Base URL API

  // Load modal sekali
  if (!window._modalBarangLoaded) {
    window._modalBarangLoaded = true;
    window._progressModalLoaded = true;

    $("#modalContainer").load(`${host}/modals/barangModal.html`, function () {
      if ($("#modalBarang").length === 0) {
        console.error("❌ Modal gagal diload");
        return;
      }
      $("#modalProgressContainer").load(`${host}/modals/progressModal.html`, function () {
        console.log("⏳ Progress modal loaded");
      });
      bindModalEvents();
    });
  } else {
    bindModalEvents();
  }

  // ===========================
  //   DATA TABLE
  // ===========================
  const table = $("#dataTable").DataTable({
    pageLength: parseInt($("#customLength").val()) || 10,
    responsive: true,
    dom: 'rtip',
    ajax: {
      url: `${host}/api/master_barang`,
      dataSrc: function (json) {
        return json.data || [];
      },
      error: function () {
        alert("❌ Gagal mengambil data dari server!");
      }
    },
    columns: [
      { data: "kode_barang" },
      { data: "nama_barang" },
      { data: "stok_barang" },
      { data: "stok_minimum" },
      { data: "harga_beli" },
      { data: "harga_jual" },
      { data: "tanggal_kadaluarsa" },
      {
        data: null,
        orderable: false,
        render: function (data, type, row) {
          return `
            <button class="btn btn-sm btn-primary btnEditBarang" 
                    data-id="${row.id_barang}" 
                    data-nama="${row.nama_barang}" 
                    data-stok="${row.stok_barang}" 
                    data-kode="${row.kode_barang}">Edit</button>
            <button class="btn btn-sm btn-danger btnHapus" 
                    data-id="${row.id_barang}">Hapus</button>`;
        }
      }
    ]
  });

  // Custom Search
  $("#customSearch").on("keyup", function () {
    table.search(this.value).draw();
  });

  // Custom Show Entries
  $("#customLength").on("change", function () {
    table.page.len(this.value).draw();
  });

  // ===========================
  //   MODAL EVENTS
  // ===========================
  function bindModalEvents() {
    $(document).off("click", "#btnTambahBarang");
    $(document).off("click", ".btnEditBarang");
    $(document).off("click", "#btnSimpanBarang");

    // Tambah Barang
    $(document).on("click", "#btnTambahBarang", function () {
      resetForm();
      $("#modalBarang .modal-title").text("Tambah Barang");
      $("#modalBarang").modal("show");
    });

    // Edit Barang
    $(document).on("click", ".btnEditBarang", function () {
      const id = $(this).data("id");
      const nama = $(this).data("nama");
      const stok = $(this).data("stok");
      const kode = $(this).data("kode");

      $("#namaBarang").val(nama);
      $("#stokBarang").val(stok);
      $("#kodeBarang").val(kode);

      $("#modalBarang .modal-title").text(`Edit Barang (ID: ${id})`);
      $("#btnSimpanBarang").data("id", id);
      $("#modalBarang").modal("show");
    });

    // Simpan Barang
    $(document).on("click", "#btnSimpanBarang", function () {
      const id = $(this).data("id");
      const data = {
        kode_barang: $("#kodeBarang").val(),
        nama_barang: $("#namaBarang").val(),
        stok_barang: $("#stokBarang").val()
      };

      startProgress().then(() => {
        const method = id ? "PUT" : "POST";
        const url = id ? `${host}/api/master_barang/${id}` : `${host}/api/master_barang`;

        $.ajax({
          url: url,
          type: method,
          contentType: "application/json",
          data: JSON.stringify(data),
          success: function (res) {
            alert(res.meta?.message || "Berhasil disimpan!");
            $("#modalBarang").modal("hide");
            table.ajax.reload();
          },
          error: function () {
            alert("❌ Gagal menyimpan data!");
          }
        });
      });
    });

    // Hapus Barang
    $("#dataTable tbody").on("click", ".btnHapus", function () {
      const id = $(this).data("id");
      if (confirm("Yakin ingin menghapus barang ini?")) {
        $.ajax({
          url: `${host}/api/barang/${id}`,
          type: "DELETE",
          success: function (res) {
            alert(res.meta?.message || "Berhasil dihapus!");
            table.ajax.reload();
          },
          error: function () {
            alert("❌ Gagal menghapus data!");
          }
        });
      }
    });
  }

  function resetForm() {
    $("#kodeBarang").val("");
    $("#namaBarang").val("");
    $("#stokBarang").val("");
    $("#btnSimpanBarang").removeData("id");
  }

  function startProgress() {
    return new Promise((resolve) => {
      let val = 0;
      updateProgress(0);
      $("#modalProgress").modal({ backdrop: "static", keyboard: false }).modal("show");

      let timer = setInterval(() => {
        val += 10;
        updateProgress(val);
        if (val >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            $("#modalProgress").modal("hide");
            resolve();
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
