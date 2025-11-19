<?php
require_once __DIR__ . "/../config/Database.php";

class MasterBarang
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    public function getAll()
    {
        $data = [];
        $result = $this->conn->query("SELECT * FROM master_barang");
        while ($row = $result->fetch_assoc()) $data[] = $row;
        return $data;
    }

    public function getById($id)
    {
        $id = intval($id);
        $result = $this->conn->query("SELECT * FROM master_barang WHERE id_barang=$id");
        return $result->fetch_assoc();
    }

    /**
     * AUTO GENERATE KODE BARANG
     * Format: OB001, OB002, OB003 ...
     */
    public function generateKodeBarang()
    {
        $query = "SELECT kode_barang FROM master_barang ORDER BY id_barang DESC LIMIT 1";
        $result = $this->conn->query($query);

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();

            // Ambil angka di belakang OB
            $lastNumber = intval(substr($row['kode_barang'], 2));

            // Tambah 1
            $newNumber = $lastNumber + 1;
        } else {
            // Jika belum ada data sama sekali
            $newNumber = 1;
        }

        // Format 3 digit
        return "OB" . str_pad($newNumber, 3, "0", STR_PAD_LEFT);
    }

    public function create($d)
    {
        // Jika kode_barang kosong, generate otomatis
        if (empty($d['kode_barang'])) {
            $d['kode_barang'] = $this->generateKodeBarang();
        }

        $stmt = $this->conn->prepare("INSERT INTO master_barang 
            (kode_barang, nama_barang, id_satuan, harga_beli, harga_jual, stok_minimum, stok_barang, tgl_kadaluarsa)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param(
            "ssiddiis",
            $d['kode_barang'],
            $d['nama_barang'],
            $d['id_satuan'],
            $d['harga_beli'],
            $d['harga_jual'],
            $d['stok_minimum'],
            $d['stok_barang'],
            $d['tgl_kadaluarsa']
        );
        return $stmt->execute();
    }

    public function update($id, $d)
    {
        $stmt = $this->conn->prepare("UPDATE master_barang SET 
            kode_barang=?, nama_barang=?, id_satuan=?, harga_beli=?, harga_jual=?, stok_minimum=?, stok_barang=?, tgl_kadaluarsa=? 
            WHERE id_barang=?");
        $stmt->bind_param(
            "ssiddiisi",
            $d['kode_barang'],
            $d['nama_barang'],
            $d['id_satuan'],
            $d['harga_beli'],
            $d['harga_jual'],
            $d['stok_minimum'],
            $d['stok_barang'],
            $d['tgl_kadaluarsa'],
            $id
        );
        return $stmt->execute();
    }

    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM master_barang WHERE id_barang=?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
