$(document).ready(function () {

  const host = `http://localhost:8081/palmirafit`; // Base URL API



  $.ajax({
    url: `${host}/api/dashboard`, // endpoint API summary data
    type: "GET",
    dataType: "json",

    success: function (res) {
      if (res.meta.code === 200 && res.meta.status === "success") {
        const currentMonth = new Date().getMonth() + 1; // Januari = 0, jadi +1

        // Cari data bulan ini
        // const bulanIni = res.data.find(item => parseInt(item.bulan) === currentMonth);

            $("#penjualanValue").text(formatRupiah(res.data.kasir[0]['pendapatan']));
          $("#pembelianValue").text(formatRupiah(res.data.master_barang[0]['harga_beli']));
        
        // if (bulanIni) {
        //   // Update nilai di UI
        //   $("#penjualanValue").text(formatRupiah(bulanIni.pendapatan));
        //   $("#pembelianValue").text(formatRupiah(bulanIni.hpp));
        // } else {
        //   // Jika tidak ada data bulan ini, set default 0
        //   $("#penjualanValue").text("Rp 0,-");
        //   $("#pembelianValue").text("Rp 0,-");
        // }
      } else {
        alert("Gagal memuat data dashboard!");
      }
    },
    error: function () {
      alert("Terjadi kesalahan saat memuat data!");
    }
  });

  function formatRupiah(angka) {
    if (!angka) return "Rp 0,-";
    return "Rp " + Number(angka).toLocaleString("id-ID") + ",-";
  }


});
