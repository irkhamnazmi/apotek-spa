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
      url: `${host}/api/satuan`,
      dataSrc: (json) => json.data || [],
      error: () => alert("❌ Gagal mengambil data dari server!")
    },
    columns: [
    { data: "kode_satuan" },
    { data: "nama_satuan" },
    
    
  
    
    {
        data: null,
        orderable: false,
        render: function (data, type, row) {
            return `
                <button class="btn btn-sm btn-primary btnEdit"
                        data-id="${row.id_satuan}"
                        data-kode-satuan="${row.kode_satuan}"
                        data-nama-satuan="${row.nama_satuan}"

                       


                       
                ><i class="fa fa-edit"></i></button>

                <button class="btn btn-sm btn-danger btnHapus" data-id="${row.id_satuan}">
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

  loadModal(
    "#modalContainer",
    `${host}/modals/satuanModal.html`,
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
      $("#modalSatuan .modal-title").text("Tambah Satuan");
      $("#modalSatuan").modal("show");
    });


   


    
    $(document).on("click", ".btnEdit", function () {

      // ambil semua data-* dengan dash (-)
        const id = $(this).data("id");
        const kodeSatuan = $(this).data("kode-satuan");
        const namaSatuan = $(this).data("nama-satuan");
       


        // Isi form
        $("#namaSatuan").val(namaSatuan);
        

      $("#modalSatuan .modal-title").text(`Edit Satuan ${kodeSatuan}`);

      // Simpan ke button
      $("#btnSimpan").attr("data-id", id);
      $("#btnSimpan").attr("data-kode-satuan", kodeSatuan);


      $("#modalSatuan").modal("show");
    });

    // Simpan (Tambah / Edit)
    $(document).on("click", "#btnSimpan", function () {

      const id = $(this).attr("data-id") || null;
      const kodeSatuan = $(this).attr("data-kode-satuan") || null;


      const data = {
        id_satuan: id,
        kode_satuan: kodeSatuan,
        nama_satuan: $("#namaSatuan").val(),
      };


      

      

      startProgress().then(() => {

        const method = id ? "PUT" : "POST";
        const url = `${host}/api/satuan`;
        
        console.log(data);


        $.ajax({
          url: url,
          type: method,
          contentType: "application/json",
          data: JSON.stringify(data),
          success: function (res) {
            alert(res.meta?.message || "Berhasil disimpan!");
            $("#modalSatuan").modal("hide");
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

      if (!confirm("Yakin ingin menghapus satuan ini?")) return;

      startProgress().then(() => { 


        $.ajax({
          url: `${host}/api/satuan`,
          type: "DELETE",
          data: { id_satuan: id },
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
        $("#namaSatuan").val("");
        

    $("#btnSimpan").removeAttr("data-id");
    $("#btnSimpan").removeAttr("data-kode-satuan");
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
