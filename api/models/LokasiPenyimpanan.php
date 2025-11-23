<?php
require_once __DIR__ . "/../config/Database.php";

class LokasiPenyimpanan
{
    private $conn;
    public function __construct()
    {
        $this->conn = Database::getConnection();
    }
    public function getAll()
    {
        $data = [];
        $res = $this->conn->query("SELECT * FROM lokasi_penyimpanan");
        while ($row = $res->fetch_assoc()) $data[] = $row;
        return $data;
    }
    public function getById($id)
    {
        $id = intval($id);
        $res = $this->conn->query("SELECT * FROM lokasi_penyimpanan WHERE id_lokasi_penyimpanan=$id");
        return $res->fetch_assoc();
    }
    public function create($d)
    {

        if (empty($d['kode_lokasi_penyimpanan'])) {
            $d['kode_lokasi_penyimpanan'] = $this->generateKode();
        }
        $stmt = $this->conn->prepare("INSERT INTO lokasi_penyimpanan(kode_lokasi_penyimpanan,nama_lokasi_penyimpanan) VALUES (?,?)");
        $stmt->bind_param("ss", $d['kode_lokasi_penyimpanan'], $d['nama_lokasi_penyimpanan']);
        return $stmt->execute();
    }
    public function update($id, $d)
    {
        $stmt = $this->conn->prepare("UPDATE lokasi_penyimpanan SET kode_lokasi_penyimpanan=?, nama_lokasi_penyimpanan=? WHERE id_lokasi_penyimpanan=?");
        $stmt->bind_param("ssi", $d['kode_lokasi_penyimpanan'], $d['nama_lokasi_penyimpanan'], $id);
        return $stmt->execute();
    }
    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM lokasi_penyimpanan WHERE id_lokasi_penyimpanan=?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }

    public function generateKode()
    {
        $query = "SELECT kode_lokasi_penyimpanan FROM lokasi_penyimpanan ORDER BY id_lokasi_penyimpanan DESC LIMIT 1";
        $result = $this->conn->query($query);

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();

            // Ambil angka di belakang OB
            $lastNumber = intval(substr($row['kode_lokasi_penyimpanan'], 2));

            // Tambah 1
            $newNumber = $lastNumber + 1;
        } else {
            // Jika belum ada data sama sekali
            $newNumber = 1;
        }

        // Format 3 digit
        return "L" . str_pad($newNumber, 3, "0", STR_PAD_LEFT);
    }
}
