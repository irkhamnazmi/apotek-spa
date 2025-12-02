<?php
require_once __DIR__ . "/../config/Database.php";

class Dashboard
{
    private $conn;
    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    public function getAll()
    {
        $year = date('Y');

        // ===============================
        // 1️⃣ DATA KASIR (pendapatan, hpp, laba)
        // ===============================
        $sqlKasir = "
            SELECT 
                MONTH(k.waktu) AS bulan,
                SUM(k.total) AS pendapatan,
                SUM(kd.qty * mb.harga_beli) AS hpp,
                (SUM(k.total) - SUM(kd.qty * mb.harga_beli)) AS laba
            FROM kasir k
            LEFT JOIN kasir_detail kd ON k.id_kasir = kd.id_kasir
            LEFT JOIN stok_opname so ON kd.id_stok_opname = so.id_stok_opname
            LEFT JOIN master_barang mb ON so.id_barang = mb.id_barang
            WHERE YEAR(k.waktu) = $year
            GROUP BY MONTH(k.waktu)
            ORDER BY bulan ASC
        ";

        $resultKasir = $this->conn->query($sqlKasir);
        $kasirData = [];
        while ($row = $resultKasir->fetch_assoc()) {
            $kasirData[] = $row;
        }

        // ===============================
        // 2️⃣ DATA MASTER BARANG (harga beli, dll)
        // ===============================
        $sqlTotal = "SELECT SUM(harga_beli) AS harga_beli FROM master_barang";
        $resultBarang = $this->conn->query($sqlTotal);
        $barangData = [];
        while ($row = $resultBarang->fetch_assoc()) {
            $barangData[] = $row;
        }

        // ===============================
        // 3️⃣ RETURN JSON TERBAGI 2
        // ===============================
        return [
            "kasir" => $kasirData,
            "master_barang" => $barangData
        ];
    }
}
