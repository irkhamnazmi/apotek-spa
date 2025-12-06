$(document).ready(function () {



   loadModal(
    "#modalContainer",
    `${host}/modals/lokasi-penyimpananModal.html`,
    "#modalProgressContainer",
    `${host}/modals/progressModal.html`,
    function(modal) {
        bindModalEvents(); // bind event setelah modal ada
       
    }
);

  // ===========================
  //   DATA TABLE
  // ===========================
  const table = $("#dataTable").DataTable({
    pageLength: parseInt($("#customLength").val()) || 10,
    responsive: true,
    dom: 'rtip',
    ajax: {
      url: `${host}/api/lokasi_penyimpanan`,
      dataSrc: (json) => json.data || [],
      error: () => alert("❌ Gagal mengambil data dari server!")
    },
    columns: [
    { data: "kode_lokasi_penyimpanan" },
    { data: "nama_lokasi_penyimpanan" },
    
    
  
    
    {
        data: null,
        orderable: false,
        render: function (data, type, row) {
            return `
                <button class="btn btn-sm btn-primary btnEdit"
                        data-id="${row.id_lokasi_penyimpanan}"
                        data-kode-lokasi-penyimpanan="${row.kode_lokasi_penyimpanan}"
                        data-nama-lokasi-penyimpanan="${row.nama_lokasi_penyimpanan}"


                       
                ><i class="fa fa-edit"></i></button>

                <button class="btn btn-sm btn-danger btnHapus" data-id="${row.id_lokasi_penyimpanan}">
                    <i class="fa fa-trash"></i>
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


    $(document).on("click", "#btnTambah", function () {
      resetForm();
      $("#modalLokasiPenyimpanan .modal-title").text("Tambah Lokasi Penyimpanan");
      $("#modalLokasiPenyimpanan").modal("show");
    });


   


    
    $(document).on("click", ".btnEdit", function () {

      // ambil semua data-* dengan dash (-)
        const id = $(this).data("id");
        const kodeLokasiPenyimpanan = $(this).data("kode-lokasi-penyimpanan");
        const namaLokasiPenyimpanan = $(this).data("nama-lokasi-penyimpanan");
        

        // Isi form
        $("#namaLokasiPenyimpanan").val(namaLokasiPenyimpanan);
     

      $("#modalLokasiPenyimpanan .modal-title").text(`Edit Lokasi Penyimpanan ${kodeLokasiPenyimpanan}`);

      // Simpan ke button
      $("#btnSimpan").attr("data-id", id);
      $("#btnSimpan").attr("data-kode-lokasi-penyimpanan", kodeLokasiPenyimpanan);

      $("#modalLokasiPenyimpanan").modal("show");
    });

    // Simpan (Tambah / Edit)
    $(document).on("click", "#btnSimpan", function () {

      const id = $(this).attr("data-id") || null;
      const kodeLokasiPenyimpanan = $(this).attr("data-kode-lokasi-penyimpanan") || "";


      const data = {
        id_lokasi_penyimpanan: id,
        kode_lokasi_penyimpanan: kodeLokasiPenyimpanan,
        nama_lokasi_penyimpanan: $("#namaLokasiPenyimpanan").val(),
        
      };


      

      

      startProgress().then(() => {

        const method = id ? "PUT" : "POST";
        const url = `${host}/api/lokasi_penyimpanan`;
        
        console.log(data);


        $.ajax({
          url: url,
          type: method,
          contentType: "application/json",
          data: JSON.stringify(data),
          success: function (res) {
            alert(res.meta?.message || "Berhasil disimpan!");
            $("#modalLokasiPenyimpanan").modal("hide");
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

      if (!confirm("Yakin ingin menghapus pengguna ini?")) return;

      startProgress().then(() => { 


        $.ajax({
          url: `${host}/api/lokasi_penyimpanan`,
          type: "DELETE",
          data: { id_lokasi_penyimpanan: id },
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
     $("#namaLokasiPenyimpanan").val("");

    $("#btnSimpan").removeAttr("data-id");
    $("#btnSimpan").removeAttr("data-kode-lokasi-penyimpanan");
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


});
