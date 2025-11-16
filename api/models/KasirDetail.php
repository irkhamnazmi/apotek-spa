<?php
require_once __DIR__ . "/../config/Database.php";

class KasirDetail
{
    private $conn;
    public function __construct()
    {
        $this->conn = Database::getConnection();
    }
    public function getAll()
    {
        $data = [];
        $res = $this->conn->query("SELECT * FROM kasir_detail");
        while ($row = $res->fetch_assoc()) $data[] = $row;
        return $data;
    }
    public function getById($id)
    {
        $id = intval($id);
        $res = $this->conn->query("SELECT * FROM kasir_detail WHERE id_kasir_detail=$id");
        return $res->fetch_assoc();
    }
    public function create($d)
    {
        $stmt = $this->conn->prepare("INSERT INTO kasir_detail(id_order,subtotal) VALUES (?,?)");
        $stmt->bind_param("ii", $d['id_order'], $d['subtotal']);
        return $stmt->execute();
    }
    public function update($id, $d)
    {
        $stmt = $this->conn->prepare("UPDATE kasir_detail SET id_order=?,subtotal=? WHERE id_kasir_detail=?");
        $stmt->bind_param("iii", $d['id_order'], $d['subtotal'], $id);
        return $stmt->execute();
    }
    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM kasir_detail WHERE id_kasir_detail=?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
