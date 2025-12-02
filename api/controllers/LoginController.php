<?php

require_once __DIR__ . "/../models/Login.php";
require_once __DIR__ . "/../helpers/Response.php";

class LoginController
{
    public $model;

    public function __construct()
    {
        $this->model = new Login();
    }

    // ============================
    // LOGIN
    // ============================
    public function login($input)
    {
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';

        if (!$email || !$password) {
            return Response::error("Email dan password wajib diisi");
        }

        // Ambil user berdasarkan email
        $user = $this->model->getByEmail($email);
        if (!$user) {
            return Response::error("Email tidak ditemukan");
        }

        // Verifikasi password
        if ($password !== $user['password']) {
            return Response::error("Password salah");
        }

        // Jangan kirim password ke frontend
        unset($user['password']);

        return Response::success([
            "message" => "Login berhasil",
            "user" => $user
        ]);
    }


    // ============================
    // LOGOUT
    // ============================

}
