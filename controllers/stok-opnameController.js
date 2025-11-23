$(document).ready(function () {

  const host = `http://localhost:8081/palmirafit`; // Base URL API

  // Load modal sekali
  // ===========================
  //   DATA TABLE
  // ===========================
  const table = $("#dataTable").DataTable({
    pageLength: parseInt($("#customLength").val()) || 10,
    responsive: true,
    dom: 'rtip',
    ajax: {
      url: `${host}/api/stok_opname`,
      dataSrc: (json) => json.data || [],
      error: () => alert("❌ Gagal mengambil data dari server!")
    },
    columns: [
      { data: "kode_barang" },
      { data: "nama_barang" },
      { data: "nama_lokasi_penyimpanan" },
      { data: "stok_rak" },
      { data: "kapasitas_rak" },
      
    
    {
        data: null,
        orderable: false,
        render: function (data, type, row) {
            return `
                <button class="btn btn-sm btn-primary btnEdit"
                        data-id="${row.id_stok_opname}"
                        data-id-barang="${row.id_barang}"
                        data-kode-barang="${row.kode_barang}"

                        data-id-lokasi-penyimpanan="${row.id_lokasi_penyimpanan}"
                        data-stok-rak="${row.stok_rak}"
                        data-kapasitas-rak="${row.kapasitas_rak}"
                       
                >Edit</button>

                <button class="btn btn-sm btn-danger btnHapus" data-id="${row.id_stok_opname}">
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

   

loadModal(
    "#modalContainer",
    `${host}/modals/stok-opnameModal.html`,
    "#modalProgressContainer",
    `${host}/modals/progressModal.html`,
    function(modal) {
        bindModalEvents(); // bind event setelah modal ada
       
    }
);


  // ===========================
  //   MODAL EVENTS
  // ===========================
  function bindModalEvents() {
    
    // Clear duplicate events
    $(document).off("click", "#btnTambah");
    $(document).off("click", ".btnEdit");
    $(document).off("click", "#btnSimpan");


    $(document).on("click", "#btnTambah", function () {
      resetForm();
      loadBarang("");
      loadLokasiPenyimpanan("");

      loadStokOpname();
      
      $("#modalStokOpname .modal-title").text("Tambah Stok Opname");
      $("#modalStokOpname").modal("show");
    });

   



   


    
    $(document).on("click", ".btnEdit", function () {
      resetForm();
      // ambil semua data-* dengan dash (-)
      const id = $(this).data("id");
      const idBarang = $(this).data("id-barang");
      const kodeBarang = $(this).data("kode-barang");

      const idLokasiPenyimpanan = $(this).data("id-lokasi-penyimpanan");
      const stokRak = $(this).data("stok-rak");
      const kapasitasRak = $(this).data("kapasitas-rak");


      loadBarang(idBarang);
      loadLokasiPenyimpanan(idLokasiPenyimpanan);
      
      loadStokOpname();
      
    
      
       


        // Isi form
        $("#idBarang").val(idBarang);
        $("#idLokasiPenyimpanan").val(idLokasiPenyimpanan);
        $("#stokRak").val(stokRak);

        $("#kapasitasRak").val(kapasitasRak);

   

      $("#modalStokOpname .modal-title").text(`Edit Stok Opname Barang ${kodeBarang}`);

      // Simpan ke button
      $("#btnSimpan").attr("data-id", id);

      $("#modalStokOpname").modal("show");
    });

    // Simpan (Tambah / Edit)
    $(document).on("click", "#btnSimpan", function () {

      const id = $(this).attr("data-id") || null;


      const data = {
        id_stok_opname: id,
        id_barang: $("#idBarang").val(),
        id_lokasi_penyimpanan: $("#idLokasiPenyimpanan").val(),
        stok_rak: $("#stokRak").val(),
        kapasitas_rak: $("#kapasitasRak").val(),

      };



      startProgress().then(() => {

        const method = id ? "PUT" : "POST";
        const url = `${host}/api/stok_opname`;
        
        console.log(data);


        $.ajax({
          url: url,
          type: method,
          contentType: "application/json",
          data: JSON.stringify(data),
          success: function (res) {
            alert(res.meta?.message || "Berhasil disimpan!");
            $("#modalStokOpname").modal("hide");
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

      if (!confirm("Yakin ingin menghapus stok opname ini?")) return;

      startProgress().then(() => { 


        $.ajax({
          url: `${host}/api/stok_opname`,
          type: "DELETE",
          data: { id_stok_opname: id },
          success: function (res) {
            alert(res.meta?.message || "Berhasil dihapus!");
            table.ajax.reload();
          },
          error: function () {
            alert("❌ Gagal menghapus data!");
          }
        });
      });

    });

  }

  // Reset form
  function resetForm() {
        $("#idBarang").val("");
        $("#stokBarang").val("");
        $("#idLokasiPenyimpanan").val("");
        $("#stokRak").val("");
        $("#inputStokRak").val("");
        $("#kapasitasRak").val("");
        $("#stokBarang").data("stok-awal", 0);
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

  function loadStokOpname(){
      $(document).off("change", "#idBarang");

    // PASANG ulang setelah modal diload
    $(document).on("change", "#idBarang", function () {
        let stokBarang = $(this).find("option:selected").data("stok-barang");

        $("#stokBarang").val(stokBarang);
        $("#stokBarang").data("stok-awal", stokBarang);
    });


$(document).on("input", "#inputStokRak", function () {

    let stokAwal = parseInt($("#stokBarang").data("stok-awal")) || 0;
    let stokBarang = parseInt($("#stokBarang").val()) || stokAwal;

    let stokRak = parseInt($("#stokRak").val()) || 0;

    let kapasitasRak = parseInt($("#kapasitasRak").val()) || 0;
    let inputRak = parseInt($(this).val()) || 0;

    let prevInput = parseInt($(this).data("prev")) || 0;

    // Batasi maksimal kapasitas
    if (inputRak > kapasitasRak) {
        inputRak = kapasitasRak;
        $(this).val(inputRak);
    }

    // Hitung delta
    let selisih = inputRak - prevInput;

    // Update stok
    let stokRakBaru = stokRak + selisih;
    let stokBarangBaru = stokBarang - selisih;

    if (stokRakBaru < 0) stokRakBaru = 0;
    if (stokBarangBaru < 0) stokBarangBaru = 0;

    // Tampilkan hasil
    $("#stokRak").val(stokRakBaru);
    $("#stokBarang").val(stokBarangBaru);

    // Simpan nilai input sebelumnya
    $(this).data("prev", inputRak);
});

  }




  function loadBarang(v = "") {
    
    $.ajax({
      url: `${host}/api/master_barang`,
      type: "GET",
      success: function (res) {
        const list = res.data || [];
        const dropdown = $("#idBarang");

        dropdown.empty();
        dropdown.append(`<option>-- Pilih Barang --</option>`);

         list.forEach(item => {
        dropdown.append(`
          <option 
            value="${item.id_barang}"
            data-stok-barang="${item.stok_barang}"
          >
           ${item.kode_barang} ${item.nama_barang}
          </option>
        `);
      });
         if (v) {
        dropdown.val(String(v)).trigger("change");
        
      }
      },
      error: function () {
        console.error("❌ Gagal load data barang");
      }
    });
  }


 
     

  function loadLokasiPenyimpanan(v = "") {
    
    $.ajax({
      url: `${host}/api/lokasi_penyimpanan`,
      type: "GET",
      success: function (res) {
        const list = res.data || [];
        const dropdown = $("#idLokasiPenyimpanan");

        dropdown.empty();
        dropdown.append(`<option>-- Pilih Lokasi Penyimpanan --</option>`);

        list.forEach(item => {
          dropdown.append(`
            <option value="${item.id_lokasi_penyimpanan}">
              ${item.nama_lokasi_penyimpanan}
            </option>
          `);
        });

         if (v) {
        dropdown.val(String(v)).trigger("change");
      }
      },
      error: function () {
        console.error("❌ Gagal load data barang");
      }
    });
  }


 

});
