<?php
require_once __DIR__ . "/../config/Database.php";

class Users
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    // ==========================
    // GENERATE NIK OTOMATIS
    // ==========================
    private function generateNik()
    {
        // ambil ID terakhir
        $result = $this->conn->query("SELECT id_user FROM users ORDER BY id_user DESC LIMIT 1");

        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $lastId = intval($row['id_user']) + 1;
        } else {
            $lastId = 1;
        }

        $year = date("y");  // 2 digit tahun
        $month = date("m"); // 2 digit bulan

        return $year . $month . $lastId;
    }

    // ==========================
    // GET ALL USERS
    // ==========================
    public function getAll()
    {
        $data = [];
        $res = $this->conn->query("SELECT * FROM users ORDER BY id_user DESC");
        while ($row = $res->fetch_assoc()) {
            $data[] = $row;
        }
        return $data;
    }

    // ==========================
    // GET USER BY ID
    // ==========================
    public function getById($id)
    {
        $id = intval($id);
        $res = $this->conn->query("SELECT * FROM users WHERE id_user=$id");
        return $res->fetch_assoc();
    }

    // ==========================
    // CREATE USER
    // ==========================
    public function create($d)
    {
        // generate nik jika tidak dikirim
        if (empty($d['nik'])) {
            $d['nik'] = $this->generateNik();
        }

        $stmt = $this->conn->prepare("
            INSERT INTO users 
            (nik, nama_lengkap, username, password, no_hp, email, alamat, role) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->bind_param(
            "ssssssss",
            $d['nik'],
            $d['nama_lengkap'],
            $d['username'],
            $d['password'],
            $d['no_hp'],
            $d['email'],
            $d['alamat'],
            $d['role']
        );

        return $stmt->execute();
    }

    // ==========================
    // UPDATE USER
    // ==========================
    public function update($id, $d)
    {
        // NIK TIDAK BOLEH OTOMATIS SAAT UPDATE → gunakan yang dikirim user
        $stmt = $this->conn->prepare("
            UPDATE users 
            SET nik=?, nama_lengkap=?, username=?, password=?, no_hp=?, email=?, alamat=?, role=? 
            WHERE id_user=?
        ");

        $stmt->bind_param(
            "ssssssssi",
            $d['nik'],
            $d['nama_lengkap'],
            $d['username'],
            $d['password'],
            $d['no_hp'],
            $d['email'],
            $d['alamat'],
            $d['role'],
            $id
        );

        return $stmt->execute();
    }

    // ==========================
    // DELETE USER
    // ==========================
    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM users WHERE id_user=?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
