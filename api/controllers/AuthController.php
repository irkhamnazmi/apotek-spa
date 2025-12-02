<?php
require_once __DIR__ . "/../models/Auth.php";
require_once __DIR__ . "/../helpers/Response.php";

class AuthController
{
    public $model;

    public function __construct()
    {
        $this->model = new Auth();
    }

    // ============================
    // LOGIN
    // ============================
    public function login()
    {
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';

        if (!$email || !$password) {
            return Response::error("Email dan password wajib diisi");
        }

        // ambil user berdasarkan email
        $user = $this->model->getByEmail($email);

        if (!$user) {
            return Response::error("Email tidak ditemukan");
        }

        // cek password hash
        if (!password_verify($password, $user['password'])) {
            return Response::error("Password salah");
        }

        // sukses
        return Response::success([
            "message" => "Login berhasil",
            "user" => $user
        ]);
    }

    // ============================
    // REGISTER
    // ============================
    public function register()
    {
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';

        if (!$email || !$password) {
            return Response::error("Email dan password wajib diisi");
        }

        // cek email unique
        if ($this->model->getByEmail($email)) {
            return Response::error("Email sudah terdaftar");
        }

        // simpan user baru
        $hash = password_hash($password, PASSWORD_DEFAULT);

        $this->model->create($email, $hash);

        return Response::success([
            "message" => "Registrasi berhasil"
        ]);
    }

    // ============================
    // GET USER INFO
    // ============================
    public function me()
    {
        if (!isset($_GET['email'])) {
            return Response::error("Email diperlukan");
        }

        $user = $this->model->getByEmail($_GET['email']);

        if (!$user) {
            return Response::error("User tidak ditemukan");
        }

        return Response::success($user);
    }

    // ============================
    // LOGOUT
    // ============================
    public function logout()
    {
        return Response::success([
            "message" => "Logout berhasil"
        ]);
    }
}
