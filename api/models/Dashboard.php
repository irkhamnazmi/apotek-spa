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
        $sql = "
        SELECT 
            MONTH(k.waktu) AS bulan,

            -- Total pendapatan kasir
            SUM(k.total) AS pendapatan,

            -- Total modal (HPP)
            SUM(kd.qty * mb.harga_beli) AS hpp,

            -- Laba kotor
            (SUM(k.total) - SUM(kd.qty * mb.harga_beli)) AS laba

        FROM kasir k
        LEFT JOIN kasir_detail kd ON k.id_kasir = kd.id_kasir
        LEFT JOIN stok_opname so ON kd.id_stok_opname = so.id_stok_opname
        LEFT JOIN master_barang mb ON so.id_barang = mb.id_barang

        WHERE YEAR(k.waktu) = $year

        GROUP BY MONTH(k.waktu)
        ORDER BY bulan ASC
    ";

        $result = $this->conn->query($sql);

        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }

        return $data;
    }
}
