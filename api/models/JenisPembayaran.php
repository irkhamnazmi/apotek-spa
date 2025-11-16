<?php
require_once __DIR__ . "/../config/Database.php";

class JenisPembayaran
{
    private $conn;
    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    public function getAll()
    {
        $data = [];
        $res = $this->conn->query("SELECT * FROM jenis_pembayaran");
        while ($row = $res->fetch_assoc()) $data[] = $row;
        return $data;
    }
    public function getById($id)
    {
        $id = intval($id);
        $res = $this->conn->query("SELECT * FROM jenis_pembayaran WHERE id_jenis_pembayaran=$id");
        return $res->fetch_assoc();
    }
    public function create($d)
    {
        $stmt = $this->conn->prepare("INSERT INTO jenis_pembayaran(kode_jenis_pembayaran,nama_jenis_pembayaran) VALUES (?,?)");
        $stmt->bind_param("ss", $d['kode_jenis_pembayaran'], $d['nama_jenis_pembayaran']);
        return $stmt->execute();
    }
    public function update($id, $d)
    {
        $stmt = $this->conn->prepare("UPDATE jenis_pembayaran SET kode_jenis_pembayaran=?, nama_jenis_pembayaran=? WHERE id_jenis_pembayaran=?");
        $stmt->bind_param("ssi", $d['kode_jenis_pembayaran'], $d['nama_jenis_pembayaran'], $id);
        return $stmt->execute();
    }
    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM jenis_pembayaran WHERE id_jenis_pembayaran=?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
