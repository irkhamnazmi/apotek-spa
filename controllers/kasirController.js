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
            error: () => alert("❌ Gagal mengambil data kasir!")
        },
        columns: [
            { data: "no_struk" },                     // No Struk
          { data: "username" },                    // Petugas
          { data: "waktu" },                        // Waktu
          { data: "total" },                        // Total
          { data: "nama_jenis_pembayaran" },        // Jenis Pembayaran
          { data: "bayar" },                        // Bayar
          { data: "kembali" },  
            {
                data: null,
                orderable: false,
                render: function (row) {
                    return `
                        <button class="btn btn-sm btn-primary btnEdit" data-id="${row.id_kasir}">Edit</button>
                        <button class="btn btn-sm btn-danger btnHapus" data-id="${row.id_kasir}">Hapus</button>
                    `;
                }
            }
        ]
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

    // ===========================
    //   ORDER LIST
    // ===========================
    let orderList = [];

    function bindModalEvents() {

        // Remove old events
        $(document).off("click", "#btnTambah");
        $(document).off("click", ".btnEdit");
        $(document).off("click", "#btnTambahOrder");
        $(document).off("click", "#btnSimpan");
        $(document).off("input", "#bayar");
        $(document).off("change", "#barangSelect");
        $(document).off("input", "#qtyOrder");

        // ===========================
        //   TAMBAH PESANAN
        // ===========================
        $(document).on("click", "#btnTambah", function () {
            resetFormKasir();
            resetOrderList();
            loadBarangStok();
            loadJenisPembayaran();

          

            // Set waktu default
            $("#waktu").val(new Date().toISOString().slice(0,16));

            $("#modalKasir .modal-title").text("Tambah Pesanan");
            $("#modalKasir").modal("show");
        });

        // ===========================
        //   EDIT PESANAN
        // ===========================
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

                    // Convert TIMESTAMP to datetime-local
                    const waktuLocal = kasir.waktu.replace(" ", "T").substring(0, 16);
                    $("#waktu").val(waktuLocal);

                    // FIX: id_user tidak diinput manual, otomatis ambil dari session
                    $("#jenis_pembayaran").val(kasir.id_jenis_pembayaran);
                    $("#total").val(kasir.total);
                    $("#bayar").val(kasir.bayar);
                    $("#kembali").val(kasir.kembali);

                    // FIX: gunakan id_barang bukan id_order
                    orderList = detail.map(item => ({
                        id_barang: item.id_barang,
                        nama_barang: item.nama_barang,
                        qty: item.qty,
                        subtotal: item.subtotal
                    }));

                    renderOrderTable();

                    $("#btnSimpan").attr("data-id", id_kasir);
                    $("#modalKasir .modal-title").text("Edit Pesanan");
                    $("#modalKasir").modal("show");
                });
            });
        });

        // ===========================
        //   TAMBAH ORDER ITEM
        // ===========================
        $(document).on("click", "#btnTambahOrder", function () {
            const barang = $("#barangSelect")[0];
            const id_barang = barang.value;
            const nama_barang = barang.options[barang.selectedIndex].dataset.nama;
            const harga = parseInt(barang.options[barang.selectedIndex].dataset.harga);

            const qty = parseInt($("#qtyOrder").val());
            const subtotal = qty * harga;

            if (!id_barang) return alert("Pilih barang!");
            if (qty <= 0) return alert("Qty tidak valid!");

            // FIX: API pakai id_barang bukan id_order
            orderList.push({
                id_barang,
                nama_barang,
                qty,
                subtotal
            });

            renderOrderTable();
        });

        // ===========================
        //   HITUNG KEMBALIAN
        // ===========================
        $(document).on("input", "#bayar", function () {
            hitungKembali();
        });

        $(document).on("change", $("#barangSelect"), function () {
            hitungJumlahHarga();
        });

        $(document).on("input", "#qtyOrder", function () {
            hitungJumlahHarga();
        });

        // ===========================
        //   SIMPAN KASIR
        // ===========================
        $(document).on("click", "#btnSimpan", function () {
            const id_kasir = $(this).attr("data-id") || "";

            const waktuInput = $("#waktu").val();
            const waktuMySQL = waktuInput.replace("T", " ") + ":00";

            // FIX: id_user dikirim ke API
            const data = {
                id_kasir,
                id_user: $("#id_user").val(), // FIX
                no_struk: $("#no_struk").val(),
                waktu: waktuMySQL,
                id_jenis_pembayaran: $("#jenis_pembayaran").val(),
                total: parseInt($("#total").val()) || 0,
                bayar: parseInt($("#bayar").val()) || 0,
                kembali: parseInt($("#kembali").val()) || 0,
                kasir_detail: orderList
            };

          console.log(data);
          

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
                    error: function () {
                        alert("❌ Gagal menyimpan data kasir!");
                    }
                });
            });
        });

        // ===========================
        //   HAPUS DATA
        // ===========================
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
                    }
                });
            });
        });
    }

    // ===========================
    //   TABEL ORDER
    // ===========================
    function renderOrderTable() {
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
                        <button class="btn btn-danger btn-sm" onclick="hapusOrder(${i})">Hapus</button>
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

    // ===========================
    //   HITUNG KEMBALIAN
    // ===========================
    function hitungKembali() {
        const total = parseFloat($("#total").val()) || 0;
        const bayar = parseFloat($("#bayar").val()) || 0;
        $("#kembali").val(bayar - total);
    }

    // ===========================
    //   HITUNG JUMLAH HARGA
    // ===========================
    function hitungJumlahHarga() {
        const barang = $("#barangSelect")[0];
        if (!barang) return;

        const harga = parseInt(barang.options[barang.selectedIndex].dataset.harga || 0);
        const qty = parseInt($("#qtyOrder").val()) || 1;
        $("#hargaOrder").val(harga * qty);
    }

    // ===========================
    //   RESET FORM
    // ===========================
    function resetFormKasir() {
        $("#no_struk").val("");
        $("#waktu").val("");
        $("#jenis_pembayaran").val("");
        $("#bayar").val("");
        $("#kembali").val("");
        $("#btnSimpan").removeAttr("data-id");
    }

    // ===========================
    //  LOAD DATA BARANG
    // ===========================
    function loadBarangStok() {
        $.get(`${host}/api/stok_opname`, function (res) {
            let opt = `<option value="">-- Pilih Barang --</option>`;
            res.data.forEach(b => {
                opt += `<option value="${b.id_barang}" data-nama="${b.nama_barang}" data-harga="${b.harga_jual}">
                            ${b.nama_barang} (Stok: ${b.stok_rak})
                        </option>`;
            });
            $("#barangSelect").html(opt);
        });
    }

    // ===========================
    //  LOAD JENIS PEMBAYARAN
    // ===========================
    function loadJenisPembayaran() {
        $.get(`${host}/api/jenis_pembayaran`, function (res) {
            let opt = `<option value="">-- Pilih Jenis Pembayaran --</option>`;
            res.data.forEach(j => {
                opt += `<option value="${j.id_jenis_pembayaran}">${j.nama_jenis_pembayaran}</option>`;
            });
            $("#jenis_pembayaran").html(opt);
        });
    }

});
