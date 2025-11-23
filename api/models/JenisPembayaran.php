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

        if (empty($d['kode_jenis_pembayaran'])) {
            $d['kode_jenis_pembayaran'] = $this->generateKode();
        }
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

    public function generateKode()
    {
        $query = "SELECT kode_jenis_pembayaran FROM jenis_pembayaran ORDER BY id_jenis_pembayaran DESC LIMIT 1";
        $result = $this->conn->query($query);

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();


            $lastNumber = intval(substr($row['kode_jenis_pembayaran'], 2));

            // Tambah 1
            $newNumber = $lastNumber + 1;
        } else {

            $newNumber = 1;
        }

        // Format 3 digit
        return "JP" . str_pad($newNumber, 3, "0", STR_PAD_LEFT);
    }
}
