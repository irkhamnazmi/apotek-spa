$(document).ready(function () {
  const host = `http://localhost:8081/palmirafit`;

  // ===========================
  //   DATA TABLE KASIR
  // ===========================
  const table = $("#dataTable").DataTable({
    pageLength: parseInt($("#customLength").val()) || 10,
    responsive: true,
    dom: "rtip",
    ajax: {
      url: `${host}/api/kasir`,
      dataSrc: (json) => json.data || [],
      error: () => alert("❌ Gagal mengambil data kasir!"),
    },
    columns: [
      { data: "no_struk" },
      { data: "username" },
      { data: "waktu" },
      {
        data: "total",

        render: function (data) {
          return formatRupiah(data);
        },
      },
      { data: "nama_jenis_pembayaran" },
      {
        data: "bayar",

        render: function (data) {
          return formatRupiah(data);
        },
      },
      {
        data: "kembali",
        render: function (data) {
          return formatRupiah(data);
        },
      },
      {
        data: null,
        orderable: false,
        render: function (row) {
          return `
                        <button class="btn btn-sm btn-primary btnDetail" data-id="${row.id_kasir}">Detail</button>
                    `;
        },
      },
    ],
  });

  // Custom search
  $("#customSearch").on("keyup", function () {
    table.search(this.value).draw();
  });

  // Custom show entries
  $("#customLength").on("change", function () {
    table.page.len(this.value).draw();
  });

  // ===========================
  //   LOAD MODAL
  // ===========================
  loadModal(
    "#modalContainer",
    `${host}/modals/kasirModal.html`,
    "#modalProgressContainer",
    `${host}/modals/progressModal.html`,
    function () {
      bindModalEvents();
    }
  );

  // ORDER LIST untuk frontend
  let orderList = [];

  // ===========================
  //     BIND MODAL EVENTS
  // ===========================
  function bindModalEvents() {
    $(document).off();

    // BUTTON TAMBAH
    $(document).on("click", "#btnTambah", async function () {
      $("#struk").hide();
      $("#orderList").show();
      $("#btnPrint").hide();
      await loadJenisPembayaran();

      $("#jenis_pembayaran").trigger("change").prop("disabled", false);

      resetFormKasir();
      resetOrderList();
      loadBarangStok();
      loadJenisPembayaran();
      renderOrderTable(false);

      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      $("#waktu").val(now.toISOString().slice(0, 16));
      $("#modalKasir .modal-title").text("Tambah Pesanan");
      $("#modalKasir").modal("show");
    });

    // BUTTON EDIT
    $(document).on("click", ".btnEdit", function () {
      const id_kasir = $(this).data("id");

      startProgress().then(() => {
        $.get(`${host}/api/kasir`, { id_kasir }, function (res) {
          const kasir = res.data.kasir;
          const detail = res.data.order;

          resetOrderList();
          loadBarangStok();
          loadJenisPembayaran();

          $("#no_struk").val(kasir.no_struk);

          const waktuLocal = kasir.waktu.replace(" ", "T").substring(0, 16);
          $("#waktu").val(waktuLocal);

          $("#jenis_pembayaran").val(kasir.id_jenis_pembayaran);
          $("#total").val(kasir.total);
          $("#bayar").val(kasir.bayar);
          $("#kembali").val(kasir.kembali);

          // MASUKKAN ORDER DETAIL
          orderList = detail.map((item) => ({
            id_kasir_detail: item.id_kasir_detail, // untuk update
            id_stok_opname: item.id_stok_opname,
            nama_barang: item.nama_barang, // display saja
            qty: item.qty,
            subtotal: item.subtotal,
          }));

          renderOrderTable(false);

          $("#btnSimpan").attr("data-id", id_kasir);
          $("#modalKasir .modal-title").text("Edit Pesanan");
          $("#modalKasir").modal("show");
        });
      });
    });

    // BUTTON TAMBAH ORDER
    $(document).on("click", "#btnTambahOrder", function () {
      const barang = $("#barangSelect")[0];

      const id_stok_opname = barang.value;
      const nama_barang = barang.options[barang.selectedIndex].dataset.nama;
      const harga = parseInt(
        barang.options[barang.selectedIndex].dataset.harga
      );

      const qty = parseInt($("#qtyOrder").val());
      const subtotal = qty * harga;

      if (!id_stok_opname) return alert("Pilih barang!");
      if (qty <= 0) return alert("Qty tidak valid!");

      orderList.push({
        id_kasir_detail: null, // item baru
        id_stok_opname,
        nama_barang,
        qty,
        subtotal,
      });

      renderOrderTable();
    });

    // HITUNG KEMBALIAN
    $(document).on("input", "#bayar", function () {
      hitungKembali();
    });

    $(document).on("input", "#qtyOrder", function () {
      hitungJumlahHarga();
    });

    $(document).on("change", "#barangSelect", function () {
      hitungJumlahHarga();
    });

    // ===========================
    //         SIMPAN
    // ===========================
    $(document).on("click", "#btnSimpan", function () {
      const id_kasir = $(this).attr("data-id") || "";

      const waktuInput = $("#waktu").val();
      const waktuMySQL = waktuInput.replace("T", " ") + ":00";

      // ================================
      //   FORMAT KASIR_DETAIL BENAR
      // ================================
      const kasir_detail = orderList.map((i) => ({
        id_kasir_detail: i.id_kasir_detail ?? null,
        id_stok_opname: i.id_stok_opname,
        qty: i.qty,
        subtotal: i.subtotal,
      }));

      const data = {
        id_kasir,
        id_user: 4,
        no_struk: $("#no_struk").val() || "",
        waktu: waktuMySQL,
        id_jenis_pembayaran: $("#jenis_pembayaran").val(),
        total: parseInt($("#total").val()) || 0,
        bayar: parseInt($("#bayar").val()) || 0,
        kembali: parseInt($("#kembali").val()) || 0,
        kasir_detail,
      };

      console.log("KIRIM:", data);

      startProgress().then(() => {
        $.ajax({
          url: `${host}/api/kasir`,
          type: id_kasir ? "PUT" : "POST",
          contentType: "application/json",
          data: JSON.stringify(data),
          success: function () {
            alert("Berhasil disimpan!");
            $("#modalKasir").modal("hide");
            table.ajax.reload();
          },
          error: function (xhr) {
            console.log(xhr.responseText);
            alert("❌ Gagal menyimpan data kasir!");
          },
        });
      });
    });

    // BUTTON HAPUS
    $("#dataTable tbody").on("click", ".btnHapus", function () {
      const id = $(this).data("id");
      if (!confirm("Yakin ingin menghapus pesanan ini?")) return;

      startProgress().then(() => {
        $.ajax({
          url: `${host}/api/kasir`,
          type: "DELETE",
          data: { id_kasir: id },
          success: function () {
            alert("Berhasil dihapus!");
            table.ajax.reload();
          },
          error: function () {
            alert("❌ Gagal menghapus data!");
          },
        });
      });
    });

    $(document).on("click", ".btnDetail", async function () {
      $("#struk").show();
      $("#btnPrint").show();

      $("#orderList").hide();
      const id_kasir = $(this).data("id");
      console.log("Load Detail Kasir ID:", id_kasir);

      try {
        const res = await $.get(`${host}/api/kasir`, { id_kasir });

        console.log("RAW RESPONSE:", res);

        if (!res || !res.meta || res.meta.code !== 200) {
          alert("❌ Data kasir tidak ditemukan!");
          return;
        }

        const kasir = res.data.kasir;
        const detail = res.data.order;

        if (!kasir) {
          alert("❌ Header kasir kosong!");
          return;
        }

        resetFormKasir();
        resetOrderList();

        // ====== PASTIKAN SELECT TERISI DULU ======
        await loadJenisPembayaran();

        // ====== SET NILAI HEADER ======
        $("#no_struk").val(kasir.no_struk).prop("readonly", true);

        let waktuFix = kasir.waktu
          ? kasir.waktu.replace(" ", "T").substring(0, 16)
          : "";
        $("#waktu").val(waktuFix).prop("readonly", true);

        $("#jenis_pembayaran")
          .val(String(kasir.id_jenis_pembayaran))
          .trigger("change")
          .prop("disabled", true);

        $("#total").val(kasir.total).prop("readonly", true);
        $("#bayar").val(kasir.bayar).prop("readonly", true);
        $("#kembali").val(kasir.kembali).prop("readonly", true);

        // ====== DETAIL ORDER ======
        orderList = detail.map((item) => ({
          id_stok_opname: item.id_stok_opname,
          nama_barang: item.nama_barang,
          qty: item.qty,
          harga_jual: item.harga_jual,
          subtotal: item.subtotal,
        }));

        renderOrderTable(true);

        $("#modalKasir .modal-title").text("Detail Pesanan  " + kasir.no_struk);
        $("#btnSimpan").hide();
        $("#btnPrint").data("id", id_kasir);
          
        $("#modalKasir").modal("show");
      } catch (err) {
        console.error(err);
        alert("❌ Terjadi kesalahan!");
      }
    });
      
      $(document).on("click", "#btnPrint", function () {
    const id_kasir = $(this).data("id");

    if (!id_kasir) {
        alert("❌ ID Kasir tidak ditemukan!");
        return;
    }

    // Buka halaman struk dengan parameter id_kasir
 window.open(`${host}/reports/struk.html?id_kasir=${id_kasir}`, "_blank");


});

  } // END BIND EVENTS

  // ===========================
  //   RENDER TABEL ORDER
  // ===========================
  function renderOrderTable(readOnly = false) {
    let tbody = "";
    let total = 0;

    orderList.forEach((item, i) => {
      total += parseInt(item.subtotal);

      tbody += `
            <tr>
                <td>${i + 1}</td>
                <td>${item.nama_barang}</td>
                <td>${item.qty}</td>
                <td>${item.subtotal}</td>
                <td>
                    ${
                      readOnly
                        ? ""
                        : `<button class="btn btn-danger btn-sm" onclick="hapusOrder(${i})">Hapus</button>`
                    }
                </td>
            </tr>
        `;
    });

    $("#bodyOrder").html(tbody);
    $("#total").val(total);
    hitungKembali();
  }
  window.hapusOrder = function (i) {
    orderList.splice(i, 1);
    renderOrderTable();
  };

  function resetOrderList() {
    orderList = [];
    $("#bodyOrder").empty();
    $("#total").val(0);
    $("#bayar").val("");
    $("#kembali").val("");
  }

  function hitungKembali() {
    const total = parseFloat($("#total").val()) || 0;
    const bayar = parseFloat($("#bayar").val()) || 0;
    $("#kembali").val(bayar - total);
  }

  function hitungJumlahHarga() {
    const barang = $("#barangSelect")[0];
    if (!barang) return;

    const harga = parseInt(
      barang.options[barang.selectedIndex].dataset.harga || 0
    );
    const qty = parseInt($("#qtyOrder").val()) || 1;
    $("#hargaOrder").val(harga * qty);
  }

  function resetFormKasir() {
    $("#no_struk").val("");
    $("#waktu").val("");
    $("#jenis_pembayaran").val("");
    $("#bayar").val("");
    $("#kembali").val("");
    $("#btnSimpan").removeAttr("data-id");
  }

  function loadBarangStok() {
    $.get(`${host}/api/stok_opname`, function (res) {
      let opt = `<option value="">-- Pilih Barang --</option>`;
      res.data.forEach((b) => {
        opt += `
                    <option value="${b.id_stok_opname}"
                        data-nama="${b.nama_barang}" 
                        data-harga="${b.harga_jual}">
                        ${b.nama_barang} (Stok: ${b.stok_rak})
                    </option>`;
      });
      $("#barangSelect").html(opt);
    });
  }

  function loadJenisPembayaran() {
    return new Promise((resolve, reject) => {
      $.get(`${host}/api/jenis_pembayaran`, function (res) {
        let opt = `<option value="">-- Pilih Jenis Pembayaran --</option>`;
        res.data.forEach((j) => {
          opt += `<option value="${j.id_jenis_pembayaran}">${j.nama_jenis_pembayaran}</option>`;
        });

        $("#jenis_pembayaran").html(opt);

        resolve();
      }).fail(reject);
    });
  }

  function startProgress() {
    return new Promise((resolve) => {
      let val = 0;
      updateProgress(0);
      $("#modalProgress")
        .modal({
          backdrop: "static",
          keyboard: false,
        })
        .modal("show");

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

  function formatRupiah(angka) {
    if (!angka) return "Rp 0";
    return (
      "Rp " +
      Number(angka).toLocaleString("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    );
  }
});
