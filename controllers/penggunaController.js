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
    { data: "nik" },
    { data: "nama_lengkap" },
        { data: "username" },
        { data: "no_hp" },
        { data: "email" },
        { data: "alamat" },
        { data: "role" },
  
    
    {
        data: null,
        orderable: false,
        render: function (data, type, row) {
            return `
                <button class="btn btn-sm btn-primary btnEdit"
                        data-id="${row.id_user}"
                        data-nik="${row.nik}"
                        data-nama-lengkap="${row.nama_lengkap}"
                        data-username="${row.username}"
                        data-password="${row.password}"
                        data-no-hp="${row.no_hp}"    
                        data-email="${row.email}"
                        data-alamat="${row.alamat}"
                        data-alamat="${row.role}"


                       
                >Edit</button>

                <button class="btn btn-sm btn-danger btnHapus" data-id="${row.id_user}">
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
    $(document).off("click", "#btnTambah");
    $(document).off("click", ".btnEdit");
    $(document).off("click", "#btnSimpan");

    // Tambah Barang
    $(document).on("click", "#btnTambah", function () {
      resetForm();
      $("#modalPengguna .modal-title").text("Tambah Pengguna");
      $("#modalPengguna").modal("show");
    });

    // Edit Barang
    $(document).on("click", ".btnEdit", function () {

      // ambil semua data-* dengan dash (-)
        const id = $(this).data("id");
        const nik = $(this).data("nik");
        const namaLengkap = $(this).data("nama-lengkap");
        const username = $(this).data("username");
        const password = $(this).data("password");
        const noHP = $(this).data("no-hp");
        const email = $(this).data("email");
        const alamat = $(this).data("alamat");
        const role = $(this).data("role");


        // Isi form
      $("#namaLengkap").val(namaLengkap);
        $("#username").val(username);
        $("#password").val(password);
        $("#noHp").val(noHP);
        $("#email").val(email);
        $("#alamat").val(alamat);
        $("#role").val(role);

      $("#modalPengguna .modal-title").text(`Edit Pengguna ${nik}`);

      // Simpan ke button
      $("#btnSimpan").attr("data-id", id);

      $("#modalPengguna").modal("show");
    });

    // Simpan (Tambah / Edit)
    $(document).on("click", "#btnSimpan", function () {

      const id = $(this).attr("data-id") || null;

      const data = {
        id_user: id,
        nik: nik,
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

        const method = id ? "PUT" : "POST";
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
        data: { id_pengguna: id },
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
     $("#namaLengkap").val("");
        $("#username").val("");
        $("#password").val("");
        $("#noHp").val("");
        $("#email").val("");
        $("#alamat").val("");
        $("#role").val("");

    $("#btnSimpan").removeAttr("data-id");
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
