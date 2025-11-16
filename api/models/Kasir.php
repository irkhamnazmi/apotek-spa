<?php
require_once __DIR__ . "/../config/Database.php";

class Kasir
{
    private $conn;
    public function __construct()
    {
        $this->conn = Database::getConnection();
    }
    public function getAll()
    {
        $data = [];
        $res = $this->conn->query("SELECT * FROM kasir");
        while ($row = $res->fetch_assoc()) $data[] = $row;
        return $data;
    }
    public function getById($id)
    {
        $id = intval($id);
        $res = $this->conn->query("SELECT * FROM kasir WHERE id_kasir=$id");
        return $res->fetch_assoc();
    }
    public function create($d)
    {
        $stmt = $this->conn->prepare("INSERT INTO kasir(no_struk,id_kasir_detail,total,jenis_pembayaran,bayar,kembali) VALUES (?,?,?,?,?,?)");
        $stmt->bind_param("siiddd", $d['no_struk'], $d['id_kasir_detail'], $d['total'], $d['jenis_pembayaran'], $d['bayar'], $d['kembali']);
        return $stmt->execute();
    }
    public function update($id, $d)
    {
        $stmt = $this->conn->prepare("UPDATE kasir SET no_struk=?,id_kasir_detail=?,total=?,jenis_pembayaran=?,bayar=?,kembali=? WHERE id_kasir=?");
        $stmt->bind_param("siidddi", $d['no_struk'], $d['id_kasir_detail'], $d['total'], $d['jenis_pembayaran'], $d['bayar'], $d['kembali'], $id);
        return $stmt->execute();
    }
    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM kasir WHERE id_kasir=?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
