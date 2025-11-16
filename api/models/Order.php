<?php
require_once __DIR__ . "/../config/Database.php";

class OrderModel
{
    private $conn;
    public function __construct()
    {
        $this->conn = Database::getConnection();
    }
    public function getAll()
    {
        $data = [];
        $res = $this->conn->query("SELECT * FROM `order`");
        while ($row = $res->fetch_assoc()) $data[] = $row;
        return $data;
    }
    public function getById($id)
    {
        $id = intval($id);
        $res = $this->conn->query("SELECT * FROM `order` WHERE id_order=$id");
        return $res->fetch_assoc();
    }
    public function create($d)
    {
        $stmt = $this->conn->prepare("INSERT INTO `order`(id_barang,qty,jumlah_harga) VALUES(?,?,?)");
        $stmt->bind_param("iid", $d['id_barang'], $d['qty'], $d['jumlah_harga']);
        return $stmt->execute();
    }
    public function update($id, $d)
    {
        $stmt = $this->conn->prepare("UPDATE `order` SET id_barang=?,qty=?,jumlah_harga=? WHERE id_order=?");
        $stmt->bind_param("iidi", $d['id_barang'], $d['qty'], $d['jumlah_harga'], $id);
        return $stmt->execute();
    }
    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM `order` WHERE id_order=?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
