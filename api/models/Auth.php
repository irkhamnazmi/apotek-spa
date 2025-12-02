<?php

require_once __DIR__ . "/../config/Database.php";

class Auth
{
    private $db;

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    public function getByEmail($email)
    {
        $q = $this->db->prepare("SELECT * FROM users WHERE email = ?");
        $q->execute([$email]);
        return $q->fetch(PDO::FETCH_ASSOC);
    }

    public function create($email, $password)
    {
        $q = $this->db->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
        return $q->execute([$email, $password]);
    }
}
