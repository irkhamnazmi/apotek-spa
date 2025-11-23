<?php
require_once __DIR__ . "/../config/Database.php";

class Satuan
{
    private $conn;
    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    public function getAll()
    {
        $data = [];
        $result = $this->conn->query("SELECT * FROM satuan");
        while ($row = $result->fetch_assoc()) $data[] = $row;
        return $data;
    }

    public function getById($id)
    {
        $id = intval($id);
        $result = $this->conn->query("SELECT * FROM satuan WHERE id_satuan=$id");
        return $result->fetch_assoc();
    }

    public function create($data)
    {

        if (empty($data['kode_satuan'])) {
            $data['kode_satuan'] = $this->generateKodeBarang();
        }
        $stmt = $this->conn->prepare("INSERT INTO satuan (kode_satuan, nama_satuan) VALUES (?, ?)");
        $stmt->bind_param("ss", $data['kode_satuan'], $data['nama_satuan']);
        return $stmt->execute();
    }

    public function update($id, $data)
    {
        $stmt = $this->conn->prepare("UPDATE satuan SET kode_satuan=?, nama_satuan=? WHERE id_satuan=?");
        $stmt->bind_param("ssi", $data['kode_satuan'], $data['nama_satuan'], $id);
        return $stmt->execute();
    }

    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM satuan WHERE id_satuan=?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }

    public function generateKodeBarang()
    {
        $query = "SELECT kode_satuan FROM satuan ORDER BY id_satuan DESC LIMIT 1";
        $result = $this->conn->query($query);

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();


            $lastNumber = intval(substr($row['kode_satuan'], 2));

            // Tambah 1
            $newNumber = $lastNumber + 1;
        } else {

            $newNumber = 1;
        }

        // Format 3 digit
        return "S" . str_pad($newNumber, 3, "0", STR_PAD_LEFT);
    }
}
