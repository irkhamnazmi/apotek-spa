<?php
require_once __DIR__ . "/../models/Kasir.php";
require_once __DIR__ . "/../helpers/Response.php";

class KasirController
{
    private $model;
    public function __construct()
    {
        $this->model = new Kasir();
    }

    public function index()
    {
        Response::success($this->model->getAll());
    }
    public function show($id)
    {
        $data = $this->model->getById($id);
        $data ? Response::success($data) : Response::error("Kasir tidak ditemukan");
    }
    public function store($input)
    {
        $this->model->create($input) ? Response::success([], "Kasir berhasil ditambahkan") : Response::error("Gagal menambahkan kasir");
    }
    public function update($id, $input)
    {
        $this->model->update($id, $input) ? Response::success([], "Kasir berhasil diupdate") : Response::error("Gagal update kasir");
    }
    public function destroy($id)
    {
        $this->model->delete($id) ? Response::success([], "Kasir berhasil dihapus") : Response::error("Gagal hapus kasir");
    }
}
