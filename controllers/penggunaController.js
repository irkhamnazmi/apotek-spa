$(document).ready(function () {

  const host = `http://localhost:8081/palmirafit`; // Base URL API

  // Load modal sekali
  if (!window._modalPenggunaLoaded) {
    window._modalPenggunaLoaded = true;

    $("#modalContainer").load(`${host}/modals/penggunaModal.html`, function () {
      if ($("#modalPengguna").length === 0) {
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
      url: `${host}/api/users`,
      dataSrc: (json) => json.data || [],
      error: () => alert("❌ Gagal mengambil data dari server!")
    },
    columns: [
    { data: "kode_barang" },
    { data: "nama_barang" },

    { 
        data: "stok_barang",
        render: data => parseInt(data)
    },
    { 
        data: "stok_minimum",
        render: data => parseInt(data)
    },

    { 
        data: "harga_beli",
        render: function(data){
            return formatRupiah(data);
        }
    },
    { 
        data: "harga_jual",
        render: function(data){
            return formatRupiah(data);
        }
    },

    { data: "tgl_kadaluarsa" },
    
    {
        data: null,
        orderable: false,
        render: function (data, type, row) {
            return `
                <button class="btn btn-sm btn-primary btnEditBarang"
                        data-id-barang="${row.id_barang}"
                        data-kode-barang="${row.kode_barang}"
                        data-nama-barang="${row.nama_barang}"
                        data-stok-barang="${row.stok_barang}"
                        data-stok-minimum="${row.stok_minimum}"
                        data-id-satuan="${row.id_satuan}"
                        data-tgl-kadaluarsa="${row.tgl_kadaluarsa}"
                        data-harga-beli="${parseInt(row.harga_beli)}"
                        data-harga-jual="${parseInt(row.harga_jual)}"
                >Edit</button>

                <button class="btn btn-sm btn-danger btnHapus" data-id="${row.id_barang}">
                    Hapus
                </button>
            `;
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

    // Clear duplicate events
    $(document).off("click", "#btnTambahBarang");
    $(document).off("click", ".btnEditBarang");
    $(document).off("click", "#btnSimpanBarang");

    // Tambah Barang
    $(document).on("click", "#btnTambahBarang", function () {
      resetForm();
      $("#modalPengguna .modal-title").text("Tambah Barang");
      $("#modalPengguna").modal("show");
    });

    // Edit Barang
    $(document).on("click", ".btnEditBarang", function () {

      // ambil semua data-* dengan dash (-)
      const idBarang = $(this).data("id-barang");
      const kodeBarang = $(this).data("kode-barang");
      const namaBarang = $(this).data("nama-barang");
      const stokBarang = $(this).data("stok-barang");
      const stokMinimum = $(this).data("stok-minimum");
      const idSatuan = $(this).data("id-satuan");
      const hargaBeli = $(this).data("harga-beli");
      const hargaJual = $(this).data("harga-jual");
      const tglKadaluarsa = $(this).data("tgl-kadaluarsa");

      // Isi form
      $("#namaBarang").val(namaBarang);
      $("#stokBarang").val(stokBarang);
      $("#stokMinimum").val(stokMinimum);
      $("#idSatuan").val(idSatuan);
      $("#hargaBeli").val(hargaBeli);
      $("#hargaJual").val(hargaJual);
      $("#tglKadaluarsa").val(tglKadaluarsa);

      $("#modalPengguna .modal-title").text(`Edit Barang ${kodeBarang}`);

      // Simpan ke button
      $("#btnSimpanBarang").attr("data-idBarang", idBarang);
      $("#btnSimpanBarang").attr("data-kodeBarang", kodeBarang);

      $("#modalPengguna").modal("show");
    });

    // Simpan (Tambah / Edit)
    $(document).on("click", "#btnSimpanBarang", function () {

      const idBarang = $(this).attr("data-idBarang") || null;
      const kodeBarang = $(this).attr("data-kodeBarang") || "";

      const data = {
        id_barang: idBarang,
        kode_barang: kodeBarang,
        nama_barang: $("#namaBarang").val(),
        stok_barang: $("#stokBarang").val(),
        stok_minimum: $("#stokMinimum").val(),
        id_satuan: $("#idSatuan").val(),
        harga_beli: $("#hargaBeli").val(),
        harga_jual: $("#hargaJual").val(),
        tgl_kadaluarsa: $("#tglKadaluarsa").val()
      };

      console.log(data);
      

      startProgress().then(() => {

        const method = idBarang ? "PUT" : "POST";
        const url =`${host}/api/users`;

        $.ajax({
          url: url,
          type: method,
          contentType: "application/json",
          data: JSON.stringify(data),
          success: function (res) {
            alert(res.meta?.message || "Berhasil disimpan!");
            $("#modalPengguna").modal("hide");
            table.ajax.reload();
          },
          error: function () {
            alert("❌ Gagal menyimpan data!");
          }
        });

      });

    });

    // Hapus
    $("#dataTable tbody").on("click", ".btnHapus", function () {
      const id = $(this).data("id");

      if (!confirm("Yakin ingin menghapus barang ini?")) return;

      $.ajax({
        url: `${host}/api/users`,
        type: "DELETE",
        data: { id_barang: id },
        success: function (res) {
          alert(res.meta?.message || "Berhasil dihapus!");
          table.ajax.reload();
        },
        error: function () {
          alert("❌ Gagal menghapus data!");
        }
      });
    });

  }

  // Reset form
  function resetForm() {
    $("#namaBarang").val("");
    $("#stokBarang").val("");
    $("#stokMinimum").val("");
    $("#idSatuan").val("");
    $("#hargaBeli").val("");
    $("#hargaJual").val("");
    $("#tglKadaluarsa").val("");

    $("#btnSimpanBarang").removeAttr("data-idBarang");
    $("#btnSimpanBarang").removeAttr("data-kodeBarang");
  }


  // Progress modal
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
          }, 300);
        }
      }, 150);
    });
  }

  function updateProgress(value) {
    $("#progressBar").css("width", value + "%");
    $("#progressText").text(value + "%");
  }

  // Load satuan
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

  function formatRupiah(angka) {
    if (!angka) return "Rp 0";
    return "Rp " + Number(angka)
        .toLocaleString("id-ID", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
}


});
