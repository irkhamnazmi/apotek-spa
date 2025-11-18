$(document).ready(function () {

  const host = `http://localhost:8081/palmirafit`; // Base URL API

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
      loadSatuan();
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
      { data: "tgl_kadaluarsa" },
      {
        data: null,
        orderable: false,
        render: function (data, type, row) {
          return `
            <button class="btn btn-sm btn-primary btnEditBarang" 
                    data-id-barang="${row.id_barang}" 
                    data-nama-barang="${row.nama_barang}" 
                    data-stok-barang="${row.stok_barang}"
                    data-stok-minimum="${row.stok_minimum}"


                    data-harga-beli="${row.harga_beli}"
                    data-harga-jual="${row.harga_jual}"


                    >Edit</button>
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
      const idBarang = $(this).data("idBarang");
      const namaBarang = $(this).data("namaBarang");
      const stokBarang = $(this).data("stokBarang");
      const stokMinimum = $(this).data("stokMinimum");
      const idSatuan = $(this).data("idSatuan");
      const hargaBeli = $(this).data("hargaBeli");
      const hargaJual = $(this).data("hargaJual");
      const tglKadaluarsa = $(this).data("tglKadaluarsa");




      $("#namaBarang").val(namaBarang);
      $("#stokBarang").val(stokBarang);
      $("#stokMinimum").val(stokMinimum);
      $("#idSatuan").val(idSatuan);
      $("#hargaBeli").val(hargaBeli);
      $("#hargaJual").val(hargaJual);
      $("#tglKadaluarsa").val(tglKadaluarsa);

      $("#modalBarang .modal-title").text(`Edit Barang`);
      $("#btnSimpanBarang").data("idBarang", idBarang);
      $("#modalBarang").modal("show");
    });

    // Simpan Barang
    $(document).on("click", "#btnSimpanBarang", function () {
      const id = $(this).data("id");
      const data = {
      namaBarang:   $("#namaBarang").val(),
      stokBarang: $("#stokBarang").val(),
      stokMinimum: $("#stokMinimum").val(),
      idSatuan: $("#idSatuan").val(),
      hargaBeli: $("#hargaBeli").val(),
      hargaJual:$("#hargaJual").val(),
      tglKadaluarsa:$("#tglKadaluarsa").val()
       


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
    $("#stokMinimum").val("");
    $("#idSatuan").val("");
    $("#hargaBeli").val("");
    $("#hargaJual").val("");
    $("#tglKadaluarsa").val("");
    $("#btnSimpanBarang").removeData("idBarang");
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

  function loadSatuan() {
  $.ajax({
    url: `${host}/api/satuan`,
    type: "GET",
    success: function (res) {
      const list = res.data || [];
      const dropdown = $("#idSatuan");

      dropdown.empty();
      dropdown.append(`<option value="">-- Pilih Satuan --</option>`);

      list.forEach(item => {
        dropdown.append(`
          <option value="${item.id_satuan}">
            ${item.nama_satuan}
          </option>
        `);
      });
    },
    error: function () {
      console.error("❌ Gagal load data satuan");
    }
  });
}

});
