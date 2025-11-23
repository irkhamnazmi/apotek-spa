$(document).ready(function () {

  const host = `http://localhost:8081/palmirafit`; // Base URL API

   loadModal(
    "#modalContainer",
    `${host}/modals/jenis-pembayaranModal.html`,
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
      url: `${host}/api/jenis_pembayaran`,
      dataSrc: (json) => json.data || [],
      error: () => alert("❌ Gagal mengambil data dari server!")
    },
    columns: [
    { data: "kode_jenis_pembayaran" },
    { data: "nama_jenis_pembayaran" },
    
    
    
  
    
    {
        data: null,
        orderable: false,
        render: function (data, type, row) {
            return `
                <button class="btn btn-sm btn-primary btnEdit"
                        data-id="${row.id_jenis_pembayaran}"
                         data-kode-jenis-pembayaran="${row.kode_jenis_pembayaran}"
                        data-nama-jenis-pembayaran="${row.nama_jenis_pembayaran}"
                    

                       
                >Edit</button>

                <button class="btn btn-sm btn-danger btnHapus" data-id="${row.id_jenis_pembayaran}">
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


    $(document).on("click", "#btnTambah", function () {
      resetForm();
      $("#modalJenisPembayaran .modal-title").text("Tambah Pengguna");
      $("#modalJenisPembayaran").modal("show");
    });


   


    
    $(document).on("click", ".btnEdit", function () {

      // ambil semua data-* dengan dash (-)
        const id = $(this).data("id");
      const kodeJenisPembayaran = $(this).data("kode-jenis-pembayaran");
        const namaJenisPembayaran = $(this).data("nama-jenis-pembayaran");
      
       


        // Isi form
        $("#namaJenisPembayaran").val(namaJenisPembayaran);
    

      $("#modalJenisPembayaran .modal-title").text(`Edit Jenis Pembayaran ${kodeJenisPembayaran}`);

      // Simpan ke button
      $("#btnSimpan").attr("data-id", id);
      $("#btnSimpan").attr("data-kode-jenis-pembayaran", kodeJenisPembayaran);


      $("#modalJenisPembayaran").modal("show");
    });

    // Simpan (Tambah / Edit)
    $(document).on("click", "#btnSimpan", function () {

      const id = $(this).attr("data-id") || null;
      const kodeJenisPembayaran = $(this).attr("data-kode-jenis-pembayaran") || null;



      const data = {
        id_jenis_pembayaran: id,
        kode_jenis_pembayaran: kodeJenisPembayaran,
        nama_jenis_pembayaran: $("#namaJenisPembayaran").val(),
       
      };


      

      

      startProgress().then(() => {

        const method = id ? "PUT" : "POST";
        const url = `${host}/api/jenis_pembayaran`;
        
        console.log(data);


        $.ajax({
          url: url,
          type: method,
          contentType: "application/json",
          data: JSON.stringify(data),
          success: function (res) {
            alert(res.meta?.message || "Berhasil disimpan!");
            $("#modalJenisPembayaran").modal("hide");
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
      console.log(id);
      

      if (!confirm("Yakin ingin menghapus pengguna ini?")) return;

      startProgress().then(() => { 


        $.ajax({
          url: `${host}/api/jenis_pembayaran`,
          type: "DELETE",
          data: { id_jenis_pembayaran: id },
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
     $("#namaJenisPembayaran").val("");
        
    $("#btnSimpan").removeAttr("data-id");
    $("#btnSimpan").removeAttr("data-kode-jenis-pembayaran");

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
