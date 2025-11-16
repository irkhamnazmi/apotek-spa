<?php
require_once __DIR__ . "/../config/Database.php";

class Users
{
    private $conn;
    public function __construct()
    {
        $this->conn = Database::getConnection();
    }

    public function getAll()
    {
        $data = [];
        $res = $this->conn->query("SELECT * FROM users");
        while ($row = $res->fetch_assoc()) $data[] = $row;
        return $data;
    }

    public function getById($id)
    {
        $id = intval($id);
        $res = $this->conn->query("SELECT * FROM user WHERE id_user=$id");
        return $res->fetch_assoc();
    }

    public function create($d)
    {
        $stmt = $this->conn->prepare("INSERT INTO user (username,password,no_hp,email,alamat,role) VALUES (?,?,?,?,?,?)");
        $stmt->bind_param("ssisss", $d['username'], $d['password'], $d['no_hp'], $d['email'], $d['alamat'], $d['role']);
        return $stmt->execute();
    }

    public function update($id, $d)
    {
        $stmt = $this->conn->prepare("UPDATE user SET username=?,password=?,no_hp=?,email=?,alamat=?,role=? WHERE id_user=?");
        $stmt->bind_param("ssisssi", $d['username'], $d['password'], $d['no_hp'], $d['email'], $d['alamat'], $d['role'], $id);
        return $stmt->execute();
    }

    public function delete($id)
    {
        $stmt = $this->conn->prepare("DELETE FROM user WHERE id_user=?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
