<?php
require_once __DIR__ . "/../models/JenisPembayaran.php";
require_once __DIR__ . "/../helpers/Response.php";

class JenisPembayaranController
{
    private $model;
    public function __construct()
    {
        $this->model = new JenisPembayaran();
    }

    public function index()
    {
        Response::success($this->model->getAll());
    }
    public function show($id)
    {
        $data = $this->model->getById($id);
        $data ? Response::success($data) : Response::error("Data tidak ditemukan");
    }
    public function store($input)
    {
        $this->model->create($input) ? Response::success([], "Data berhasil ditambahkan") : Response::error("Gagal menambahkan data");
    }
    public function update($id, $input)
    {
        $this->model->update($id, $input) ? Response::success([], "Data berhasil diupdate") : Response::error("Gagal update data");
    }
    public function destroy($id)
    {
        $this->model->delete($id) ? Response::success([], "Data berhasil dihapus") : Response::error("Gagal hapus data");
    }
}
