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
        $stmt = $this->conn->prepare("INSERT INTO lokasi_penyimpanan(kode_lokasi_penyimpanan,lokasi_penyimpanan) VALUES (?,?)");
        $stmt->bind_param("ss", $d['kode_lokasi_penyimpanan'], $d['lokasi_penyimpanan']);
        return $stmt->execute();
    }
    public function update($id, $d)
    {
        $stmt = $this->conn->prepare("UPDATE lokasi_penyimpanan SET kode_lokasi_penyimpanan=?, lokasi_penyimpanan=? WHERE id_lokasi_penyimpanan=?");
        $stmt->bind_param("ssi", $d['kode_lokasi_penyimpanan'], $d['lokasi_penyimpanan'], $id);
        return $stmt->execute();
    }
    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM lokasi_penyimpanan WHERE id_lokasi_penyimpanan=?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
