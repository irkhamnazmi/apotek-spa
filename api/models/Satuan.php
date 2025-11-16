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
        $stmt = $this->conn->prepare("INSERT INTO satuan (kode_barang, nama_satuan) VALUES (?, ?)");
        $stmt->bind_param("si", $data['kode_barang'], $data['nama_satuan']);
        return $stmt->execute();
    }

    public function update($id, $data)
    {
        $stmt = $this->conn->prepare("UPDATE satuan SET kode_barang=?, nama_satuan=? WHERE id_satuan=?");
        $stmt->bind_param("sii", $data['kode_barang'], $data['nama_satuan'], $id);
        return $stmt->execute();
    }

    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM satuan WHERE id_satuan=?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
