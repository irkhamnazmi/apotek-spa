<?php
require_once __DIR__ . "/../config/Database.php";

class StokOpname
{
    private $conn;
    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    public function getAll()
    {
        $data = [];
        $res = $this->conn->query("SELECT * FROM stok_opname");
        while ($row = $res->fetch_assoc()) $data[] = $row;
        return $data;
    }
    public function getById($id)
    {
        $id = intval($id);
        $res = $this->conn->query("SELECT * FROM stok_opname WHERE id_stok_opname=$id");
        return $res->fetch_assoc();
    }
    public function create($d)
    {
        $stmt = $this->conn->prepare("INSERT INTO stok_opname(id_barang,id_lokasi_penyimpanan,stok_rak,kapasitas_rak) VALUES (?,?,?,?)");
        $stmt->bind_param("iiii", $d['id_barang'], $d['id_lokasi_penyimpanan'], $d['stok_rak'], $d['kapasitas_rak']);
        return $stmt->execute();
    }
    public function update($id, $d)
    {
        $stmt = $this->conn->prepare("UPDATE stok_opname SET id_barang=?,id_lokasi_penyimpanan=?,stok_rak=?,kapasitas_rak=? WHERE id_stok_opname=?");
        $stmt->bind_param("iiiii", $d['id_barang'], $d['id_lokasi_penyimpanan'], $d['stok_rak'], $d['kapasitas_rak'], $id);
        return $stmt->execute();
    }
    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM stok_opname WHERE id_stok_opname=?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
