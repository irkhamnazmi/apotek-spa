<?php
require_once __DIR__ . "/../models/Users.php";
require_once __DIR__ . "/../helpers/Response.php";

class UsersController
{
    private $model;
    public function __construct()
    {
        $this->model = new Users();
    }

    public function index()
    {
        Response::success($this->model->getAll());
    }
    public function show($id)
    {
        $data = $this->model->getById($id);
        $data ? Response::success($data) : Response::error("User tidak ditemukan");
    }
    public function store($input)
    {
        $this->model->create($input) ? Response::success([], "User berhasil ditambahkan") : Response::error("Gagal menambahkan user");
    }
    public function update($id, $input)
    {
        $this->model->update($id, $input) ? Response::success([], "User berhasil diupdate") : Response::error("Gagal update user");
    }
    public function destroy($id)
    {
        $this->model->delete($id) ? Response::success([], "User berhasil dihapus") : Response::error("Gagal hapus user");
    }
}
